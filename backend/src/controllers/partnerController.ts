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

    // Fetch partner profile
    const partnerRes = await pool.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    const partner = partnerRes.rows[0];

    if (!partner || !partner.referral_code) {
      res.status(403).json({ message: "You are not a Growth Partner yet. Please join the program first." });
      return;
    }

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
    const totalReferrals = referrals.length;
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

    res.json({
      partner: {
        id: partner.id,
        firstName: partner.first_name,
        lastName: partner.last_name,
        email: partner.email,
        referralCode: partner.referral_code,
        referralLink,
        dataAnalysisLink,
      },
      stats: {
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
