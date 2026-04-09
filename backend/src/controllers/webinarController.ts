import type { Request, Response, NextFunction } from "express";
import { WebinarService } from "../services/webinarService.js";

export async function captureWebinarLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, phone, topic, cohort } = req.body;
    
    if (!name || !email || !phone) {
      res.status(400).json({ error: "Missing required fields (name, email, phone)" });
      return;
    }

    const leadId = await WebinarService.captureLead({
      name,
      email,
      phone,
      topic: topic || "Data Analytics",
      cohort: cohort || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    });

    res.status(201).json({ 
      success: true, 
      message: "Lead captured successfully", 
      leadId 
    });
  } catch (err) {
    next(err);
  }
}

export async function getWebinarLeads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const leads = await WebinarService.getAllLeads();
    res.json(leads);
  } catch (err) {
    next(err);
  }
}
