import { Router } from "express";
import { captureWebinarLead, getWebinarLeads } from "../controllers/webinarController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

export const webinarRouter = Router();

// Public route to capture leads from the landing page
webinarRouter.post("/leads", captureWebinarLead);

// Admin route to view leads
webinarRouter.get("/leads", authenticate, requireRole(["admin"]), getWebinarLeads);
