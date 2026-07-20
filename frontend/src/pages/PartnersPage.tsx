import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../state/AuthContext";
import { http } from "../api/http";
import type { AuthTokens, User } from "../types/auth";
import SEO from "../components/SEO";
import {
  CheckCircle, ChevronDown, ArrowRight, Star, Trophy, Zap,
  Medal, Crown, Menu, X
} from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

/* ─── Constants ──────────────────────────────────────────────────────────── */
const COMMISSION_TABLE = [
  { students: 5,  commission: 25000, bonus: 5000,   total: 30000  },
  { students: 10, commission: 50000, bonus: 15000,  total: 65000  },
  { students: 20, commission: 100000, bonus: 40000, total: 140000 },
  { students: 30, commission: 150000, bonus: 75000, total: 225000 },
  { students: 50, commission: 250000, bonus: 150000, total: 400000 },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Apply", desc: "Complete the partner registration form in minutes." },
  { step: "02", title: "Get Approved", desc: "Receive your unique referral code, link, and all marketing materials." },
  { step: "03", title: "Promote", desc: "Share your link with friends, WhatsApp groups, social media, and your community." },
  { step: "04", title: "Earn", desc: "Commissions are credited automatically for every successful enrollment." },
];

const BENEFITS = [
  "₦5,000 Commission Per Student",
  "Unlimited Earnings",
  "Milestone Bonuses",
  "Free Access To Veleon Programs",
  "Certificates & Recognition",
  "Referral Dashboard & Tracking",
];

const FAQS = [
  { q: "Is there a limit to how much I can earn?", a: "No. Your earnings are completely unlimited." },
  { q: "How do I get my referral code?", a: "You receive it immediately after completing registration." },
  { q: "How are referrals tracked?", a: "Through your unique referral code and referral link, automatically." },
  { q: "When do I get paid?", a: "Commissions are paid weekly after enrollment verification." },
  { q: "Do I need marketing experience?", a: "No. We provide training, scripts, flyers, and all promotional materials." },
  { q: "Can I refer people outside my school or community?", a: "Yes. You can refer anyone, anywhere, who is interested in learning Data Analytics." },
];

const OrangeAccent = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: "#f97316" }}>{children}</span>
);

