import type { Request, Response, NextFunction } from "express";
import { SalesLeadService } from "../services/salesLeadService.js";

export async function captureSalesLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, name, email, whatsapp, selectedTrack, paymentTerm, amountDue, referralCode, leadSource } = req.body;

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
      id: id ? Number(id) : undefined,
      name,
      email,
      whatsapp,
      selectedTrack,
      paymentTerm,
      amountDue: amountDue || 0,
      referralCode: referralCode || null,
      leadSource: leadSource || (referralCode ? 'growth_partner' : 'direct')
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

export async function onboardSalesLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { courseId, paymentPlan, customPrice, amountPaid, installmentsTotal, cohort, nextPaymentDue } = req.body;

    if (!courseId || !paymentPlan || customPrice === undefined || amountPaid === undefined) {
      res.status(400).json({ error: "Missing required fields (courseId, paymentPlan, customPrice, amountPaid)" });
      return;
    }

    const leadId = parseInt(id);
    if (isNaN(leadId)) {
      res.status(400).json({ error: "Invalid lead ID" });
      return;
    }

    const result = await SalesLeadService.onboardLead(leadId, {
      courseId: parseInt(courseId),
      paymentPlan,
      customPrice: parseFloat(customPrice),
      amountPaid: parseFloat(amountPaid),
      installmentsTotal: installmentsTotal ? parseInt(installmentsTotal) : undefined,
      cohort,
      nextPaymentDue
    });

    res.json({
      success: true,
      message: "Lead onboarded successfully",
      ...result
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Failed to onboard lead" });
  }
}
