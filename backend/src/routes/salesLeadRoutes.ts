import { Router } from "express";
import { captureSalesLead, getSalesLeads } from "../controllers/salesLeadController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

export const salesLeadRouter = Router();

// Public route to capture leads from the sales landing page enrollment form
salesLeadRouter.post("/", captureSalesLead);

// Admin route to view all sales leads
salesLeadRouter.get("/", authenticate, requireRole(["admin"]), getSalesLeads);
