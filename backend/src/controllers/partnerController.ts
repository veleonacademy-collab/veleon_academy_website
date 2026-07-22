import type { Request, Response, NextFunction } from "express";
import { pool } from "../database/pool.js";
import { joinPartnerProgram, registerPartnerUser } from "../services/authService.js";
import { loginWithGoogle } from "../services/oauthService.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { toPublicUser } from "../models/user.js";
import type { User } from "../models/user.js";

const COMMISSION_PER_STUDENT = 5000;

const MILESTONES = [
  { students: 5,  bonus: 5000,   extras: ["Official Veleon Growth Partner Certificate"] },
  { students: 10, bonus: 15000,  extras: ["Free Access To The Veleon Data Analytics Career Accelerator"] },
  { students: 20, bonus: 40000,  extras: ["Gold Partner Status", "Featured Recognition On Veleon Social Media"] },
  { students: 30, bonus: 75000,  extras: ["VIP Recognition"] },
  { students: 50, bonus: 150000, extras: ["Elite Partner Status"] },
];

export async function getPartnerDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const userId = req.user.id;

    // Fetch partner profile with phone from customers
    const partnerRes = await pool.query(
      `SELECT u.*, c.phone 
       FROM users u 
       LEFT JOIN customers c ON u.customer_id = c.id 
       WHERE u.id = $1`,
      [userId]
    );
    const partner = partnerRes.rows[0];

    if (!partner || !partner.referral_code) {
      res.status(403).json({ message: "You are not a Growth Partner yet. Please join the program first." });
      return;
    }

    // Fetch clicks count
    const clicksRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM referral_clicks WHERE partner_id = $1",
      [userId]
    );
    const totalClicks = clicksRes.rows[0].count;

    // Fetch leads count (referred users in users table)
    const leadsRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM users WHERE referred_by_id = $1",
      [userId]
    );
    const totalLeads = leadsRes.rows[0].count;

    // Fetch all enrollments referred by this partner
    const enrollmentsRes = await pool.query(
      `SELECT 
         e.id,
         e.cohort,
         e.created_at,
         e.status,
         u.first_name,
         u.last_name,
         u.email,
         c.title AS course_title
       FROM enrollments e
       JOIN users u ON e.student_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE e.referred_by_id = $1
       ORDER BY e.created_at DESC`,
      [userId]
    );

    const referrals = enrollmentsRes.rows;
    const totalReferrals = referrals.length; // Enrollments
    const totalCommission = totalReferrals * COMMISSION_PER_STUDENT;

    // Milestone progress
    const nextMilestone = MILESTONES.find(m => m.students > totalReferrals) || null;
    const achievedMilestones = MILESTONES.filter(m => m.students <= totalReferrals);
    const totalBonuses = achievedMilestones.reduce((sum, m) => sum + m.bonus, 0);
    const totalEarnings = totalCommission + totalBonuses;

    // Cohort breakdown
    const cohortMap: Record<string, { cohort: string; referrals: number; earnings: number }> = {};
    for (const r of referrals) {
      const key = r.cohort || "Unassigned";
      if (!cohortMap[key]) {
        cohortMap[key] = { cohort: key, referrals: 0, earnings: 0 };
      }
      cohortMap[key].referrals++;
      cohortMap[key].earnings += COMMISSION_PER_STUDENT;
    }
    const cohortBreakdown = Object.values(cohortMap);

    const appUrl = process.env.APP_URL || "https://veleonacademy.com";
    const referralLink = `${appUrl}/data?ref=${partner.referral_code}`;
    const dataAnalysisLink = `${appUrl}/enroll/data-analytics?ref=${partner.referral_code}`;

    // Get active campaigns performance for this partner
    const campaignStatsRes = await pool.query(
      `SELECT 
         c.id AS campaign_id,
         c.title AS campaign_title,
         COUNT(DISTINCT rc.id)::int AS clicks,
         COUNT(DISTINCT e.id)::int AS enrollments
       FROM campaigns c
       LEFT JOIN referral_clicks rc ON rc.campaign_id = c.id AND rc.partner_id = $1
       LEFT JOIN enrollments e ON e.referred_by_id = $1 AND e.created_at >= c.created_at
       WHERE c.is_active = true
       GROUP BY c.id, c.title`,
      [userId]
    );

    res.json({
      partner: {
        id: partner.id,
        firstName: partner.first_name,
        lastName: partner.last_name,
        email: partner.email,
        phone: partner.phone || null,
        referralCode: partner.referral_code,
        referralLink,
        dataAnalysisLink,
      },
      stats: {
        totalClicks,
        totalLeads,
        totalReferrals,
        totalCommission,
        totalBonuses,
        totalEarnings,
      },
      milestones: MILESTONES.map(m => ({
        ...m,
        achieved: m.students <= totalReferrals,
        progress: Math.min(totalReferrals, m.students),
      })),
      nextMilestone,
      cohortBreakdown,
      campaignStats: campaignStatsRes.rows,
      referrals: referrals.map(r => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        courseTitle: r.course_title,
        cohort: r.cohort || "Unassigned",
        status: r.status,
        enrolledAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function joinPartner(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    const user = await joinPartnerProgram(req.user.id);
    res.json({ user, message: "Welcome to the Veleon Growth Partner Program!" });
  } catch (err) {
    next(err);
  }
}

export async function registerPartner(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, verificationToken } = await registerPartnerUser(req.body);
    const appUrl = process.env.APP_URL || "";
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id, user.role);

    await pool.query(
      "UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2",
      [refreshToken, user.id]
    );

    res.status(201).json({
      message: "Registration successful. Welcome to the Veleon Growth Partner Program!",
      user,
      tokens: { accessToken, refreshToken },
      verificationLink,
    });
  } catch (err) {
    next(err);
  }
}

