import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Copy, ExternalLink, TrendingUp, Users, DollarSign, Trophy,
  CheckCircle, Clock, ChevronRight, LogOut, Menu, X, HelpCircle, Image, FileText
} from "lucide-react";
import { http } from "../api/http";
import { useAuth } from "../state/AuthContext";
import SEO from "../components/SEO";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const copyText = (text: string, label = "Copied!") => {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

const STATUS_COLOR: Record<string, string> = {
  enrolled:  "#16a34a",
  completed: "#2563eb",
  suspended: "#dc2626",
  dropped:   "#9ca3af",
};

/* ─── Scoped responsive styles ───────────────────────────────────────────── */
const DASHBOARD_STYLES = `
  * { box-sizing: border-box; }
  .pd-header-right { display: flex; gap: 8px; align-items: center; }
  .pd-hamburger { display: none; background: none; border: none; cursor: pointer; color: #374151; padding: 4px; }
  .pd-mobile-nav { display: none; flex-direction: column; gap: 4px; padding: 8px 12px 12px; border-bottom: 1px solid #f3f4f6; background: #fff; }
  .pd-mobile-nav.open { display: flex; }

  /* Single Card Stats layout */
  .pd-stats-single-card {
    background: #fff;
    border: 1.5px solid #f3f4f6;
    border-radius: 12px;
    padding: 10px 8px;
    margin-bottom: 12px;
    width: 100%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .pd-stats-row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }
  .pd-stat-item {
    flex: 1;
    min-width: 0;
    padding: 2px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .pd-stat-item:not(:last-child) {
    border-right: 1px solid #f3f4f6;
  }
  .pd-stat-lbl {
    font-size: 9px;
    font-weight: 800;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .pd-stat-val {
    font-size: 16px;
    font-weight: 900;
    color: #111827;
    line-height: 1.2;
    word-break: break-word;
    margin: 2px 0 1px;
  }
  .pd-stat-val.accent {
    color: #ea580c;
  }
  .pd-stat-sub {
    font-size: 8.5px;
    color: #9ca3af;
    font-weight: 600;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .pd-links-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; width: 100%; }
  .pd-referrals-table { display: block; }
  .pd-referrals-cards { display: none; }

  .pd-tabs-row {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    background: #f3f4f6;
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 14px;
    gap: 3px;
  }
  .pd-tab-btn {
    flex: 1;
    min-width: 0;
    padding: 7px 4px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    transition: all .2s;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  @media (max-width: 640px) {
    .pd-header-right { display: none; }
    .pd-hamburger { display: flex; align-items: center; justify-content: center; }

    .pd-stats-single-card { padding: 8px 4px; margin-bottom: 10px; }
    .pd-stat-item { padding: 2px 3px; }
    .pd-stat-lbl { font-size: 8.5px; }
    .pd-stat-val { font-size: 14px; }
    .pd-stat-sub { font-size: 8px; }

    .pd-links-grid { grid-template-columns: 1fr; gap: 8px; margin-bottom: 10px; }
    .pd-referrals-table { display: none; }
    .pd-referrals-cards { display: flex; flex-direction: column; gap: 8px; }

    .pd-tab-btn { font-size: 11px; padding: 6px 3px; }
  }

  @media (max-width: 380px) {
    .pd-stats-single-card { padding: 6px 2px; }
    .pd-stat-lbl { font-size: 8px; }
    .pd-stat-val { font-size: 13px; }
    .pd-stat-sub { display: none; }
    .pd-tab-btn { font-size: 10.5px; padding: 5px 2px; }
  }
`;

/* ─── Single Combined Stats Card ────────────────────────────────────────── */
const StatsSingleCard = ({ stats }: { stats: any }) => (
  <div className="pd-stats-single-card">
    <div className="pd-stats-row">
      <div className="pd-stat-item">
        <span className="pd-stat-lbl">Clicks</span>
        <div className="pd-stat-val">{stats.totalClicks}</div>
        <div className="pd-stat-sub">link views</div>
      </div>

      <div className="pd-stat-item">
        <span className="pd-stat-lbl">Leads</span>
        <div className="pd-stat-val">{stats.totalLeads}</div>
        <div className="pd-stat-sub">signups</div>
      </div>

      <div className="pd-stat-item">
        <span className="pd-stat-lbl">Enrolled</span>
        <div className="pd-stat-val accent">{stats.totalReferrals}</div>
        <div className="pd-stat-sub">paid students</div>
      </div>

      <div className="pd-stat-item">
        <span className="pd-stat-lbl">Commission</span>
        <div className="pd-stat-val accent">{fmt(stats.totalCommission)}</div>
        <div className="pd-stat-sub">earned</div>
      </div>
    </div>
  </div>
);

/* ─── Milestone Progress ─────────────────────────────────────────────────── */
const MILESTONES = [5, 10, 20, 30, 50];

const MilestoneBar = ({ total, milestones }: { total: number; milestones: any[] }) => {
  const nextIdx = milestones.findIndex((m: any) => !m.achieved);
  const next = milestones[nextIdx];

  return (
    <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "12px 14px", width: "100%", boxSizing: "border-box" }}>
      <h3 style={{ fontSize: 12, fontWeight: 800, color: "#111827", marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Milestone Progress
      </h3>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {MILESTONES.map(n => {
          const done = total >= n;
          return (
            <div key={n} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 5, borderRadius: 100, background: done ? "#f97316" : "#f3f4f6", marginBottom: 4 }} />
              <span style={{ fontSize: 9.5, fontWeight: 800, color: done ? "#ea580c" : "#9ca3af" }}>{n}</span>
            </div>
          );
        })}
      </div>
      {next && (
        <p style={{ fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.4 }}>
          <strong style={{ color: "#111827" }}>{next.students - total} more</strong> student{next.students - total !== 1 ? "s" : ""} to unlock next milestone — <strong style={{ color: "#ea580c" }}>+{fmt(next.bonus)}</strong>
        </p>
      )}
      {!next && <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, margin: 0 }}>🎉 All milestones achieved!</p>}
    </div>
  );
};