/* ─── Auth Form ──────────────────────────────────────────────────────────── */
interface AuthFormProps { onSuccess: () => void; }

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { setAuth } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>("/partners/register", form);
      return res.data;
    },
    onSuccess: data => { setAuth(data.user, data.tokens); toast.success("Welcome to the Partner Program!"); onSuccess(); },
    onError: (e: any) => setError(e?.response?.data?.message || e.message),
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>("/auth/login", { email: form.email, password: form.password });
      return res.data;
    },
    onSuccess: data => {
      setAuth(data.user, data.tokens);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      onSuccess();
    },
    onError: (e: any) => setError(e?.response?.data?.message || e.message),
  });

  const googleMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const res = await http.post<{ user: User; tokens: AuthTokens }>("/partners/oauth/google", { idToken, isPartner: true });
      return res.data;
    },
    onSuccess: data => { setAuth(data.user, data.tokens); toast.success("Welcome!"); onSuccess(); },
    onError: () => toast.error("Google sign-in failed."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    mode === "register" ? registerMutation.mutate() : loginMutation.mutate();
  };

  const isPending = registerMutation.isPending || loginMutation.isPending;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 14, border: "1.5px solid #e5e7eb",
    borderRadius: 8, outline: "none", fontFamily: "inherit", color: "#111827", background: "#fff",
    boxSizing: "border-box",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["register", "login"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(null); }}
            style={{ flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "1.5px solid", transition: "all .2s",
              borderColor: mode === m ? "#f97316" : "#e5e7eb", background: mode === m ? "#fff7ed" : "#fff", color: mode === m ? "#f97316" : "#6b7280" }}>
            {m === "register" ? "Join Now" : "Sign In"}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && (
          <div className="pp-name-grid">
            <input style={inputStyle} placeholder="First Name" value={form.firstName} onChange={set("firstName")} required />
            <input style={inputStyle} placeholder="Last Name" value={form.lastName} onChange={set("lastName")} required />
          </div>
        )}
        <input style={inputStyle} type="email" placeholder="Email Address" value={form.email} onChange={set("email")} required />
        <input style={inputStyle} type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={set("password")} required />
        <button type="submit" disabled={isPending}
          style={{ padding: "12px 0", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1 }}>
          {isPending ? "Please wait..." : mode === "register" ? "Create Partner Account" : "Sign In"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleLogin onSuccess={cr => { if (cr.credential) googleMutation.mutate(cr.credential); }}
          onError={() => toast.error("Google sign-in failed.")} theme="outline" shape="rectangular" width="280" />
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const PartnersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const joinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.referralCode) navigate("/partners/dashboard", { replace: true });
  }, [user, navigate]);

  const handleAuthSuccess = () => navigate("/partners/dashboard");

  /** Smooth-scroll to the join form, offsetting for the sticky 64px nav */
  const scrollToJoin = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const el = joinRef.current;
    if (!el) return;
    const navHeight = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
    setMenuOpen(false);
  };

  const sectionStyle: React.CSSProperties = { padding: "72px 0" };
  const containerStyle: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "0 20px" };
  const h2Style: React.CSSProperties = {
    fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: "#111827",
    margin: "0 0 16px", lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif",
  };
  const bodyStyle: React.CSSProperties = { fontSize: 16, color: "#4b5563", lineHeight: 1.75 };
  const eyebrowStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 800, color: "#f97316",
    letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12,
  };

  return (
    <div style={{ background: "#fff", color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEO
        title="Become a Veleon Growth Partner — Earn Up To ₦400,000+ Per Cohort"
        description="Join the Veleon Growth Partner Program and earn ₦5,000 commission for every student you refer. No experience required. We provide training, flyers, and support."
      />

      {/* ── Scoped responsive styles ─────────────────────────────────────── */}
      <style>{`
        /* Partners page scoped utility classes */
        .pp-name-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pp-hero-grid { display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: start; }
        .pp-join-card {
          width: 100%;
          max-width: 360px;
          background: #fff;
          border: 1.5px solid #f3f4f6;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,.06);
          box-sizing: border-box;
        }
        .pp-nav-btns { display: flex; gap: 12px; align-items: center; }
        .pp-hamburger { display: none; background: none; border: none; cursor: pointer; color: #111827; padding: 4px; }
        .pp-mobile-menu { display: none; flex-direction: column; gap: 10px; padding: 14px 20px; border-bottom: 1px solid #f3f4f6; background: #fff; }
        .pp-mobile-menu.open { display: flex; }
        .pp-how-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 24px; margin-top: 32px; }
        .pp-milestones-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        .pp-leaderboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 600px; margin: 0 auto; }
        .pp-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; background: #f97316; color: #fff;
          border-radius: 10px; font-weight: 800; font-size: 15px;
          text-decoration: none; transition: opacity .15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .pp-cta-btn:hover { opacity: 0.88; }

        @media (max-width: 900px) {
          .pp-hero-grid { grid-template-columns: 1fr; gap: 36px; }
          .pp-join-card { max-width: 480px; margin: 0 auto; padding: 24px; }
          .pp-milestones-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 640px) {
          .pp-nav-btns { display: none; }
          .pp-hamburger { display: flex; align-items: center; justify-content: center; }
          .pp-name-grid { grid-template-columns: 1fr; }
          .pp-milestones-grid { grid-template-columns: repeat(2, 1fr); }
          .pp-leaderboard-grid { grid-template-columns: 1fr; max-width: 320px; }
          .pp-how-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid #f3f4f6", padding: "0 20px", position: "sticky", top: 0, background: "#fff", zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/veleonacademy_logo.jpg" alt="Veleon Academy" style={{ height: 36, borderRadius: 6 }} />
          </Link>

          {/* Desktop nav */}
          <div className="pp-nav-btns">
            {user ? (
              <Link to="/partners/dashboard"
                style={{ padding: "8px 18px", background: "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                My Dashboard
              </Link>
            ) : (
              <>
                <button onClick={scrollToJoin}
                  style={{ padding: "8px 18px", border: "1.5px solid #f97316", color: "#f97316", borderRadius: 8, fontWeight: 700, fontSize: 13, background: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Sign In
                </button>
                <button onClick={scrollToJoin}
                  style={{ padding: "8px 18px", background: "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  Join Now
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="pp-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle navigation">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`pp-mobile-menu${menuOpen ? " open" : ""}`}>
          {user ? (
            <Link to="/partners/dashboard" onClick={() => setMenuOpen(false)}
              style={{ padding: "10px 16px", background: "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none", textAlign: "center" }}>
              My Dashboard
            </Link>
          ) : (
            <>
              <button onClick={scrollToJoin}
                style={{ padding: "10px 16px", border: "1.5px solid #f97316", color: "#f97316", borderRadius: 8, fontWeight: 700, fontSize: 14, background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "center", width: "100%" }}>
                Sign In
              </button>
              <button onClick={scrollToJoin}
                style={{ padding: "10px 16px", background: "#f97316", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "center", width: "100%" }}>
                Join Now
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 20px 56px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="pp-hero-grid">
            {/* Left: copy */}
            <div style={{ maxWidth: 620 }}>
              <p style={eyebrowStyle}>Veleon Growth Partner Program</p>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 50px)", fontWeight: 900, color: "#111827", lineHeight: 1.1, margin: "0 0 20px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Earn Up To <OrangeAccent>₦400,000+</OrangeAccent> Per Cohort Helping People Launch Careers In Data Analytics
              </h1>
              <p style={{ ...bodyStyle, fontSize: 17, marginBottom: 28 }}>
                We provide the training, flyers, scripts, referral system, and support.<br />
                You simply share the opportunity and earn commissions when students enroll through your referral.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {BENEFITS.map(b => (
                  <li key={b} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: "#374151" }}>
                    <CheckCircle size={17} style={{ color: "#f97316", flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
              <button onClick={scrollToJoin} className="pp-cta-btn" style={{ border: "none", cursor: "pointer" }}>
                Become A Growth Partner <ArrowRight size={16} />
              </button>
            </div>

            {/* Right: join card */}
            <div ref={joinRef} id="join" className="pp-join-card">
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Join The Partner Program</h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Free to join. Start earning today.</p>
              <AuthForm onSuccess={handleAuthSuccess} />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMISSION TABLE ─────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>How The Math Works</p>
          <h2 style={h2Style}>How Someone Can Earn <OrangeAccent>₦400,000+</OrangeAccent></h2>
          <p style={{ ...bodyStyle, marginBottom: 36, maxWidth: 540 }}>
            Every enrolled student earns you ₦5,000. Reach milestones and unlock bonus payouts on top.
          </p>
          <div style={{ overflowX: "auto", borderRadius: 12, border: "1.5px solid #f3f4f6" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 500 }}>
              <thead>
                <tr style={{ background: "#111827", color: "#fff" }}>
                  {["Students Referred", "Commission", "Milestone Bonus", "Total Earnings"].map(h => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMMISSION_TABLE.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "13px 18px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>{row.students} Students</td>
                    <td style={{ padding: "13px 18px", color: "#374151" }}>{fmt(row.commission)}</td>
                    <td style={{ padding: "13px 18px", color: "#f97316", fontWeight: 700 }}>+ {fmt(row.bonus)}</td>
                    <td style={{ padding: "13px 18px", fontWeight: 800, color: "#111827", fontSize: 15 }}>{fmt(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── WHAT IS IT ───────────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={{ ...containerStyle, maxWidth: 720 }}>
          <p style={eyebrowStyle}>The Program</p>
          <h2 style={h2Style}>What Is The Veleon Growth Partner Program?</h2>
          <p style={bodyStyle}>
            The Veleon Growth Partner Program is designed for students, graduates, NYSC members, creators, community leaders,
            and professionals who want to earn income while helping others gain valuable Data Analytics skills.
          </p>
          <p style={{ ...bodyStyle, marginTop: 16 }}>
            As a Growth Partner, you'll receive your own unique referral code and referral link. Whenever someone enrolls
            in a Veleon Academy program using your code or link, you earn a commission — with no limit to how much you can earn.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>The Process</p>
          <h2 style={h2Style}>How It Works</h2>
          <div className="pp-how-grid">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#f97316", letterSpacing: "0.2em", marginBottom: 10 }}>STEP {item.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 10px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MILESTONE BONUSES ────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Milestone Bonuses</p>
          <h2 style={h2Style}>We Reward Our Most Active Partners</h2>
          <p style={{ ...bodyStyle, marginBottom: 36, maxWidth: 540 }}>Reach referral milestones and unlock bonus payouts plus special recognition.</p>
          <div className="pp-milestones-grid">
            {[
              { n: 5,  bonus: 5000,   extra: "Partner Certificate", icon: <Medal size={20} /> },
              { n: 10, bonus: 15000,  extra: "Free Course Access",  icon: <Star size={20} /> },
              { n: 20, bonus: 40000,  extra: "Gold Partner Status", icon: <Trophy size={20} /> },
              { n: 30, bonus: 75000,  extra: "VIP Recognition",     icon: <Crown size={20} /> },
              { n: 50, bonus: 150000, extra: "Elite Partner Status", icon: <Zap size={20} /> },
            ].map(m => (
              <div key={m.n} style={{ border: "1.5px solid #f3f4f6", borderRadius: 12, padding: "18px 12px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: "50%", background: "#fff7ed", color: "#f97316", marginBottom: 10 }}>
                  {m.icon}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{m.n} Students</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f97316", margin: "4px 0" }}>+ {fmt(m.bonus)}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{m.extra}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ──────────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, background: "#111827", color: "#fff" }}>
        <div style={{ ...containerStyle, textAlign: "center" }}>
          <p style={{ ...eyebrowStyle, color: "#f97316" }}>Cohort Leaderboard</p>
          <h2 style={{ ...h2Style, color: "#fff" }}>Top Partners Win Extra Cash</h2>
          <p style={{ ...bodyStyle, color: "#9ca3af", marginBottom: 40 }}>
            Each cohort, the top-performing partners receive additional rewards on top of all commissions and milestone bonuses.
          </p>
          <div className="pp-leaderboard-grid">
            {[{ place: "1st", bonus: 50000 }, { place: "2nd", bonus: 25000 }, { place: "3rd", bonus: 10000 }].map(r => (
              <div key={r.place} style={{ background: "#1f2937", borderRadius: 12, padding: "28px 20px" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{r.place === "1st" ? "🥇" : r.place === "2nd" ? "🥈" : "🥉"}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 700 }}>{r.place} Place</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#f97316" }}>{fmt(r.bonus)} Bonus</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUGUST CHALLENGE ─────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, background: "#fff7ed" }}>
        <div style={{ ...containerStyle, maxWidth: 740 }}>
          <p style={eyebrowStyle}>Special Offer</p>
          <h2 style={h2Style}>August Launch Challenge</h2>
          <p style={{ ...bodyStyle, marginBottom: 24 }}>
            Any Growth Partner who successfully refers <strong>10 students before enrollment closes</strong> receives:
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
            {["Full Commission", "₦15,000 Milestone Bonus", "Free Access To The Data Analytics Career Accelerator", "Gold Partner Fast-Track Recognition"].map(i => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, color: "#374151" }}>
                <CheckCircle size={17} style={{ color: "#f97316", flexShrink: 0 }} /> {i}
              </li>
            ))}
          </ul>
          <button onClick={scrollToJoin} className="pp-cta-btn" style={{ border: "none", cursor: "pointer" }}>
            Claim This Offer <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── WHO CAN JOIN ─────────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <p style={eyebrowStyle}>Eligibility</p>
          <h2 style={h2Style}>Who Can Join?</h2>
          <p style={{ ...bodyStyle, marginBottom: 32, maxWidth: 540 }}>The program is open to anyone. No previous experience is required.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {["University Students", "Polytechnic Students", "NYSC Members", "Content Creators", "Career Influencers", "Community Leaders", "Professionals", "Anyone Interested In Helping Others"].map(w => (
              <span key={w} style={{ padding: "8px 16px", background: "#f9fafb", border: "1.5px solid #f3f4f6", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "#374151" }}>{w}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section style={{ ...sectionStyle, background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ ...containerStyle, maxWidth: 720 }}>
          <p style={eyebrowStyle}>Questions</p>
          <h2 style={{ ...h2Style, marginBottom: 32 }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "#fff", border: "1.5px solid #f3f4f6", borderRadius: 10 }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{faq.q}</span>
                  <ChevronDown size={16} style={{ color: "#9ca3af", flexShrink: 0, transform: faqOpen === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 20px 16px", fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section id="final-cta" style={{ ...sectionStyle, textAlign: "center" }}>
        <div style={{ ...containerStyle, maxWidth: 600 }}>
          <h2 style={h2Style}>Ready To Start Earning?</h2>
          <p style={{ ...bodyStyle, marginBottom: 36 }}>
            Join the Veleon Growth Partner Program today and start earning commissions while helping others launch successful careers in Data Analytics.
          </p>
          <button onClick={scrollToJoin} className="pp-cta-btn" style={{ fontSize: 16, padding: "15px 32px", border: "none", cursor: "pointer" }}>
            Become A Growth Partner <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer note */}
      <div style={{ borderTop: "1px solid #f3f4f6", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          © {new Date().getFullYear()} Veleon Academy ·{" "}
          <Link to="/privacy" style={{ color: "#9ca3af" }}>Privacy</Link>{" · "}
          <Link to="/terms" style={{ color: "#9ca3af" }}>Terms</Link>
        </p>
      </div>
    </div>
  );
};

export default PartnersPage;
