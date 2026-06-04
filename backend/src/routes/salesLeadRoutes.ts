import { Router } from "express";
import { captureSalesLead, getSalesLeads, onboardSalesLead } from "../controllers/salesLeadController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

export const salesLeadRouter = Router();

// Public route to capture leads from the sales landing page enrollment form
salesLeadRouter.post("/", captureSalesLead);

// Admin route to view all sales leads
salesLeadRouter.get("/", authenticate, requireRole(["admin"]), getSalesLeads);

// Admin route to manually onboard a lead
salesLeadRouter.post("/:id/onboard", authenticate, requireRole(["admin"]), onboardSalesLead);