/* ─── Cohort Breakdown ───────────────────────────────────────────────────── */
const CohortTable = ({ rows }: { rows: any[] }) => (
  <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, overflow: "hidden", width: "100%", boxSizing: "border-box" }}>
    <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
      <h3 style={{ fontSize: 12, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Earnings By Cohort</h3>
    </div>
    {rows.length === 0 ? (
      <div style={{ padding: "24px 14px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No cohort data yet.</div>
    ) : (
      <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Cohort", "Referrals", "Commissions"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 800, fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#111827" }}>{r.cohort}</td>
                <td style={{ padding: "10px 12px", color: "#374151" }}>{r.referrals}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#ea580c" }}>{fmt(r.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ─── Referrals — Desktop Table ──────────────────────────────────────────── */
const ReferralsDesktopTable = ({ referrals }: { referrals: any[] }) => (
  <div className="pd-referrals-table" style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, overflow: "hidden" }}>
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Students Enrolled Through You</h3>
    </div>
    {referrals.length === 0 ? (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <Users size={32} style={{ color: "#d1d5db", marginBottom: 12 }} />
        <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No referrals yet. Start sharing your link!</p>
      </div>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Student", "Course", "Cohort", "Status", "Date", "Commission"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r: any) => (
              <tr key={r.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{r.firstName} {r.lastName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.email}</div>
                </td>
                <td style={{ padding: "11px 14px", color: "#374151", fontSize: 12 }}>{r.courseTitle}</td>
                <td style={{ padding: "11px 14px", color: "#374151", fontSize: 12 }}>{r.cohort}</td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[r.status] || "#9ca3af", background: `${STATUS_COLOR[r.status] || "#9ca3af"}18`, padding: "3px 8px", borderRadius: 100, textTransform: "capitalize" }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{fmtDate(r.enrolledAt)}</td>
                <td style={{ padding: "11px 14px", fontWeight: 800, color: "#f97316", whiteSpace: "nowrap" }}>₦5,000</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ─── Referrals — Mobile Cards ───────────────────────────────────────────── */
const ReferralsMobileCards = ({ referrals }: { referrals: any[] }) => (
  <div className="pd-referrals-cards">
    <div style={{ padding: "12px 0 6px", fontWeight: 800, fontSize: 12, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Students Enrolled Through You
    </div>
    {referrals.length === 0 ? (
      <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "24px 14px", textAlign: "center" }}>
        <Users size={24} style={{ color: "#d1d5db", marginBottom: 8 }} />
        <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No referrals yet. Start sharing your link!</p>
      </div>
    ) : (
      referrals.map((r: any) => (
        <div key={r.id} style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{r.firstName} {r.lastName}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.email}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: STATUS_COLOR[r.status] || "#9ca3af", background: `${STATUS_COLOR[r.status] || "#9ca3af"}18`, padding: "2px 6px", borderRadius: 100, textTransform: "capitalize", flexShrink: 0 }}>
              {r.status}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", fontSize: 11, color: "#6b7280" }}>
            <span>{r.courseTitle}</span>
            <span>· {r.cohort}</span>
            <span>· {fmtDate(r.enrolledAt)}</span>
          </div>
          <div style={{ marginTop: 6, fontWeight: 800, color: "#ea580c", fontSize: 12 }}>Commission: ₦5,000</div>
        </div>
      ))
    )}
  </div>
);

/* ─── Link Card ──────────────────────────────────────────────────────────── */
const LinkCard = ({ label, link, hint }: { label: string; link: string; hint: string }) => (
  <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "10px 12px", width: "100%", boxSizing: "border-box" }}>
    <div style={{ fontSize: 9, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 6, padding: "6px 8px", marginBottom: 6, minWidth: 0 }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: "#374151", wordBreak: "break-all", fontWeight: 600, lineHeight: 1.4 }}>{link}</span>
      <button onClick={() => copyText(link, "Link copied!")} style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "#ea580c", padding: "2px" }}>
        <Copy size={13} />
      </button>
      <a href={link} target="_blank" rel="noreferrer" style={{ flexShrink: 0, color: "#9ca3af", padding: "2px" }}>
        <ExternalLink size={13} />
      </a>
    </div>
    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>{hint}</p>
  </div>
);