export async function partnerGoogleOAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, accessToken, refreshToken } = await loginWithGoogle({
      ...req.body,
      isPartner: true,
    });
    res.json({ user, tokens: { accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

// Record a click on a partner's referral link
export async function recordPartnerClick(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { referralCode, campaignId, copyId } = req.body;
    if (!referralCode) {
      res.status(400).json({ message: "Referral code is required." });
      return;
    }

    const partnerRes = await pool.query(
      "SELECT id FROM users WHERE referral_code = $1",
      [referralCode]
    );
    const partner = partnerRes.rows[0];
    if (!partner) {
      res.status(404).json({ message: "Invalid referral code." });
      return;
    }

    await pool.query(
      `INSERT INTO referral_clicks (partner_id, campaign_id, copy_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        partner.id,
        campaignId ? Number(campaignId) : null,
        copyId ? Number(copyId) : null,
        req.ip,
        req.headers["user-agent"] || null
      ]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// Get campaigns with copies and templates for partners
export async function getPartnerCampaigns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const campaignsRes = await pool.query(
      "SELECT * FROM campaigns WHERE is_active = true ORDER BY created_at DESC"
    );
    const campaigns = campaignsRes.rows;

    for (const c of campaigns) {
      const copiesRes = await pool.query(
        "SELECT * FROM copies WHERE campaign_id = $1 ORDER BY created_at ASC",
        [c.id]
      );
      const copies = copiesRes.rows;

      for (const cp of copies) {
        const msgsRes = await pool.query(
          "SELECT * FROM copy_messages WHERE copy_id = $1 ORDER BY created_at ASC",
          [cp.id]
        );
        cp.messages = msgsRes.rows;
      }
      c.copies = copies;
    }

    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

// Get all campaigns for admin (both active & inactive)
export async function getAdminCampaigns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const campaignsRes = await pool.query(
      "SELECT * FROM campaigns ORDER BY created_at DESC"
    );
    const campaigns = campaignsRes.rows;

    for (const c of campaigns) {
      const copiesRes = await pool.query(
        "SELECT * FROM copies WHERE campaign_id = $1 ORDER BY created_at ASC",
        [c.id]
      );
      const copies = copiesRes.rows;

      for (const cp of copies) {
        const msgsRes = await pool.query(
          "SELECT * FROM copy_messages WHERE copy_id = $1 ORDER BY created_at ASC",
          [cp.id]
        );
        cp.messages = msgsRes.rows;
      }
      c.copies = copies;
    }

    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

// Campaign CRUD
export async function createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, description, isActive } = req.body;
    const result = await pool.query(
      "INSERT INTO campaigns (title, description, is_active) VALUES ($1, $2, $3) RETURNING *",
      [title, description, isActive !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    const result = await pool.query(
      "UPDATE campaigns SET title = $1, description = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING *",
      [title, description, isActive, Number(id)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM campaigns WHERE id = $1", [Number(id)]);
    res.json({ message: "Campaign deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// Copy CRUD
export async function createCopy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId } = req.params;
    const { title, flyerUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO copies (campaign_id, title, flyer_url) VALUES ($1, $2, $3) RETURNING *",
      [Number(campaignId), title, flyerUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateCopy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, flyerUrl } = req.body;
    const result = await pool.query(
      "UPDATE copies SET title = $1, flyer_url = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [title, flyerUrl, Number(id)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteCopy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM copies WHERE id = $1", [Number(id)]);
    res.json({ message: "Copy deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// Copy Message CRUD
export async function createMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { copyId } = req.params;
    const { categoryName, messageText } = req.body;
    const result = await pool.query(
      "INSERT INTO copy_messages (copy_id, category_name, message_text) VALUES ($1, $2, $3) RETURNING *",
      [Number(copyId), categoryName, messageText]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function updateMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { categoryName, messageText } = req.body;
    const result = await pool.query(
      "UPDATE copy_messages SET category_name = $1, message_text = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [categoryName, messageText, Number(id)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM copy_messages WHERE id = $1", [Number(id)]);
    res.json({ message: "Message deleted successfully." });
  } catch (err) {
    next(err);
  }
}

// Admin get all partner metrics
export async function getAdminPartnersPerformance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = `
      SELECT 
        u.id, 
        u.first_name AS "firstName", 
        u.last_name AS "lastName", 
        u.email, 
        u.referral_code AS "referralCode",
        u.created_at AS "createdAt",
        (SELECT COUNT(*)::int FROM referral_clicks rc WHERE rc.partner_id = u.id) AS clicks,
        (SELECT COUNT(*)::int FROM users lu WHERE lu.referred_by_id = u.id) AS leads,
        (SELECT COUNT(*)::int FROM enrollments e WHERE e.referred_by_id = u.id) AS enrollments
      FROM users u
      WHERE u.referral_code IS NOT NULL
      ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query);
    const partners = result.rows.map(row => {
      const totalCommission = row.enrollments * COMMISSION_PER_STUDENT;
      const achievedMilestones = MILESTONES.filter(m => m.students <= row.enrollments);
      const totalBonuses = achievedMilestones.reduce((sum, m) => sum + m.bonus, 0);
      const totalEarnings = totalCommission + totalBonuses;

      return {
        ...row,
        commission: totalCommission,
        bonuses: totalBonuses,
        totalEarnings,
      };
    });

    res.json(partners);
  } catch (err) {
    next(err);
  }
}
