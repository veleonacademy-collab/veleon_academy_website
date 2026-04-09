import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
import { CreateWebinarLeadPayload } from "../models/webinarLead.js";

export class WebinarService {
  /**
   * Captures a lead from the webinar landing page
   */
  static async captureLead(payload: CreateWebinarLeadPayload) {
    try {
      const { name, email, phone, topic, cohort } = payload;
      
      const result = await pool.query(
        `INSERT INTO webinar_leads (name, email, phone, topic, cohort)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [name, email, phone, topic, cohort]
      );
      
      const leadId = result.rows[0].id;
      logger.info(`New webinar lead captured: ${email} for ${topic} (${cohort})`);

      // 📧 Send Personalized Confirmation Email
      const { sendWebinarConfirmationEmail } = await import("./emailService.js");
      const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/DDZgPPNTfKE0yvlAD3WQOD"; // Should match frontend
      
      // Fire and forget email to not block response
      sendWebinarConfirmationEmail(email, name.split(' ')[0], topic, WHATSAPP_GROUP_LINK)
        .catch(err => logger.error(`Failed to send webinar confirmation email to ${email}:`, err));

      return leadId;
    } catch (error) {
      logger.error("Error capturing webinar lead:", error);
      throw error;
    }
  }

  /**
   * Gets all webinar leads (for admin use later)
   */
  static async getAllLeads() {
    const result = await pool.query("SELECT * FROM webinar_leads ORDER BY created_at DESC");
    return result.rows;
  }
}
