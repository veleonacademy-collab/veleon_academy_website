import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Copy, ExternalLink, TrendingUp, Users, DollarSign, Trophy,
  CheckCircle, Clock, ChevronRight, LogOut, Menu, X
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
  .pd-header-right { display: flex; gap: 12px; align-items: center; }
  .pd-hamburger { display: none; background: none; border: none; cursor: pointer; color: #374151; padding: 4px; }
  .pd-mobile-nav { display: none; flex-direction: column; gap: 8px; padding: 12px 20px 16px; border-bottom: 1px solid #f3f4f6; background: #fff; }
  .pd-mobile-nav.open { display: flex; }
  .pd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .pd-links-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px; }
  .pd-referrals-table { display: block; }
  .pd-referrals-cards { display: none; }

  @media (max-width: 900px) {
    .pd-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .pd-links-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 640px) {
    .pd-header-right { display: none; }
    .pd-hamburger { display: flex; align-items: center; justify-content: center; }
    .pd-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .pd-links-grid { grid-template-columns: 1fr; }
    .pd-referrals-table { display: none; }
    .pd-referrals-cards { display: flex; flex-direction: column; gap: 12px; }
    .pd-tabs-row { width: 100% !important; }
  }

  @media (max-width: 400px) {
    .pd-stats-grid { grid-template-columns: 1fr; }
  }
`;

/* ─── sub-components ─────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, icon: Icon, accent = false }: any) => (
  <div style={{
    background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 6,
    borderTop: accent ? "3px solid #f97316" : "1.5px solid #f3f4f6",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: accent ? "#fff7ed" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", color: accent ? "#f97316" : "#6b7280", flexShrink: 0 }}>
        <Icon size={14} />
      </div>
    </div>
    <div style={{ fontSize: 22, fontWeight: 900, color: "#111827", wordBreak: "break-word" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{sub}</div>}
  </div>
);

/* ─── Milestone Progress ─────────────────────────────────────────────────── */
const MILESTONES = [5, 10, 20, 30, 50];

const MilestoneBar = ({ total, milestones }: { total: number; milestones: any[] }) => {
  const nextIdx = milestones.findIndex((m: any) => !m.achieved);
  const next = milestones[nextIdx];

  return (
    <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Milestone Progress
      </h3>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {MILESTONES.map(n => {
          const done = total >= n;
          return (
            <div key={n} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 6, borderRadius: 100, background: done ? "#f97316" : "#f3f4f6", marginBottom: 5 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: done ? "#f97316" : "#9ca3af" }}>{n}</span>
            </div>
          );
        })}
      </div>
      {next && (
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          <strong style={{ color: "#111827" }}>{next.students - total} more</strong> student{next.students - total !== 1 ? "s" : ""} to unlock your next milestone — <strong style={{ color: "#f97316" }}>+{fmt(next.bonus)}</strong>
        </p>
      )}
      {!next && <p style={{ fontSize: 13, color: "#16a34a", fontWeight: 700, margin: 0 }}>🎉 All milestones achieved!</p>}
    </div>
  );
};

/* ─── Cohort Breakdown ───────────────────────────────────────────────────── */
const CohortTable = ({ rows }: { rows: any[] }) => (
  <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, overflow: "hidden" }}>
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#111827", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Earnings By Cohort</h3>
    </div>
    {rows.length === 0 ? (
      <div style={{ padding: "32px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No cohort data yet.</div>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 360 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Cohort", "Referrals", "Commissions"].map(h => (
                <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 18px", fontWeight: 700, color: "#111827" }}>{r.cohort}</td>
                <td style={{ padding: "12px 18px", color: "#374151" }}>{r.referrals}</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, color: "#f97316" }}>{fmt(r.earnings)}</td>
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
    <div style={{ padding: "16px 0 8px", fontWeight: 800, fontSize: 13, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      Students Enrolled Through You
    </div>
    {referrals.length === 0 ? (
      <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "32px 20px", textAlign: "center" }}>
        <Users size={28} style={{ color: "#d1d5db", marginBottom: 10 }} />
        <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>No referrals yet. Start sharing your link!</p>
      </div>
    ) : (
      referrals.map((r: any) => (
        <div key={r.id} style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{r.firstName} {r.lastName}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.email}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[r.status] || "#9ca3af", background: `${STATUS_COLOR[r.status] || "#9ca3af"}18`, padding: "3px 8px", borderRadius: 100, textTransform: "capitalize", flexShrink: 0 }}>
              {r.status}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 12, color: "#6b7280" }}>
            <span>{r.courseTitle}</span>
            <span>· {r.cohort}</span>
            <span>· {fmtDate(r.enrolledAt)}</span>
          </div>
          <div style={{ marginTop: 8, fontWeight: 800, color: "#f97316", fontSize: 13 }}>Commission: ₦5,000</div>
        </div>
      ))
    )}
  </div>
);

/* ─── Link Card ──────────────────────────────────────────────────────────── */
const LinkCard = ({ label, link, hint }: { label: string; link: string; hint: string }) => (
  <div style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 12, padding: 18 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
      <span style={{ flex: 1, fontSize: 12, color: "#374151", wordBreak: "break-all", fontWeight: 600, lineHeight: 1.5 }}>{link}</span>
      <button onClick={() => copyText(link, "Link copied!")} style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", color: "#f97316", padding: "2px 4px" }}>
        <Copy size={14} />
      </button>
      <a href={link} target="_blank" rel="noreferrer" style={{ flexShrink: 0, color: "#9ca3af", padding: "2px 4px" }}>
        <ExternalLink size={14} />
      </a>
    </div>
    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{hint}</p>
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
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "referrals">("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["partner-dashboard"],
    queryFn: () => http.get("/partners/dashboard").then(r => r.data),
    retry: false,
  });

  const handleLogout = () => { clearAuth(); navigate("/partners"); };

  const fontFamily = "'Plus Jakarta Sans', sans-serif";
  const containerStyle: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 16px" };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily }}>
      <style>{DASHBOARD_STYLES}</style>
      <SEO title="Partner Dashboard — Veleon Growth Partner Program" description="Track your referrals, commissions, and milestones." />

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
          <Link to="/student/dashboard" onClick={() => setMobileNavOpen(false)}
            style={{ fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            Student Portal <ChevronRight size={14} />
          </Link>
          <button onClick={() => { handleLogout(); setMobileNavOpen(false); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, padding: 0 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ ...containerStyle, padding: "24px 16px 40px" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #f3f4f6", borderTopColor: "#f97316", borderRadius: "50%", animation: "pd-spin 0.8s linear infinite" }} />
            <p style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>Loading dashboard…</p>
            <style>{`@keyframes pd-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {isError && <JoinPrompt />}

        {data && (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#f97316", marginBottom: 2 }}>Welcome back</p>
              <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 900, color: "#111827", margin: "0 0 4px", fontFamily }}>
                {data.partner.firstName} {data.partner.lastName}
              </h1>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                Referral Code:&nbsp;
                <button onClick={() => copyText(data.partner.referralCode, "Code copied!")}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "monospace", fontWeight: 800, color: "#f97316", fontSize: 14, padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {data.partner.referralCode} <Copy size={12} />
                </button>
              </p>
            </div>

            {/* Stats */}
            <div className="pd-stats-grid">
              <StatCard label="Total Referrals"    value={data.stats.totalReferrals}            sub="enrolled students"       icon={Users}       accent />
              <StatCard label="Commission Earned"  value={fmt(data.stats.totalCommission)}       sub="₦5,000 × students"       icon={DollarSign}  accent />
              <StatCard label="Milestone Bonuses"  value={fmt(data.stats.totalBonuses)}          sub="from milestones"         icon={Trophy} />
              <StatCard label="Total Earnings"     value={fmt(data.stats.totalEarnings)}         sub="commissions + bonuses"   icon={TrendingUp} />
            </div>

            {/* Referral Links */}
            <div className="pd-links-grid">
              <LinkCard
                label="Primary Referral Link"
                link={data.partner.referralLink}
                hint="Share this link anywhere — anyone who enrolls through it is credited to you."
              />
              <LinkCard
                label="Data Analytics Program Link"
                link={data.partner.dataAnalysisLink}
                hint="A direct link to the Data Analytics enrollment page — great for sharing with your audience."
              />
            </div>

            {/* Milestone bar */}
            <div style={{ marginBottom: 20 }}>
              <MilestoneBar total={data.stats.totalReferrals} milestones={data.milestones} />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4, marginBottom: 16, width: "fit-content", maxWidth: "100%" }}
              className="pd-tabs-row">
              {(["overview", "referrals"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "7px 16px", fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "none", transition: "all .2s",
                    background: tab === t ? "#fff" : "transparent", color: tab === t ? "#111827" : "#9ca3af",
                    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.08)" : "none", whiteSpace: "nowrap",
                  }}>
                  {t === "overview" ? "Cohort Breakdown" : `Students (${data.stats.totalReferrals})`}
                </button>
              ))}
            </div>

            {tab === "overview" && <CohortTable rows={data.cohortBreakdown} />}
            {tab === "referrals" && (
              <>
                <ReferralsDesktopTable referrals={data.referrals} />
                <ReferralsMobileCards referrals={data.referrals} />
              </>
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
