import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
import { CreateSalesLeadPayload } from "../models/salesLead.js";

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
}
