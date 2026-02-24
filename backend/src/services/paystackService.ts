import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env.js";
import { CreateCheckoutSessionOptions, PaymentProvider } from "./payment/types.js";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
import { AcademyService } from "./academyService.js";
import { sendStudentWelcomeEmail } from "./emailService.js";
import { hashPassword } from "../utils/password.js";
import { randomBytes } from "crypto";

export class PaystackService implements PaymentProvider {
  private readonly baseUrl = "https://api.paystack.co";

  async createCustomer(email: string, metadata?: Record<string, any>): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/customer`,
      { email, metadata },
      {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      }
    );
    return response.data.data.customer_code;
  }

  async createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<{ id: string; url: string | null }> {
    const { email, amount, currency, type, planId, successUrl, metadata } = options;

    const payload = {
      email,
      amount: Math.round(amount * 100), // convert to kobo/cents
      currency: currency.toUpperCase(),
      callback_url: successUrl,
      metadata: {
        ...metadata,
        type,
        planId,
        itemId: options.itemId,
        userId: options.userId,
        deliveryAddress: options.deliveryAddress,
        notes: options.notes,
        quantity: options.quantity,
      },
    };

    try {
      const response = await axios.post(`${this.baseUrl}/transaction/initialize`, payload, {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      });

      return {
        id: response.data.data.reference,
        url: response.data.data.authorization_url,
      };
    } catch (error: any) {
      logger.error(`Paystack initialization failed: ${error.message}`);
      if (error.response) {
        logger.error(`Paystack response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    const hash = crypto
      .createHmac("sha512", env.paystack.webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid signature");
    }

    const event = payload.event;
    logger.info(`Processing Paystack event: ${event}`);

    switch (event) {
      case "charge.success":
        await this.handleChargeSuccess(payload.data);
        break;
      case "subscription.create":
        await this.handleSubscriptionCreate(payload.data);
        break;
      case "subscription.disable":
        await this.handleSubscriptionDisable(payload.data);
        break;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await axios.post(
      `${this.baseUrl}/subscription/disable`,
      { code: subscriptionId, token: "..." }, // Requires token usually or just code
      {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      }
    );
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/subscription/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
    });
    return response.data.data;
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    try {
      logger.info(`[PAYSTACK VERIFY] Starting verification for reference: ${reference}`);
      
      const response = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${env.paystack.secretKey}` },
      });

      const data = response.data.data;
      logger.info(`[PAYSTACK VERIFY] API Response - Status: ${data.status}, Amount: ${data.amount}, Currency: ${data.currency}`);
      logger.info(`[PAYSTACK VERIFY] Metadata: ${JSON.stringify(data.metadata)}`);
      
      if (data.status === 'success') {
        logger.info(`[PAYSTACK VERIFY] Transaction ${reference} verified successfully. Calling handleChargeSuccess...`);
        await this.handleChargeSuccess(data);
        logger.info(`[PAYSTACK VERIFY] handleChargeSuccess completed for ${reference}`);
        return true;
      } else {
        logger.warn(`[PAYSTACK VERIFY] Transaction ${reference} verification failed. Status: ${data.status}`);
        return false;
      }
    } catch (error: any) {
      logger.error(`[PAYSTACK VERIFY] Verification error for reference ${reference}: ${error.message}`);
      if (error.response) {
        logger.error(`[PAYSTACK VERIFY] Error response: ${JSON.stringify(error.response.data)}`);
      }
      return false;
    }
  }

  private async handleChargeSuccess(data: any) {
    logger.info(`[PAYSTACK CHARGE] Starting handleChargeSuccess for reference: ${data.reference}`);
    
    // Check if transaction already processed
    const existingTx = await pool.query(
        "SELECT id FROM transactions WHERE provider_payment_id = $1 AND provider = 'paystack' AND status = 'succeeded'",
        [data.reference]
    );
    if (existingTx.rows.length > 0) {
        logger.info(`[PAYSTACK CHARGE] Transaction ${data.reference} already processed. Skipping enrollment.`);
        return;
    }

    let metadata = data.metadata;
    if (typeof metadata === 'string') {
        try { metadata = JSON.parse(metadata); } catch(e) { 
            logger.warn(`[PAYSTACK CHARGE] Failed to parse metadata string: ${metadata}`);
        }
    }

    const email = data.customer.email;
    const amountPaid = data.amount / 100;
    const courseId = parseInt(metadata?.courseId || metadata?.itemId || "0");
    const paymentPlan = metadata?.paymentPlan || "one-time"; // 'one-time' or 'installment'
    const installmentsTotal = parseInt(metadata?.installmentsTotal || "1");
    
    if (!courseId) {
      logger.warn(`[PAYSTACK CHARGE] No courseId found in metadata for reference ${data.reference}. Skipping.`);
      return;
    }

    // 1. Handle User Account
    let userId: number;
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    
    if (userRes.rows.length === 0) {
      // Auto-create account
      logger.info(`[PAYSTACK CHARGE] User ${email} not found. Creating student account...`);
      const tempPassword = randomBytes(4).toString("hex"); // 8 chars
      const passwordHash = await hashPassword(tempPassword);
      
      const firstName = metadata?.firstName || "Student";
      const lastName = metadata?.lastName || "";

      const newUser = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, is_email_verified)
         VALUES ($1, $2, $3, $4, 'student', true) RETURNING id`,
        [firstName, lastName, email, passwordHash]
      );
      userId = newUser.rows[0].id;

      // Send Welcome Email
      try {
        await sendStudentWelcomeEmail(email, tempPassword, firstName);
      } catch (err) {
        logger.error(`[PAYSTACK CHARGE] Failed to send welcome email to ${email}: ${err}`);
      }
    } else {
      userId = userRes.rows[0].id;
    }

    // 2. Record Transaction
    const txResult = await pool.query(
      `INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id)
       VALUES ($1, $2, $3, 'succeeded', $4, 'paystack', $5, $5) RETURNING id`,
      [userId, amountPaid, data.currency, paymentPlan, data.reference]
    );
    const transactionId = txResult.rows[0].id;

    // 3. Enroll Student
    await AcademyService.enrollStudent({
      studentId: userId,
      courseId,
      paymentPlan: paymentPlan as "one-time" | "installment",
      amountPaid,
      installmentsTotal
    });

    // 4. Record installment if applicable
    if (paymentPlan === "installment") {
      // Count how many installments have already been paid for this course by this user
      const previousPayments = await pool.query(
        "SELECT COUNT(*) FROM transactions WHERE user_id = $1 AND status = 'succeeded' AND provider_payment_id != $2",
        [userId, data.reference]
      );
      const installmentNumber = parseInt(previousPayments.rows[0].count) + 1;

      await pool.query(
        `INSERT INTO installments (transaction_id, installment_number, total_installments, amount, due_date, status, provider_payment_id)
         VALUES ($1, $2, $3, $4, NOW(), 'paid', $5)`,
        [transactionId, installmentNumber, installmentsTotal, amountPaid, data.reference]
      );
    }

    logger.info(`[PAYSTACK CHARGE] handleChargeSuccess completed for reference: ${data.reference}`);
  }

  private async handleSubscriptionCreate(data: any) {
    // Similar to Stripe logic
  }

  private async handleSubscriptionDisable(data: any) {
    // Similar to Stripe logic
  }
}
