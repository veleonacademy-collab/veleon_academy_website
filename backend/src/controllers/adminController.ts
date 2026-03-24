import type { Request, Response, NextFunction } from "express";
import { getDashboardStats } from "../services/adminService.js";
import { sendBulkMessage } from "../services/emailService.js";

// Fetches real administrative statistics for the dashboard.
export async function getAdminStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function sendBulkMessageController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { recipients, subject, body } = req.body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !subject || !body) {
      res.status(400).json({ error: "Missing required fields: recipients, subject, body." });
      return;
    }

    const validRecipients = recipients.filter((r) => r.email && typeof r.email === "string");
    
    if (validRecipients.length === 0) {
      res.status(400).json({ error: "No valid recipients found." });
      return;
    }

    const { successCount, failedCount } = await sendBulkMessage(validRecipients, subject, body);
    
    res.json({ message: `Sent ${successCount} emails. Failed: ${failedCount}.`, successCount, failedCount });
  } catch (err) {
    next(err);
  }
}
