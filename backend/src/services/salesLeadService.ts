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
      const { name, email, whatsapp, selectedTrack, paymentTerm, amountDue } = payload;

      const result = await pool.query(
        `INSERT INTO sales_leads (name, email, whatsapp, selected_track, payment_term, amount_due)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, email, whatsapp, selectedTrack, paymentTerm, amountDue]
      );

      const leadId = result.rows[0].id;
      logger.info(`New sales lead captured: ${email} | Track: ${selectedTrack} | Term: ${paymentTerm} | Amount: ${amountDue}`);

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

    // 2. Find or create user
    let userId: number;
    const userRes = await pool.query("SELECT id, first_name FROM users WHERE email = $1", [email]);

    if (userRes.rows.length === 0) {
      // Auto-create student account
      logger.info(`Creating student account for ${email} during manual onboarding...`);
      const tempPassword = randomBytes(4).toString("hex"); // 8 chars
      const passwordHash = await hashPassword(tempPassword);

      const newUser = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, is_email_verified)
         VALUES ($1, $2, $3, $4, 'student', true) RETURNING id`,
        [firstName, lastName, email, passwordHash]
      );
      userId = newUser.rows[0].id;

      // Send welcome email (non-blocking)
      sendStudentWelcomeEmail(email, tempPassword, firstName).catch((err) => {
        logger.error(`Failed to send welcome email to ${email}: ${err}`);
      });
    } else {
      userId = userRes.rows[0].id;
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
