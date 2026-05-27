import type { Request, Response, NextFunction } from "express";
import { SalesLeadService } from "../services/salesLeadService.js";

export async function captureSalesLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, whatsapp, selectedTrack, paymentTerm, amountDue } = req.body;

    if (!name || !email || !whatsapp || !selectedTrack || !paymentTerm) {
      res.status(400).json({ error: "Missing required fields (name, email, whatsapp, selectedTrack, paymentTerm)" });
      return;
    }

    const validTracks = ["full", "excel_only"];
    const validTerms = ["full", "installment"];

    if (!validTracks.includes(selectedTrack)) {
      res.status(400).json({ error: "Invalid selectedTrack. Must be 'full' or 'excel_only'" });
      return;
    }

    if (!validTerms.includes(paymentTerm)) {
      res.status(400).json({ error: "Invalid paymentTerm. Must be 'full' or 'installment'" });
      return;
    }

    const leadId = await SalesLeadService.captureLead({
      name,
      email,
      whatsapp,
      selectedTrack,
      paymentTerm,
      amountDue: amountDue || 0
    });

    res.status(201).json({
      success: true,
      message: "Sales lead captured successfully",
      leadId
    });
  } catch (err) {
    next(err);
  }
}

export async function getSalesLeads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const leads = await SalesLeadService.getAllLeads();
    res.json(leads);
  } catch (err) {
    next(err);
  }
}
