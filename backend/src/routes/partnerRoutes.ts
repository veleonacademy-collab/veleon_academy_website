import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getPartnerDashboard,
  joinPartner,
  registerPartner,
  partnerGoogleOAuth,
  recordPartnerClick,
  getPartnerCampaigns,
  getAdminCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createCopy,
  updateCopy,
  deleteCopy,
  createMessage,
  updateMessage,
  deleteMessage,
  getAdminPartnersPerformance,
} from "../controllers/partnerController.js";

export const partnerRouter = Router();

// Public routes
partnerRouter.post("/click", recordPartnerClick);
partnerRouter.post("/register", registerPartner);
partnerRouter.post("/oauth/google", partnerGoogleOAuth);

// Partner routes — requires login
partnerRouter.get("/dashboard", authenticate, getPartnerDashboard);
partnerRouter.post("/join", authenticate, joinPartner);
partnerRouter.get("/campaigns", authenticate, getPartnerCampaigns);

// Admin routes — requires admin role
partnerRouter.get("/admin/campaigns", authenticate, requireRole(["admin"]), getAdminCampaigns);
partnerRouter.post("/admin/campaigns", authenticate, requireRole(["admin"]), createCampaign);
partnerRouter.put("/admin/campaigns/:id", authenticate, requireRole(["admin"]), updateCampaign);
partnerRouter.delete("/admin/campaigns/:id", authenticate, requireRole(["admin"]), deleteCampaign);

partnerRouter.post("/admin/campaigns/:campaignId/copies", authenticate, requireRole(["admin"]), createCopy);
partnerRouter.put("/admin/copies/:id", authenticate, requireRole(["admin"]), updateCopy);
partnerRouter.delete("/admin/copies/:id", authenticate, requireRole(["admin"]), deleteCopy);

partnerRouter.post("/admin/copies/:copyId/messages", authenticate, requireRole(["admin"]), createMessage);
partnerRouter.put("/admin/messages/:id", authenticate, requireRole(["admin"]), updateMessage);
partnerRouter.delete("/admin/messages/:id", authenticate, requireRole(["admin"]), deleteMessage);

partnerRouter.get("/admin/partners-performance", authenticate, requireRole(["admin"]), getAdminPartnersPerformance);