/* ─── Join Prompt ────────────────────────────────────────────────────────── */
const JoinPrompt = () => {
  const { setAuth } = useAuth();
  const qc = useQueryClient();
  const joinMutation = useMutation({
    mutationFn: () => http.post<{ user: any }>("/partners/join").then(r => r.data),
    onSuccess: data => {
      toast.success("Welcome to the Partner Program!");
      setAuth(data.user, JSON.parse(localStorage.getItem("veleon_tokens") || "{}"));
      qc.invalidateQueries({ queryKey: ["partner-dashboard"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to join."),
  });

  return (
    <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 16, padding: "36px 24px", textAlign: "center", maxWidth: 460, margin: "60px auto" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#f97316" }}>
        <Trophy size={22} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Join the Partner Program</h2>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 26, lineHeight: 1.7 }}>
        You're logged in but haven't joined the Growth Partner Program yet. Click below to generate your referral code and start earning.
      </p>
      <button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}
        style={{ padding: "12px 28px", background: "#f97316", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: joinMutation.isPending ? "not-allowed" : "pointer", opacity: joinMutation.isPending ? 0.7 : 1, width: "100%" }}>
        {joinMutation.isPending ? "Joining..." : "Activate My Referral Code"}
      </button>
      <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 14 }}>
        <Link to="/partners" style={{ color: "#f97316", textDecoration: "none", fontWeight: 700 }}>Learn more</Link> about the program first
      </p>
    </div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
const PartnerDashboardPage: React.FC = () => {
  const { user, clearAuth, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"overview" | "referrals" | "campaigns">("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Guide and Phone modal states
  const [showGuide, setShowGuide] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["partner-dashboard"],
    queryFn: () => http.get("/partners/dashboard").then(r => r.data),
    retry: false,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["partner-campaigns"],
    queryFn: () => http.get("/partners/campaigns").then(res => res.data),
    enabled: !!data,
  });

  const handleLogout = () => { clearAuth(); navigate("/partners"); };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setSavingPhone(true);
    try {
      await http.put("/auth/me", {
        firstName: data.partner.firstName,
        lastName: data.partner.lastName,
        phone: phoneInput
      });
      toast.success("Phone number successfully updated!");
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["partner-dashboard"] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update phone number.");
    } finally {
      setSavingPhone(false);
    }
  };

  const fontFamily = "'Plus Jakarta Sans', sans-serif";
  const containerStyle: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 16px" };

  const [activeCopyIdMap, setActiveCopyIdMap] = useState<Record<number, number>>({});

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily }}>
      <style>{DASHBOARD_STYLES}</style>
      <SEO title="Partner Dashboard — Veleon Growth Partner Program" description="Track your referrals, commissions, and milestones." />

      {/* ── Phone Number Modal ── */}
      {data && !data.partner.phone && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "32px 24px",
            maxWidth: 400, width: "100%", textAlign: "center",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1e293b", marginBottom: 12 }}>Enter Your Phone Number</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
              Welcome aboard! Before accessing your partner dashboard, please input your phone number so we can keep you updated with onboarding & payments.
            </p>
            <form onSubmit={handlePhoneSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="tel"
                required
                placeholder="e.g. +234 801 234 5678"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 8,
                  border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <button
                type="submit"
                disabled={savingPhone}
                style={{
                  padding: "12px", background: "#f97316", color: "#fff",
                  border: "none", borderRadius: 8, fontWeight: 800, fontSize: 15,
                  cursor: savingPhone ? "not-allowed" : "pointer", opacity: savingPhone ? 0.8 : 1
                }}
              >
                {savingPhone ? "Saving..." : "Start Earning"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Guide Modal ── */}
      {showGuide && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 999, padding: 12,
          boxSizing: "border-box"
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "20px 16px",
            maxWidth: 440, width: "100%", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            position: "relative", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box"
          }}>
            <button onClick={() => setShowGuide(false)} style={{
              position: "absolute", top: 14, right: 14, background: "none",
              border: "none", cursor: "pointer", color: "#94a3b8", padding: 4
            }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "#1e293b", marginBottom: 14, display: "flex", alignItems: "center", gap: 6, paddingRight: 24, margin: 0 }}>
              🚀 Quick Start: What Next?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff7ed", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 1 }}>1</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>Get Your Link:</strong> Head to the <strong>Campaigns</strong> tab or copy your primary referral link below.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff7ed", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 1 }}>2</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>Share Graphics & Copy:</strong> Under the Campaigns tab, select any copy, download the flyer, and copy text templates.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff7ed", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 1 }}>3</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>Collect Commissions:</strong> For every student who signs up and completes payment using your link, you earn <strong>₦5,000</strong> plus milestone bonus payouts!
                </div>
              </div>
            </div>
            <button onClick={() => setShowGuide(false)} style={{
              width: "100%", padding: "10px", background: "#f1f5f9",
              color: "#334155", border: "none", borderRadius: 8,
              fontWeight: 800, fontSize: 13, marginTop: 18, cursor: "pointer"
            }}>
              Got it! Let's go
            </button>
          </div>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "0 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ ...containerStyle, display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center" }}>
              <img src="/veleonacademy_logo.jpg" alt="Veleon Academy" style={{ height: 30, borderRadius: 6 }} />
            </Link>
            <div style={{ width: 1, height: 22, background: "#f3f4f6" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Partner Dashboard</span>
          </div>

          {/* Desktop right actions */}
          <div className="pd-header-right">
            <Link to="/partners/campaigns"
              style={{ fontSize: 12, fontWeight: 800, color: "#ea580c", textDecoration: "none", background: "#fff7ed", padding: "5px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <Image size={13} /> Campaigns
            </Link>
            <button onClick={() => setShowGuide(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}>
              <HelpCircle size={14} className="text-primary" /> What's Next?
            </button>
            <Link to="/student/dashboard"
              style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
              Student Portal <ChevronRight size={13} />
            </Link>
            <button onClick={handleLogout}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="pd-hamburger" onClick={() => setMobileNavOpen(o => !o)} aria-label="Toggle nav">
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        <div className={`pd-mobile-nav${mobileNavOpen ? " open" : ""}`}>
          <Link to="/partners/campaigns" onClick={() => setMobileNavOpen(false)}
            style={{ fontSize: 14, fontWeight: 800, color: "#ea580c", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, padding: "8px 0" }}>
            <Image size={16} /> Campaigns Toolkit
          </Link>
          <button onClick={() => { setShowGuide(true); setMobileNavOpen(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, padding: "8px 0", textAlign: "left" }}>
            <HelpCircle size={15} className="text-primary" /> What's Next?
          </button>
          <Link to="/student/dashboard" onClick={() => setMobileNavOpen(false)}
            style={{ fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, padding: "8px 0" }}>
            Student Portal <ChevronRight size={14} />
          </Link>
          <button onClick={() => { handleLogout(); setMobileNavOpen(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, padding: "8px 0" }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ ...containerStyle, padding: "16px 16px 28px" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "pd-spin 0.8s linear infinite" }} />
            <p style={{ color: "#9ca3af", marginTop: 10, fontSize: 13 }}>Loading dashboard…</p>
            <style>{`@keyframes pd-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {isError && <JoinPrompt />}

        {data && (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 14, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <h1 style={{ fontSize: "clamp(18px, 3.5vw, 24px)", fontWeight: 900, color: "#111827", margin: 0, fontFamily }}>
                  Welcome, {data.partner.firstName} 👋
                </h1>
                <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  Code:&nbsp;
                  <button onClick={() => copyText(data.partner.referralCode, "Code copied!")}
                    style={{ background: "#fff7ed", border: "1px solid #ffedd5", borderRadius: 4, cursor: "pointer", fontFamily: "monospace", fontWeight: 800, color: "#ea580c", fontSize: 12, padding: "1px 6px", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    {data.partner.referralCode} <Copy size={11} />
                  </button>
                </p>
              </div>
              <button
                onClick={() => setShowGuide(true)}
                style={{
                  padding: "6px 14px", background: "#fff", border: "1.5px solid #f3f4f6",
                  borderRadius: 8, color: "#475569", fontWeight: 700, fontSize: 12,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4
                }}
              >
                <HelpCircle size={13} className="text-primary" /> What's Next?
              </button>
            </div>

            {/* Stats (Single Tight Card) */}
            <StatsSingleCard stats={data.stats} />

            {/* Referral Links */}
            <div className="pd-links-grid">
              <LinkCard
                label="Primary Referral Link"
                link={data.partner.referralLink}
                hint="Share this link anywhere — anyone who enrolls through it is credited to you."
              />
              <button
                onClick={() => navigate("/partners/campaigns")}
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  border: "none", borderRadius: 12, padding: 14, cursor: "pointer",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  alignItems: "center", color: "#fff", textDecoration: "none", gap: 4,
                  textAlign: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 14 }}>
                  <Image size={18} /> Marketing Campaigns 🚀
                </div>
                <span style={{ fontSize: 11, opacity: 0.9 }}>Get customized flyers and copy-paste text templates.</span>
              </button>
            </div>

            {/* Milestone bar */}
            <div style={{ marginBottom: 14 }}>
              <MilestoneBar total={data.stats.totalReferrals} milestones={data.milestones} />
            </div>

            {/* Tabs */}
            <div className="pd-tabs-row">
              <button onClick={() => setTab("overview")}
                className="pd-tab-btn"
                style={{
                  background: tab === "overview" ? "#fff" : "transparent",
                  color: tab === "overview" ? "#111827" : "#6b7280",
                  boxShadow: tab === "overview" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                }}>
                Cohorts
              </button>
              <button onClick={() => setTab("referrals")}
                className="pd-tab-btn"
                style={{
                  background: tab === "referrals" ? "#fff" : "transparent",
                  color: tab === "referrals" ? "#111827" : "#6b7280",
                  boxShadow: tab === "referrals" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                }}>
                Students ({data.stats.totalReferrals})
              </button>
              <button onClick={() => navigate("/partners/campaigns")}
                className="pd-tab-btn"
                style={{
                  background: "transparent",
                  color: "#ea580c",
                }}>
                <Image size={12} /> Campaigns 🚀
              </button>
            </div>

            {/* Tab: Overview */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <CohortTable rows={data.cohortBreakdown} />
                
                {/* Active campaigns quick stats */}
                <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, overflow: "hidden", width: "100%", boxSizing: "border-box" }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
                    <h3 style={{ fontSize: 12, fontWeight: 800, color: "#111827", margin: 0, fontFamily }}>Campaign Performance</h3>
                  </div>
                  {data.campaignStats?.length === 0 ? (
                    <div style={{ padding: "20px 14px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>No campaign activity yet. Go to Campaigns tab to share.</div>
                  ) : (
                    <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#9ca3af", fontSize: 10, textTransform: "uppercase", fontWeight: 800 }}>Campaign</th>
                            <th style={{ padding: "8px 6px", textAlign: "center", color: "#9ca3af", fontSize: 10, textTransform: "uppercase", fontWeight: 800 }}>Clicks</th>
                            <th style={{ padding: "8px 6px", textAlign: "center", color: "#9ca3af", fontSize: 10, textTransform: "uppercase", fontWeight: 800 }}>Enrolled</th>
                            <th style={{ padding: "8px 10px", textAlign: "right", color: "#9ca3af", fontSize: 10, textTransform: "uppercase", fontWeight: 800 }}>Earned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.campaignStats?.map((c: any) => (
                            <tr key={c.campaign_id} style={{ borderTop: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "10px 10px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{c.campaign_title}</td>
                              <td style={{ padding: "10px 6px", textAlign: "center", color: "#374151" }}>{c.clicks}</td>
                              <td style={{ padding: "10px 6px", textAlign: "center", color: "#16a34a", fontWeight: 700 }}>{c.enrollments}</td>
                              <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: "#ea580c" }}>{fmt(c.enrollments * 5000)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Referrals */}
            {tab === "referrals" && (
              <>
                <ReferralsDesktopTable referrals={data.referrals} />
                <ReferralsMobileCards referrals={data.referrals} />
              </>
            )}

            {/* Tab: Campaigns Library */}
            {tab === "campaigns" && (
              <div className="pd-campaigns-grid">
                {campaignsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>Loading campaigns library...</div>
                ) : !campaigns || campaigns.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>No active promotional campaigns found. Check back later!</div>
                ) : (
                  campaigns.map((camp: any) => (
                    <div key={camp.id} style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: 20 }}>
                      <div style={{ borderBottom: "1.5px solid #f8fafc", paddingBottom: 12 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 900, color: "#1e293b", margin: 0 }}>{camp.title}</h3>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{camp.description}</p>
                      </div>

                      {/* Copy Angles */}
                      {!camp.copies || camp.copies.length === 0 ? (
                        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 12 }}>No flyer versions uploaded yet for this campaign.</p>
                      ) : (
                        <div style={{ marginTop: 16 }}>
                          {/* Inner Copy select row */}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                            {camp.copies.map((cp: any, idx: number) => {
                              const activeCopyId = activeCopyIdMap[camp.id] ?? camp.copies[0].id;
                              const isActive = activeCopyId === cp.id;
                              return (
                                <button
                                  key={cp.id}
                                  onClick={() => setActiveCopyIdMap(prev => ({ ...prev, [camp.id]: cp.id }))}
                                  style={{
                                    padding: "6px 12px", border: isActive ? "1.5px solid #ea580c" : "1.5px solid #e2e8f0",
                                    borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    background: isActive ? "#fff7ed" : "#fff", color: isActive ? "#ea580c" : "#64748b"
                                  }}
                                >
                                  {cp.title}
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Copy Content */}
                          {(() => {
                            const activeCopyId = activeCopyIdMap[camp.id] ?? camp.copies[0].id;
                            const copy = camp.copies.find((c: any) => c.id === activeCopyId);
                            if (!copy) return null;

                            return (
                              <div style={{ display: "grid", gridTemplateColumns: copy.flyer_url ? "180px 1fr" : "1fr", gap: 20, alignItems: "start" }}>
                                {/* Flyer preview column */}
                                {copy.flyer_url && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <div style={{ border: "1.5px solid #f3f4f6", borderRadius: 8, overflow: "hidden", background: "#f8fafc" }}>
                                      <img src={copy.flyer_url} alt="Flyer Preview" style={{ width: "100%", display: "block" }} />
                                    </div>
                                    <a
                                      href={copy.flyer_url}
                                      download
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                                        padding: "8px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#fff",
                                        color: "#334155", fontSize: 12, fontWeight: 700, textDecoration: "none",
                                        textAlign: "center"
                                      }}
                                    >
                                      <Image size={12} /> Download Flyer
                                    </a>
                                  </div>
                                )}

                                {/* Message categories column */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                  {!copy.messages || copy.messages.length === 0 ? (
                                    <p style={{ fontSize: 12, color: "#94a3b8" }}>No share templates added for this copy angle.</p>
                                  ) : (
                                    copy.messages.map((msg: any) => {
                                      // Dynamically append campaign / copy params to referral link to track clicks
                                      const campaignReferralLink = `${data.partner.referralLink}&c=${camp.id}&cp=${copy.id}`;
                                      const renderedText = msg.message_text?.replace(/\{\{referral_link\}\}/g, campaignReferralLink);

                                      return (
                                        <div key={msg.id} style={{ border: "1.5px solid #f3f4f6", borderRadius: 8, padding: 14 }}>
                                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
                                              {msg.categoryName}
                                            </span>
                                            <button
                                              onClick={() => copyText(renderedText, "Message template copied!")}
                                              style={{
                                                background: "none", border: "none", cursor: "pointer",
                                                color: "#ea580c", fontSize: 11, fontWeight: 700,
                                                display: "inline-flex", alignItems: "center", gap: 4
                                              }}
                                            >
                                              <Copy size={12} /> Copy Template
                                            </button>
                                          </div>
                                          <p style={{
                                            margin: 0, padding: 10, background: "#f8fafc", borderRadius: 6,
                                            fontSize: 12, fontMono: "monospace", fontFamily: "monospace",
                                            whiteSpace: "pre-wrap", color: "#334155", border: "1px solid #f1f5f9"
                                          } as any}>
                                            {renderedText}
                                          </p>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Milestone details */}
            <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, marginTop: 20, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: 0, fontFamily }}>All Milestones</h3>
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {data.milestones.map((m: any) => (
                  <div key={m.students} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10,
                    background: m.achieved ? "#f0fdf4" : "#f9fafb",
                    border: `1.5px solid ${m.achieved ? "#bbf7d0" : "#f3f4f6"}`,
                  }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: m.achieved ? "#16a34a" : "#e5e7eb", color: m.achieved ? "#fff" : "#9ca3af", flexShrink: 0 }}>
                      {m.achieved ? <CheckCircle size={13} /> : <Clock size={13} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{m.students} Students </span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>— {m.extras.join(", ")}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: m.achieved ? "#16a34a" : "#f97316", flexShrink: 0 }}>+{fmt(m.bonus)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
