import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getPartnerDashboard,
  joinPartner,
  registerPartner,
  partnerGoogleOAuth,
} from "../controllers/partnerController.js";

export const partnerRouter = Router();

// Public routes — sign up / Google OAuth as a partner
partnerRouter.post("/register", registerPartner);
partnerRouter.post("/oauth/google", partnerGoogleOAuth);

// Protected routes — requires login
partnerRouter.get("/dashboard", authenticate, getPartnerDashboard);
partnerRouter.post("/join", authenticate, joinPartner);
