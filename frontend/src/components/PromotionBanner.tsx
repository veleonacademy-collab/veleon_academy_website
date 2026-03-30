import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Timer, Zap, ArrowRight, X, Calendar } from "lucide-react";

const WHATSAPP_WEBINAR_URL = "https://chat.whatsapp.com/Br5MpPshvj2LQhtx2kmh2W";

export const PromotionBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVisible, setIsVisible] = useState(true);

  // Webinar is tomorrow (March 30, 2026) at 8:00 PM
  const webinarDate = new Date("2026-03-30T20:00:00").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = webinarDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [webinarDate]);

  if (!isVisible) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="relative z-[60] bg-slate-900 overflow-hidden group">
      {/* Animated gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-slate-900 to-indigo-600/30 opacity-80" />
      <div className="absolute -left-20 top-0 w-64 h-full bg-primary/20 blur-3xl rounded-full" />
      <div className="absolute -right-20 top-0 w-64 h-full bg-indigo-600/20 blur-3xl rounded-full" />

      {/* ── MOBILE LAYOUT (< md) ── */}
      <div className="md:hidden relative px-4 pr-10 py-2.5">
        {/* Row 1: labels + timer */}
        <div className="flex items-center justify-between gap-2">
          {/* Labels */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary animate-pulse">
              <Zap className="h-3 w-3 fill-current" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">
                Elite Tech Webinar
              </p>
              <p className="text-[11px] font-bold text-white leading-tight whitespace-nowrap">
                Today · 8 PM WAT
              </p>
              <p className="text-base font-black leading-tight whitespace-nowrap tracking-wide">
                <span className="text-orange-400">🗓 Class starts April 4th</span>
              </p>
            </div>
          </div>

          {/* Compact timer */}
          <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
            <Timer className="h-3 w-3 text-primary animate-spin-slow" />
            <span className="font-heading text-sm font-black text-white tabular-nums">
              {pad(timeLeft.hours)}
              <span className="text-[8px] text-slate-400 mx-0.5">h</span>
              {pad(timeLeft.minutes)}
              <span className="text-[8px] text-slate-400 mx-0.5">m</span>
              {pad(timeLeft.seconds)}
              <span className="text-[8px] text-slate-400 ml-0.5">s</span>
            </span>
          </div>
        </div>

        {/* Row 2: CTAs */}
        <div className="mt-2 flex flex-col gap-2">
          <a
            href={WHATSAPP_WEBINAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full bg-white text-slate-900 hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-xl shadow-white/5"
          >
            Join Free Webinar
            <ArrowRight className="h-3 w-3" />
          </a>
          <Link
            to="/courses"
            className="flex items-center justify-center gap-1.5 w-full bg-primary hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20"
          >
            Enrol Now
            <Zap className="h-3 w-3 fill-current" />
          </Link>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (≥ md) ── */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 relative py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Urgent Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary animate-pulse">
                <Zap className="h-4 w-4 fill-current text-primary" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-primary leading-tight">
                  Elite Tech Webinar
                </span>
                <span className="text-sm font-bold text-white whitespace-nowrap">Today • 8:00 PM WAT</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                <Calendar className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-orange-400 leading-tight">Cohort</span>
                <span className="text-sm font-bold text-white whitespace-nowrap">Starts April 4th</span>
              </div>
            </div>
          </div>

          {/* Timer & CTAs */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 group-hover:border-primary/30 transition-colors">
              <Timer className="h-4 w-4 text-primary animate-spin-slow" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-xl font-black text-white tabular-nums">{pad(timeLeft.hours)}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">H</span>
                <span className="font-heading text-xl font-black text-white tabular-nums">{pad(timeLeft.minutes)}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">M</span>
                <span className="font-heading text-xl font-black text-white tabular-nums">{pad(timeLeft.seconds)}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">S</span>
              </div>
            </div>

            <a
              href={WHATSAPP_WEBINAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-slate-900 hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-xl shadow-white/5 hover:shadow-primary/20"
            >
              Join Webinar
              <ArrowRight className="h-3 w-3" />
            </a>

            <Link
              to="/courses"
              className="flex items-center gap-2 bg-primary hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/20"
            >
              Enroll Now
              <Zap className="h-3 w-3 fill-current" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dismiss Button — always top-right, never overlaps content */}
      <button
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss banner"
        className="absolute right-2 top-2 p-1 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Decorative pulse line at bottom */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};
