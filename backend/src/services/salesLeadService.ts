import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
import { CreateSalesLeadPayload } from "../models/salesLead.js";
import { hashPassword } from "../utils/password.js";
import { randomBytes } from "crypto";
import { sendStudentWelcomeEmail, sendEnrollmentConfirmationEmail, sendPaymentReceiptEmail } from "./emailService.js";
import { AcademyService } from "./academyService.js";

export class SalesLeadService {
  /**
   * Captures a lead from the sales landing page enrollment form
   */
  static async captureLead(payload: CreateSalesLeadPayload) {
    try {
      const { id, name, email, whatsapp, selectedTrack, paymentTerm, amountDue, referralCode, leadSource } = payload;
      const trimmedEmail = email.trim();
      const resolvedRef = referralCode || null;
      const resolvedSource = leadSource || (referralCode ? 'growth_partner' : 'direct');

      // 1. If explicit lead ID is provided, update that lead row
      if (id) {
        const idCheck = await pool.query("SELECT id FROM sales_leads WHERE id = $1", [id]);
        if (idCheck.rows.length > 0) {
          await pool.query(
            `UPDATE sales_leads
             SET name = $1,
                 email = $2,
                 whatsapp = $3,
                 selected_track = $4,
                 payment_term = $5,
                 amount_due = $6,
                 referral_code = COALESCE($7, referral_code),
                 lead_source = COALESCE($8, lead_source)
             WHERE id = $9`,
            [name, trimmedEmail, whatsapp, selectedTrack, paymentTerm, amountDue, resolvedRef, resolvedSource, id]
          );
          logger.info(`Sales lead ID ${id} updated for ${trimmedEmail}`);
          return id;
        }
      }

      // 2. Check if a lead with this email already exists to prevent duplicate rows & lead counts
      const existingRes = await pool.query(
        "SELECT id FROM sales_leads WHERE LOWER(email) = LOWER($1) ORDER BY id DESC LIMIT 1",
        [trimmedEmail]
      );

      if (existingRes.rows.length > 0) {
        const existingId = existingRes.rows[0].id;
        await pool.query(
          `UPDATE sales_leads
           SET name = $1,
               whatsapp = $2,
               selected_track = $3,
               payment_term = $4,
               amount_due = $5,
               referral_code = COALESCE($6, referral_code),
               lead_source = COALESCE($7, lead_source)
           WHERE id = $8`,
          [name, whatsapp, selectedTrack, paymentTerm, amountDue, resolvedRef, resolvedSource, existingId]
        );
        logger.info(`Sales lead updated for existing email ${trimmedEmail} (ID: ${existingId})`);
        return existingId;
      }

      // 3. Otherwise insert a new lead record
      const result = await pool.query(
        `INSERT INTO sales_leads (name, email, whatsapp, selected_track, payment_term, amount_due, referral_code, lead_source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [name, trimmedEmail, whatsapp, selectedTrack, paymentTerm, amountDue, resolvedRef, resolvedSource]
      );

      const leadId = result.rows[0].id;
      logger.info(`New sales lead captured: ${trimmedEmail} | Track: ${selectedTrack} | Term: ${paymentTerm} | Amount: ${amountDue} | Ref: ${resolvedRef || 'None'}`);

      return leadId;
    } catch (error) {
      logger.error("Error capturing sales lead:", error);
      throw error;
    }
  }

  /**
   * Gets all sales leads (for admin dashboard)
   */
  static async getAllLeads() {
    const result = await pool.query("SELECT * FROM sales_leads ORDER BY created_at DESC");
    return result.rows;
  }

  /**
   * Manually onboard a sales lead into the portal
   */
  static async onboardLead(leadId: number, options: {
    courseId: number;
    paymentPlan: "one-time" | "installment";
    customPrice: number;
    amountPaid: number;
    installmentsTotal?: number;
    cohort?: string;
    nextPaymentDue?: string;
  }) {
    const { courseId, paymentPlan, customPrice, amountPaid, installmentsTotal = 1, cohort, nextPaymentDue } = options;

    logger.info(`Onboarding sales lead ${leadId} with courseId: ${courseId}, plan: ${paymentPlan}, price: ${customPrice}, paid: ${amountPaid}`);

    // 1. Fetch sales lead details
    const leadRes = await pool.query("SELECT * FROM sales_leads WHERE id = $1", [leadId]);
    const lead = leadRes.rows[0];

    if (!lead) {
      throw new Error("Sales lead not found");
    }

    if (lead.is_onboarded) {
      throw new Error("Sales lead is already onboarded");
    }

    const email = lead.email;
    const nameParts = lead.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "Student";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Check if sales lead has referral code and resolve partner ID
    let partnerId: number | null = null;
    if (lead.referral_code) {
      const partnerRes = await pool.query("SELECT id FROM users WHERE referral_code = $1", [lead.referral_code]);
      if (partnerRes.rows.length > 0) {
        partnerId = partnerRes.rows[0].id;
      }
    }

    // 2. Find or create user
    let userId: number;
    const userRes = await pool.query("SELECT id, first_name FROM users WHERE email = $1", [email]);

    if (userRes.rows.length === 0) {
      // Auto-create student account
      logger.info(`Creating student account for ${email} during manual onboarding...`);
      const tempPassword = randomBytes(4).toString("hex"); // 8 chars
      const passwordHash = await hashPassword(tempPassword);

      const newUser = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, is_email_verified, referred_by_id)
         VALUES ($1, $2, $3, $4, 'student', true, $5) RETURNING id`,
        [firstName, lastName, email, passwordHash, partnerId]
      );
      userId = newUser.rows[0].id;

      // Send welcome email (non-blocking)
      sendStudentWelcomeEmail(email, tempPassword, firstName).catch((err) => {
        logger.error(`Failed to send welcome email to ${email}: ${err}`);
      });
    } else {
      userId = userRes.rows[0].id;
      if (partnerId) {
        await pool.query(
          "UPDATE users SET referred_by_id = COALESCE(referred_by_id, $1), updated_at = NOW() WHERE id = $2",
          [partnerId, userId]
        );
      }
    }

    // 3. Record Transaction (marked as succeeded, manually recorded by admin)
    const providerPaymentId = `manual-sales-${leadId}-${Date.now()}`;
    const txResult = await pool.query(
      `INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id)
       VALUES ($1, $2, 'NGN', 'succeeded', $3, 'manual', $4, $4) RETURNING id`,
      [userId, amountPaid, paymentPlan, providerPaymentId]
    );
    const transactionId = txResult.rows[0].id;

    // 4. Enroll Student
    const enrollmentId = await AcademyService.enrollStudent({
      studentId: userId,
      courseId,
      paymentPlan,
      amountPaid,
      installmentsTotal,
      customPrice,
      cohort,
      nextPaymentDue
    });

    // 5. If installment, log the initial installment as paid, and setup subsequent installments
    if (paymentPlan === "installment") {
      // Mark first installment as paid
      await pool.query(
        `INSERT INTO installments (transaction_id, installment_number, total_installments, amount, due_date, status, provider_payment_id)
         VALUES ($1, 1, $2, $3, NOW(), 'paid', $4)`,
        [transactionId, installmentsTotal, amountPaid, providerPaymentId]
      );

      // Create remaining pending installments in DB spread over remaining 90 days
      const remainingInstallments = installmentsTotal - 1;
      if (remainingInstallments > 0) {
        const remainingAmount = customPrice - amountPaid;
        const perInstallmentAmount = remainingAmount / remainingInstallments;
        const daysPerInstallment = Math.floor(90 / installmentsTotal);

        for (let i = 2; i <= installmentsTotal; i++) {
          const dueDate = new Date();
          if (i === 2 && nextPaymentDue) {
            // First pending installment due on the specified custom date
            dueDate.setTime(Date.parse(nextPaymentDue));
          } else {
            dueDate.setDate(dueDate.getDate() + (daysPerInstallment * (i - 1)));
          }

          await pool.query(
            `INSERT INTO installments (transaction_id, installment_number, total_installments, amount, due_date, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')`,
            [transactionId, i, installmentsTotal, perInstallmentAmount, dueDate]
          );
        }
      }
    }

    // 6. Update sales lead as onboarded
    await pool.query("UPDATE sales_leads SET is_onboarded = true WHERE id = $1", [leadId]);

    // 7. Send confirmation/receipt emails (non-blocking)
    const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [courseId]);
    const displayTitle = courseRes.rows[0]?.title || "Academy Track";

    sendPaymentReceiptEmail(email, firstName, amountPaid, 'NGN', displayTitle, providerPaymentId).catch(err => {
      logger.error(`Failed to send receipt email to ${email}: ${err}`);
    });
    sendEnrollmentConfirmationEmail(email, firstName, displayTitle).catch(err => {
      logger.error(`Failed to send enrollment email to ${email}: ${err}`);
    });

    logger.info(`Successfully onboarded lead ${leadId} (Student ID: ${userId}, Enrollment ID: ${enrollmentId})`);
    return { userId, enrollmentId };
  }
}
