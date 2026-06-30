import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Star, 
  Clock, 
  PlayCircle,
  Cpu,
  Target,
  ChevronDown,
  Building2,
  Lock,
  Info
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../utils/constants';
import { http } from '../api/http';
import { formatCurrency } from '../utils/formatUtils';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    clarity?: {
      (...args: any[]): void;
      q?: any[];
    };
  }
}

// Helper: fire a Microsoft Clarity custom event (safe — queues if Clarity not loaded yet)
const clarityEvent = (name: string, value?: string) => {
  try {
    if (typeof window !== 'undefined') {
      if (!window.clarity) {
        const clarityFn: any = function() {
          clarityFn.q = clarityFn.q || [];
          clarityFn.q.push(arguments);
        };
        window.clarity = clarityFn;
      }
      window.clarity?.('event', name, value);
    }
  } catch { /* noop */ }
};

// Static Constants moved outside component to prevent recreation on every render
const FLYER_BADGES = ["6 WEEKS", "100% ONLINE", "SATURDAY REVENUE CLASSES", "DOUBLE MONEY-BACK GUARANTEE"];

const OUTCOMES = [
  "Clean messy databases in Excel using expert techniques, cutting manual effort by 90%",
  "Query live SQL servers confidently using joins and CTEs without getting code errors",
  "Construct executive dashboard portals in Power BI from raw data within hours",
  "Deploy advanced AI prompts to summarize analytical findings instantly for management",
  "Confidently pitch SME business owners and bill ₦50,000–₦250,000 per dashboard setup"
];

const MODULES = [
  { 
    step: "TRACK 1", 
    title: "Business Excel & Reporting (Week 1 & 2)", 
    objection: "Overcomes: 'Excel is too basic or raw data is too confusing'",
    desc: "Clean dirty CRM databases (TRIM, PROPER, IFERROR). Command high-performance lookups (XLOOKUP, FILTER, INDEX+MATCH). Group transactions, construct interactive executive slicers, and build decision-focused KPI dashboards in PivotTables. Solve forecasting and sensitivity assumptions." 
  },
  { 
    step: "TRACK 2", 
    title: "Relational SQL Databases & Querying (Week 3 & 4)", 
    objection: "Overcomes: 'SQL querying requires a computer science degree'",
    desc: "Query databases from scratch (SELECT, DISTINCT, WHERE, ORDER BY). Master the art of multi-table Joins (INNER, LEFT) to analyze customer databases. Command window functions (ROW_NUMBER, LAG, LEAD) and subqueries/CTEs to solve real-world analyst SQL interview patterns." 
  },
  { 
    step: "TRACK 3", 
    title: "Power BI Storytelling & Star Schema Modeling (Week 5)", 
    objection: "Overcomes: 'I do not know how to present my results to managers'",
    desc: "Connect multiple CSV, Excel, and database sources in Power Query. Architect bulletproof star schema relational models (Fact vs Dimension tables). Master DAX calculation metrics (Measures, CALCULATE, Time Intelligence) and configure Row-Level Security." 
  },
  { 
    step: "TRACK 4", 
    title: "AI Tools & Client Monetization Blueprint (Week 6)", 
    objection: "Overcomes: 'I don't know how to land a job or make money with my skills'",
    desc: "Leverage advanced ChatGPT and Gemini prompt frameworks to accelerate workflows. Optimize your LinkedIn personal brand (Headline, About, visibility sprint) and build an ATS-optimized resume. Learn to price SME dashboard packages, write high-converting proposals, and secure recurring monthly reporting retainers." 
  }
];

const BONUSES = [
  { 
    title: "Core 6-Week Data Analysis Accelerator", 
    sub: "Direct hands-on technical curriculum (Excel reporting pipelines, relational SQL server database querying, and executive Power BI dashboards).", 
    objection: "Busts: 'I don't know where to start or how to learn systematically.'",
    val: "₦150,000" 
  },
  { 
    title: "Bonus #1: Recruiter-Approved ATS CV & Resume Templates", 
    sub: "Tailored career templates and frameworks engineered to bypass automatic corporate filtering bots.", 
    objection: "Busts: 'Will my applications get ignored by resume scanners?'",
    val: "₦25,000" 
  },
  { 
    title: "Bonus #2: LinkedIn Profile Optimization & 30-Day Visibility Script", 
    sub: "Complete profile layout guides and commenting blueprints designed to make recruiters search you out.", 
    objection: "Busts: 'I don't know how to network or get recruiters to notice me.'",
    val: "₦30,000" 
  },
  { 
    title: "Bonus #3: SME Proposal & Client Outreach Pricing Templates", 
    sub: "Copy-and-paste worksheets to confidently pitch reporting dashboards and secure monthly consulting retainers.", 
    objection: "Busts: 'I have no sales skills and don't know how to bill clients.'",
    val: "₦20,000" 
  },
  { 
    title: "Bonus #4: 10 Proprietary Real-World Business Datasets", 
    sub: "Simulated retail, inventory, SaaS, and database CSVs to practice on and feature in your public portfolio.", 
    objection: "Busts: 'How do I build a portfolio without previous job experience?'",
    val: "₦25,000" 
  },
  { 
    title: "Bonus #5: WhatsApp VIP Direct Support & Private Alumni Network", 
    sub: "Direct access to Coach Ayodeji and batch graduates to review broken queries and grading support.", 
    objection: "Busts: 'What if I get completely stuck with code or formula errors?'",
    val: "₦50,000" 
  }
];

const WHO_IT_IS_FOR = [
  { 
    cat: "Students & Graduates", 
    desc: "Equip yourself with SQL querying, Excel reporting, and Power BI skills that recruiter bot filters prioritize." 
  },
  { 
    cat: "Job Seekers", 
    desc: "Gain raw capstone portfolio project assets and SQL expertise to outshine candidates in corporate interviews." 
  },
  { 
    cat: "Young Professionals", 
    desc: "Boost your current status and visibility by automating complex monthly business reporting templates." 
  },
  { 
    cat: "Career Transitioners", 
    desc: "Successfully pivot into high-paying corporate data roles, even starting with zero prior technical code experience." 
  }
];

const MENTOR_POINTS = [
  "CEO of Veleon Academy Technologies",
  "5+ Year Software Engineer & Tech Consultant who builds the actual systems data flows through.",
  "Successfully mentored multiple cohorts of working analysts",
  "Creator of the Veleon 6-Week Monetization Blueprint system"
];

const CHECKOUT_STEPS = [
  { n: 1, t: "Pick Your Plan", d: "Choose how you want to pay to lock in your cohort slot." },
  { n: 2, t: "Fill Details", d: "Entry takes 60 seconds. We need your WhatsApp to add you to the group." },
  { n: 3, t: "Secure Spot", d: "Complete payment to guarantee your seat before they're gone!" },
  { 
    n: 4, 
    t: "Join the Cohort", 
    d: "Secure your spot by joining the private cohort group or send your payment screenshot to this WhatsApp number! (08105281572)" 
  }
];

const FAQS = [
  { 
    q: "Do I need a high-end laptop before starting?", 
    a: "You need a basic functional laptop (Windows or Mac) to complete the assignments and capstone database projects. Since the training is hands-on, watching only on a phone will limit your ability to build these technical skills. No high-end coding machine is needed." 
  },
  { 
    q: "What if I miss the Saturday live sessions?", 
    a: "Do not worry. Every live Saturday monetization class is recorded and uploaded to your student portal within 2 hours. You have permanent lifetime access to review them whenever your schedule permits." 
  },
  { 
    q: "How much time do I need to allocate daily?", 
    a: "Lessons are pre-recorded from Monday to Friday, taking about 30 to 45 minutes of bite-sized, practical learning. You can consume them at whatever hour suits you, allowing you to learn without sacrificing your current job or study." 
  },
  { 
    q: "Is the double money-back guarantee actually real?", 
    a: "Yes. Coach Ayodeji is committed to student success. If you complete the lessons and assignments, apply the templates, and still don't feel ready or haven't closed client interest, Coach Ayodeji will coach you 1-on-1. If you're still not satisfied, we refund every single Kobo, and you keep all the templates and files anyway." 
  },
  { 
    q: "Do I get a certificate of completion?", 
    a: "Yes. Upon completing your technical curriculum and submitting your capstone workspace project, you will be awarded a verified digital Certificate of Completion from Veleon Academy Technologies." 
  }
];

// Dedicated CountdownTimer component to isolate state changes and avoid full-page re-renders
const CountdownTimer: React.FC<{ targetDate: string; variant: 'banner' | 'hero' }> = ({ targetDate, variant }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 9, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (variant === 'banner') {
    return (
      <span className="bg-black/20 px-2 py-0.5 rounded animate-pulse">
        Closes in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s ⏳
      </span>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto backdrop-blur-sm grid grid-cols-4 gap-1.5 sm:gap-2 text-center shadow-xl">
      {[
        { val: timeLeft.days, label: "Days" },
        { val: timeLeft.hours, label: "Hours" },
        { val: timeLeft.minutes, label: "Minutes" },
        { val: timeLeft.seconds, label: "Seconds" }
      ].map((unit, idx) => (
        <div key={idx} className="bg-slate-950/80 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5">
          <div className="text-xl sm:text-4xl font-serif font-black text-orange-500">{String(unit.val).padStart(2, '0')}</div>
          <div className="text-[9px] uppercase font-black text-slate-500 tracking-wider mt-0.5 sm:mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
};

const SalesLandingPage: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<'full' | 'excel_only'>('full');
  const [isInstallment, setIsInstallment] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(0);

  // Load Facebook Pixel deferred (non-blocking) — ONLY for the Sales Landing Page
  useEffect(() => {
    let loaded = false;
    const loadFbPixel = () => {
      if (loaded || typeof window === 'undefined') return;
      loaded = true;

      // Clean up event listeners immediately
      removeListeners();

      if (!window.fbq) {
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', '1016761340778813');
      }
      window.fbq('track', 'PageView');
      clarityEvent('sales_page_view');
    };

    const handleScroll = () => {
      loadFbPixel();
    };

    const addListeners = () => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    };

    const removeListeners = () => {
      window.removeEventListener("scroll", handleScroll);
    };

    // Load Facebook Pixel after 3 seconds (using idle callback if supported) or on first scroll
    const timeoutId = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadFbPixel, { timeout: 2000 });
      } else {
        loadFbPixel();
      }
    }, 3000);

    addListeners();

    return () => {
      clearTimeout(timeoutId);
      removeListeners();
    };
  }, []);

  const month = "July";
 
  const slotCap = 30;
  const slotSecured = 20;
  const slotsLeft = slotCap - slotSecured;
  const targetDate = "2026-07-02T23:59:59";

  const fullProgramPrice = 25999;
  const ExcelAndAIPrice =  15999;
  const fullProgramInstallment = 10999;
  const ExcelAndAIInstallment = 10999;
  const fullProgramPriceRemaining = 15000;
  const ExcelAndAIPriceRemaining = 5000;

  // const 

  useEffect(() => {
    if (window.location.hash === '#enroll-section') {
      setTimeout(() => {
        const element = document.getElementById('enroll-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, []);

  const scrollToEnroll = useCallback((e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    clarityEvent('cta_click_enroll');
    const element = document.getElementById('enroll-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Calculate the amount due based on selections
  const getAmountDue = (): number => {
    if (isInstallment) return selectedTrack === 'full' ? fullProgramInstallment : ExcelAndAIInstallment;
    return selectedTrack === 'full' ? fullProgramPrice : ExcelAndAIPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !whatsapp) {
      alert('Please fill out all fields to secure your spot.');
      return;
    }

    setIsSubmitting(true);

    // Track form submission events
    clarityEvent('lead_form_submit', `${selectedTrack}_${isInstallment ? 'installment' : 'full'}`);

    // Track checkout CompleteRegistration event with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', {
        content_name: 'Data Analysis Course',
        content_category: selectedTrack === 'full' ? 'Full Stack Track' : 'Excel Only Track',
        value: getAmountDue(),
        currency: 'NGN'
      });
    }

    // Save lead to database (fire-and-forget — don't block Paystack redirect)
    try {
      http.post('/sales-leads', {
        name,
        email,
        whatsapp,
        selectedTrack,
        paymentTerm: isInstallment ? 'installment' : 'full',
        amountDue: getAmountDue()
      }).catch(() => {
        // Silently fail — we don't want to block the payment flow
      });
    } catch {
      // Silently fail
    }

    // Open Paystack storefront based on selected package track
    const targetLink = selectedTrack === 'full' 
      ? 'https://paystack.shop/pay/veleon-data' 
      : 'https://paystack.shop/pay/veleon-data2';
    window.open(targetLink, '_blank', 'noopener,noreferrer');
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      <SEO 
        title="Master Data Analysis with Excel + SQL + AI: Graduate Job-Ready in 6 Weeks | Veleon Academy" 
        description="Graduate job-ready in 6 weeks. Master Advanced Excel, SQL database querying, Power BI dashboards, AI analytics tools, and our absolute skill monetization blueprint under Coach Omidoyin Ayodeji."
      />

      {/* Inline CSS animations & mobile scroll optimization media query */}
      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp   { from { opacity: 0; transform: translateY( 20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn    { from { opacity: 0; transform: scale(0.95);       } to { opacity: 1; transform: scale(1);    } }
        @keyframes fadeInRight{ from { opacity: 0; transform: translateX(20px);  } to { opacity: 1; transform: translateX(0); } }
        .anim-fade-down  { animation: fadeInDown  0.6s ease both; }
        .anim-scale-in   { animation: scaleIn     0.6s ease both; }
        .anim-fade-up    { animation: fadeInUp    0.6s ease both; }
        .anim-fade-up-d2 { animation: fadeInUp    0.6s 0.2s ease both; }
        .anim-fade-up-d3 { animation: fadeInUp    0.6s 0.3s ease both; }
        .anim-fade-up-d5 { animation: fadeInUp    0.6s 0.5s ease both; }
        .anim-right-0    { animation: fadeInRight 0.5s ease both; }
        .anim-right-1    { animation: fadeInRight 0.5s 0.08s ease both; }
        .anim-right-2    { animation: fadeInRight 0.5s 0.16s ease both; }
        .anim-right-3    { animation: fadeInRight 0.5s 0.24s ease both; }
        .anim-right-4    { animation: fadeInRight 0.5s 0.32s ease both; }

        @media (max-width: 640px) {
          .anim-fade-down,
          .anim-scale-in,
          .anim-fade-up,
          .anim-fade-up-d2,
          .anim-fade-up-d3,
          .anim-fade-up-d5,
          .anim-right-0,
          .anim-right-1,
          .anim-right-2,
          .anim-right-3,
          .anim-right-4 {
            animation: none !important;
          }
        }
      `}</style>

      {/* Top Banner Urgency & Scarcity */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-3 sm:py-2.5 sm:px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-50 flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
        <span>⚠️ {month} Batch Enrollment Capped to {slotCap} Spots: {slotSecured} Secured — Only {slotsLeft} Seats Left!</span>
        <span className="hidden sm:inline">•</span>
        <CountdownTimer variant="banner" targetDate={targetDate} />
      </div>

      {/* 1. HERO SECTION (Dream Outcome & Value Equation) - Spacing and typography optimized for mobile */}
      <section className="relative pt-4 sm:pt-24 pb-8 sm:pb-32 px-3 sm:px-6 overflow-hidden">
        {/* Background glow highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[300px] sm:h-[600px] bg-orange-500/10 blur-[100px] sm:blur-[150px] rounded-full -z-10" />
        <div className="absolute top-[20%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-10">
          <div className="flex justify-center mb-2 sm:mb-8 anim-fade-down">
            <div className="p-1 rounded-xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl border border-white/10">
              <img src="/veleonacademy_logo.jpg" alt="Veleon Academy Logo" className="h-10 sm:h-14 px-3 sm:px-4 py-1.5 sm:py-2" fetchPriority="high" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 
              className="text-2xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight leading-[1.2] text-white anim-scale-in"
              id="hero-heading"
            >
              Master Data Analysis: Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 italic">Job-Ready</span> Pro In 6 Weeks
            </h1>
          </div>

          <p 
            className="text-slate-300 text-sm sm:text-2xl max-w-3xl mx-auto leading-relaxed font-medium px-1 anim-fade-up-d2"
          >
            Get the technical power of <span className="text-white font-extrabold relative inline-block mx-1">
              <span className="relative z-10 font-bold italic">Excel + SQL + Power BI + AI</span>
              <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-500/30 -z-10 rounded-full" />
            </span> + the Saturday monetization roadmap to turn your skills into freelance client retainers. No tech background required.
          </p>

          {/* Urgent Ticking Visual Board (Isolated rendering) */}
          <CountdownTimer variant="hero" targetDate={targetDate} />

          {/* Flyer Badges */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xl mx-auto pt-1">
            {FLYER_BADGES.map((b, i) => (
              <span key={i} className="px-2.5 py-0.5 text-[9px] font-black tracking-widest text-orange-400 border border-orange-500/10 bg-orange-500/5 rounded-full uppercase">
                {b}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center pt-1 sm:pt-6 anim-fade-up-d3">
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              id="cta-hero-enroll"
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white px-5 sm:px-16 py-3.5 sm:py-7 rounded-xl font-black text-sm sm:text-xl uppercase tracking-wider shadow-[0_15px_40px_-10px_rgba(249,115,22,0.4)] active:scale-95 flex items-center justify-center gap-2"
            >
              Claim My Grand Slam Offer Now <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
            </a>
            <p className="mt-2.5 text-slate-500 text-[10px] font-bold uppercase tracking-[0.25em] flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-500" /> Only {slotsLeft} of {slotCap} Seats Remaining for {month} Batch!
            </p>
          </div>

          {/* Social Proof Intro Card */}
          <div className="mt-6 sm:mt-16 bg-white text-slate-900 p-4 sm:p-10 rounded-2xl shadow-2xl text-left relative overflow-hidden anim-fade-up-d5">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Users className="h-16 w-16 sm:h-24 sm:w-24 text-orange-500" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
              <div className="shrink-0 w-14 h-14 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-md bg-slate-100">
                 <img src="/ayodeji_trainer.jpg" alt="Coach Omidoyin Ayodeji" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <h3 className="text-sm sm:text-2xl font-serif font-black tracking-tight leading-snug uppercase">
                  "I don't just teach data analytics. I install a system that enables you to build high-paying dashboard services."
                </h3>
                <p className="text-orange-600 font-black uppercase tracking-wider text-[10px] sm:text-xs flex items-center justify-center sm:justify-start gap-1">
                   Omidoyin Ayodeji • CEO, Veleon Academy Technologies <CheckCircle2 className="h-3 w-3" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHO IT IS FOR SECTION (Moved up for mobile readability and conversion) - Condensed spacing */}
      <section className="py-4 sm:py-24 px-3 sm:px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-10">
          <div className="text-center space-y-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-wider mb-0.5">
                A System Tailored for Career Pivots
             </div>
             <h2 className="text-lg sm:text-4xl font-serif font-black tracking-tight uppercase leading-tight">WHO IS THIS <span className="text-orange-500 italic">TRAINING</span> FOR?</h2>
             <p className="text-slate-400 text-xs sm:text-sm font-semibold">Designed primarily to help the following people bypass struggle:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {WHO_IT_IS_FOR.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-3.5 sm:p-6 rounded-xl transition-all flex items-start gap-3 text-left">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-lg font-serif font-black tracking-tight uppercase">{item.cat}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed tracking-wide font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="bg-approve/10 border border-approve/30 p-3.5 rounded-xl text-center w-full">
               <p className="text-approve text-sm sm:text-base font-black italic uppercase tracking-tight text-orange-400">
                  If you fit any of these avatars, this accelerator was custom-built for your success.
               </p>
            </div>
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              className="hidden sm:flex w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] items-center justify-center gap-2"
            >
              Reserve My Seat Now <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. OUTCOMES SECTION (Moved up to answer "What will I achieve" immediately after "Who it is for") - Condensed spacing */}
      <section className="py-4 sm:py-24 px-3 sm:px-6 overflow-hidden relative">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-10">
          <div className="text-center">
             <span className="text-orange-500 text-[10px] font-black uppercase tracking-wider block mb-1">MAXIMUM VALUE • MINIMUM FRICTION</span>
             <h2 className="text-lg sm:text-4xl font-serif font-black tracking-tight uppercase leading-tight">BY THE END OF THIS ACCELERATOR, YOU WILL BE ABLE TO:</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
             <div className="relative aspect-video sm:aspect-square md:aspect-auto rounded-2xl overflow-hidden group shadow-xl bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 flex items-end min-h-[140px] md:min-h-0">
               <div className="absolute inset-0 flex items-center justify-center opacity-10">
                 <svg viewBox="0 0 100 100" className="w-24 h-24 text-orange-500" fill="currentColor"><path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"/></svg>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-orange-500/90 backdrop-blur-md p-3 rounded-lg">
                    <p className="text-white font-black text-xs sm:text-sm uppercase tracking-wider text-center">BECOME THE HIGH-STATUS TECH ASSET BUSINESSES PAY RETAINERS FOR</p>
                  </div>
               </div>
            </div>

            <div className="space-y-2">
              {OUTCOMES.map((item, i) => (
                <div 
                  key={i} 
                  className={`flex gap-2.5 items-center p-2.5 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/50 transition-colors group anim-right-${i}`}
                >
                  <div className="h-6 w-6 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-100">{item}</p>
                </div>
              ))}
              
              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                Yes, I Want to Secure These Skills <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REVIEW SECTION (Cornelius Review Stays - High Likelihood of Success) - Condensed mobile padding */}
      <section className="py-6 sm:py-24 px-3 sm:px-6 bg-orange-500/5">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-0.5">
             <h4 className="text-orange-500 font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs">Real Proof: High Likelihood of Success</h4>
             <h2 className="text-sm sm:text-4xl font-serif font-black tracking-tight leading-tight uppercase px-1">"THE ACADEMY REMOVED MY STUCK-FEELINGS & GAVE ME PRACTICAL PORTFOLIO POWER"</h2>
          </div>

          <div className="bg-white text-slate-900 p-4 sm:p-10 rounded-2xl shadow-xl relative">
            <div className="absolute -top-2.5 -left-2.5 bg-orange-500 p-2 rounded-lg text-white shadow-lg">
               <Star className="h-4 w-4 fill-current" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center text-center sm:text-left">
              <div className="shrink-0 w-16 h-16 sm:w-36 sm:h-36 bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                <img src="/cornelius.jpg" alt="Data Analyst Trainee - CS" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div>
                  <h3 className="text-sm sm:text-lg font-serif font-black text-orange-600 uppercase">Cornelius</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Analyst Trainee, Batch 2</p>
                </div>
                <div className="relative">
                  <span className="absolute -top-3 -left-3 text-3xl text-slate-100 font-serif leading-none -z-10">"</span>
                  <p className="text-slate-600 text-xs leading-relaxed tracking-wide font-medium italic relative z-10">
                    "My experience at Veleon Academy as a data analyst trainee has been very impactful. I’ve gained practical skills in data analysis, especially in Excel, data cleaning, and visualization. The training is well-structured and easy to understand, with hands-on projects that helped me apply what I learned. The instructors are supportive and always ready to help. Overall, the academy has boosted my confidence and given me a strong foundation in data analysis. I highly recommend it to anyone starting a career in this field. 100% ✅"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/reviews" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mx-auto">
            To See More Real Student Proof (Click Here) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* 5. TESTIMONIAL SEGUN (Barry testimonial is deleted, Segun remains styled premium and centered) - Condensed size */}
      <section className="py-4 px-3 sm:px-6">
        <div className="max-w-md mx-auto bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative aspect-[4/3] bg-slate-950">
            <img src="/Testimonial_segun.jpg" alt="Segun Testimonial" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-serif font-black text-white uppercase">Segun</h3>
              <p className="text-orange-500 font-black uppercase tracking-widest text-[9px] mt-0.5">Cohort 2 Student</p>
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 flex flex-col sm:flex-row gap-2 justify-center border-t border-white/5">
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              className="hidden sm:inline-block w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md text-center"
            >
              Claim My Grand Slam Offer
            </a>
            <Link to="/reviews" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all text-center">
              Read Success Stories
            </Link>
          </div>
        </div>
      </section>

      {/* 6. COURSE OVERVIEW & MODULES (Converted to mobile accordion to cut page height by ~40%) - Tighter paddings */}
      <section className="py-4 sm:py-24 px-3 sm:px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-12">
          <div className="text-center space-y-1.5">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               6-Week System Milestones
             </div>
             <h2 className="text-lg sm:text-5xl font-serif font-black tracking-tight leading-none">
               THE SYSTEM <span className="text-orange-500 italic">MILESTONES</span>
             </h2>
             <p className="text-slate-400 text-xs sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
               Each track is specifically engineered to overcome a standard career-limiting obstacle. Click a milestone to reveal details:
             </p>
          </div>

          {/* Interactive Accordion for Modules */}
          <div className="space-y-2 max-w-2xl mx-auto">
            {MODULES.map((mod, i) => {
              const isOpen = activeModuleIndex === i;
              return (
                <div 
                  key={i} 
                  className={`bg-[#0b0f19] border ${isOpen ? 'border-orange-500/80' : 'border-white/10'} rounded-xl overflow-hidden hover:border-orange-500/40 transition-all group`}
                >
                  <button
                    onClick={() => setActiveModuleIndex(isOpen ? null : i)}
                    className="w-full text-left p-4 flex justify-between items-center gap-3 focus:outline-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="bg-orange-500 text-white font-black text-[10px] tracking-widest px-2.5 py-0.5 rounded-full shrink-0">
                        {mod.step}
                      </span>
                      <h3 className="text-sm sm:text-base font-serif font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                        {mod.title}
                      </h3>
                    </div>
                    <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] border-t border-white/5 opacity-100 p-4' : 'max-h-0 opacity-0 p-0 pointer-events-none'}`}
                  >
                    <div className="space-y-2 text-left">
                      <div>
                        <span className="text-[10px] font-black tracking-wider text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                           {mod.objection}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed tracking-wide font-medium">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-6">
             <a 
               href="#enroll-section" 
               onClick={scrollToEnroll}
               className="hidden sm:flex w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all hover:scale-[1.02] items-center justify-center gap-2"
             >
               Start Learning Now <ArrowRight className="h-4 w-4" />
             </a>
          </div>
        </div>
      </section>

      {/* 7. TWO WAYS THIS PROGRAM PAYS FOR ITSELF (Desktop only to reduce mobile height) */}
      <section className="hidden sm:block py-4 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#07020d] border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-orange-500/5 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
             <span className="text-orange-500 text-xs font-black uppercase tracking-[0.25em]">Return on Investment</span>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight uppercase text-white">
               TWO WAYS THIS PROGRAM PAYS FOR ITSELF
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Path 1 */}
            <div className="bg-[#110925]/40 border border-orange-500/20 p-6 sm:p-8 rounded-[2rem] space-y-6 flex flex-col justify-between hover:border-orange-500/50 transition-all text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                  Career Acceleration
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white uppercase">
                  PATH #1: LAND A DATA ANALYST ROLE
                </h3>
                <div className="space-y-3 pt-2">
                  {[
                    "Build portfolio projects.",
                    "Upgrade your CV.",
                    "Improve your LinkedIn profile.",
                    "Position yourself for analyst interviews."
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-slate-300 font-bold text-sm">
                      <CheckCircle2 className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Path 2 */}
            <div className="bg-[#110925]/40 border border-orange-500/20 p-6 sm:p-8 rounded-[2rem] space-y-6 flex flex-col justify-between hover:border-orange-500/50 transition-all text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  Freelancing & Consulting
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white uppercase">
                  PATH #2: OFFER DATA SERVICES TO BUSINESSES
                </h3>
                <div className="space-y-3 pt-2">
                  {[
                    "Use the proposal templates.",
                    "Apply the pricing framework.",
                    "Create dashboards for SMEs.",
                    "Generate income while building experience."
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center text-slate-300 font-bold text-sm">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ALEX HORMOZI $100M GRAND SLAM OFFER STACK (Compressed stack on mobile, detailed list on desktop) - Tight margins */}
      <section className="py-4 sm:py-24 px-3 sm:px-6 relative overflow-hidden bg-[#0a0514] border-t border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-12">
          <div className="text-center space-y-1.5">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               Your No-Brainer Value Stack
             </div>
             <h2 className="text-lg sm:text-5xl font-serif font-black tracking-tight leading-none uppercase">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">THE GRAND SLAM OFFER STACK</span>
             </h2>
             <p className="text-slate-400 text-xs sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
               Here is the exact value stack you receive today. We address and eliminate every single obstacle in your way:
             </p>
          </div>

          <div className="bg-[#110925]/60 border border-orange-500/30 p-4 sm:p-10 rounded-2xl shadow-2xl space-y-4 sm:space-y-8 max-w-2xl mx-auto text-left relative">
             <div className="absolute top-3 right-3 bg-orange-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider rotate-2 shadow-md">
                Unbeatable Offer
             </div>
             
             {/* Mobile Compressed Stack (Saves 3-4 screens of text scroll) */}
             <div className="block sm:hidden space-y-2.5">
                <div className="space-y-1.5">
                   <div className="flex items-start gap-2 text-xs leading-relaxed tracking-wide font-medium text-slate-200">
                     <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                     <span>Core 6-Week Accelerator <span className="text-orange-400">(₦150,000)</span></span>
                   </div>
                   <div className="flex items-start gap-2 text-xs leading-relaxed tracking-wide font-medium text-slate-200">
                     <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                     <span>✓ Bonus #1: Recruiter ATS Resume Templates <span className="text-orange-400">(₦25,000)</span></span>
                   </div>
                   <div className="flex items-start gap-2 text-xs leading-relaxed tracking-wide font-medium text-slate-200">
                     <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                     <span>✓ Bonus #2: LinkedIn visibility Sprint Script <span className="text-orange-400">(₦30,000)</span></span>
                   </div>
                   <div className="flex items-start gap-2 text-xs leading-relaxed tracking-wide font-medium text-slate-200">
                     <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                     <span>✓ Bonus #3: SME Outreach proposal & templates <span className="text-orange-400">(₦20,000)</span></span>
                   </div>
                   <div className="flex items-start gap-2 text-xs leading-relaxed tracking-wide font-medium text-slate-200">
                     <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                     <span>✓ Bonus #4: 10 Proprietary Real Business Datasets <span className="text-orange-400">(₦25,000)</span></span>
                   </div>
                   <div className="flex items-start gap-2 text-xs leading-relaxed tracking-wide font-medium text-slate-200">
                     <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                     <span>✓ Bonus #5: WhatsApp VIP coach support & Network <span className="text-orange-400">(₦50,000)</span></span>
                   </div>
                </div>
             </div>

             {/* Desktop Full Stack Details */}
             <div className="hidden sm:block space-y-6 divide-y divide-white/5">
                {BONUSES.map((item, idx) => (
                   <div key={idx} className={`pt-6 flex flex-col sm:flex-row justify-between items-start gap-4 ${idx === 0 ? 'border-none pt-0' : ''}`}>
                      <div className="space-y-2 flex-1">
                         <div className="flex items-center gap-2 flex-wrap">
                           <h4 className="text-white font-bold text-sm sm:text-base tracking-tight">{item.title}</h4>
                           <span className="text-[9px] font-black text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                              {item.objection}
                           </span>
                         </div>
                         <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">{item.sub}</p>
                      </div>
                      <div className="text-orange-400 font-serif font-black text-xs sm:text-sm shrink-0 uppercase tracking-widest sm:self-center">
                         {item.val}
                      </div>
                   </div>
                ))}
             </div>

             <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-[10px] font-black tracking-wider uppercase text-slate-400">
                   <span>Total Package Value:</span>
                   <span className="line-through">₦300,000+</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-2">
                   <span className="text-white font-black text-xs sm:text-base uppercase tracking-wider">Your Grand Slam Price Today:</span>
                   <div className="text-right">
                      <span className="text-2xl font-serif font-black text-orange-500 tracking-tighter ">{formatCurrency(fullProgramPrice)}</span>
                      <p className="text-[9px] font-black tracking-wider uppercase text-slate-400">( <span className="text-[9px] font-serif font-black text-orange-500">Installments</span> Available) </p>
                   </div>
                </div>
             </div>
             <div className="text-[10px] font-black text-orange-600 text-center uppercase tracking-wider">
                PAY {formatCurrency(fullProgramInstallment)} NOW AND PAY THE REST BY WEEK 6
             </div>

             <div className="text-center">
                <a 
                  href="#enroll-section" 
                  onClick={scrollToEnroll}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-xl transition-all inline-block text-center"
                >
                   Claim My Grand Slam Offer Now
                </a>
             </div>
          </div>
        </div>
      </section>

      {/* 9. TRAINING SCHEDULE (Desktop only to keep mobile layout minimal and high-converting) */}
      <section className="hidden sm:block py-8 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
           <div className="p-6 sm:p-10 space-y-6 md:w-3/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest">
                High-Flex Efficiency System
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-none uppercase">
                TRAINING <span className="text-orange-500 italic">SCHEDULE</span>
              </h2>
              <p className="text-sm text-slate-600 font-bold uppercase tracking-tight">HOW WE REDUCE YOUR WEEKLY EFFORT:</p>
              
              <div className="space-y-4">
                 <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 bg-approve rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-tight">Monday to Friday (Pre-recorded Lessons)</h4>
                       <p className="text-slate-500 text-xs sm:text-sm font-medium">Bite-sized, practical analytics video lessons released daily (30 to 45 mins). Designed to slot into the busiest schedules easily.</p>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 bg-approve rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-tight">Saturday Live Technical Classes</h4>
                       <p className="text-slate-500 text-xs font-bold italic mb-1">"Build the skills that unlock high-paying job offers."</p>
                       <p className="text-slate-500 text-xs sm:text-sm font-medium">Meet live with Coach Ayodeji for 1 hour where i guide you through real workplace projects, using what you learned during the week. You will get to ask questions and get answers immediately from me.</p>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 bg-approve rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-tight">Sunday Live Monetization Classes</h4>
                       <p className="text-slate-500 text-xs font-bold italic mb-1">"Turn your high-income skills into an active revenue machine."</p>
                       <p className="text-slate-500 text-xs sm:text-sm font-medium">Meet live with Coach Ayodeji to deploy pricing frameworks, outreach strategies, packages, and write proposals.</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 italic font-medium text-slate-500 text-[10px] sm:text-xs">
                Busy schedule? You retake or review any recording via your private student dashboard with permanent lifetime access.
              </div>
           </div>
           
           <div className="md:w-2/5 bg-slate-950 p-6 sm:p-10 flex flex-col justify-center text-center space-y-6 relative overflow-hidden">
              <div className="h-1 w-10 bg-orange-600 rounded-full mx-auto" />
              <div className="space-y-2 relative z-10">
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Direct Risk-Reversal</p>
                 <h3 className="text-xl sm:text-2xl text-white font-serif font-black uppercase leading-tight">LIMITED TO ONLY 30 SEATS</h3>
                 <p className="text-slate-400 text-xs font-medium">{slotSecured}/{slotCap} spots secured. Only {slotsLeft} spots remaining for the {month} 6th class.</p>
              </div>
              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl shadow-orange-600/30 relative z-10 text-center"
              >
                Enroll Now
              </a>
           </div>
        </div>
      </section>

      {/* 10. LEAD TRAINER & QUALITY PROOF MERGED (Meet Your Mentor & Capstone Requirements) - Condensed padding */}
      <section className="py-4 sm:py-24 px-3 sm:px-6 relative overflow-hidden bg-[#0a0514]">
        <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
           <div className="md:w-1/2 relative bg-slate-100 min-h-[220px] sm:min-h-[450px]">
              <img src="/ayodeji_trainer.jpg" alt="Lead Trainer Omidoyin Ayodeji" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-4 sm:p-6 text-white">
                 <h3 className="text-lg sm:text-xl font-serif font-black leading-tight uppercase">Omidoyin Ayodeji</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[8px] sm:text-[9px]">CEO & Lead Data Analyst Trainer</p>
              </div>
           </div>
           
           <div className="md:w-1/2 p-4 sm:p-10 space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                  Elite Mentorship & Capstone Proof
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight uppercase leading-[1.1]">
                  MEET YOUR <br/><span className="text-orange-500 italic">MENTOR</span>
                </h2>
                
                <div className="space-y-1.5">
                   {MENTOR_POINTS.map((point, i) => (
                      <div key={i} className="flex gap-2 items-start font-bold text-slate-600 text-xs sm:text-sm">
                         <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                         <p>{point}</p>
                      </div>
                   ))}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1">
                   <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-wider">THE VELEON CAPSTONE STANDARD:</h4>
                   <p className="text-slate-500 text-xs leading-relaxed tracking-wide font-medium">
                     Anyone can buy a certificate. We require you to prove your skills. Before graduating, every student builds an individual capstone project from scratch, applying SQL querying, Excel cleanup, and Power BI dashboards to a real-world messy dataset to prove active competence.
                   </p>
                </div>
              </div>
              
              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                className="hidden sm:block w-full bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md text-center mt-4"
              >
                 Enroll in the {month} Batch
              </a>
           </div>
        </div>
      </section>

      {/* 11. SECURE CHECKOUT & PAYMENT SECTION (Including Unbeatable Double Guarantee) - Condensed sizes */}
      <section  className="py-4 sm:py-24 px-3 sm:px-6 relative overflow-hidden bg-slate-900/30 border-t border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[250px] bg-orange-500/10 blur-[90px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-1.5">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               Secure Checkout
             </div>
             <h2 className="text-lg sm:text-5xl font-serif font-black tracking-tight leading-none uppercase">
               SECURE YOUR SPOT <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">FOR {month} 2026 NOW</span>
             </h2>
             <p className="text-orange-500 text-[10px] sm:text-sm font-black uppercase tracking-widest max-w-md mx-auto animate-pulse">
               ⚡️ FINAL SPOTS REMAINING - REGISTRATION CLOSING SOON
             </p>
          </div>

          {/* Simple 4-Step Process Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 max-w-4xl mx-auto text-left">
            {CHECKOUT_STEPS.map((step, i) => (
               <div 
                  key={i} 
                  onClick={() => {
                     const element = document.getElementById('checkout-panel');
                     if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }
                  }}
                  className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-start gap-3 hover:border-orange-500/30 hover:bg-white/10 hover:scale-[1.02] cursor-pointer transition-all active:scale-[0.98] select-none"
               >
                  <div className="h-6 w-6 rounded bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-lg shadow-orange-500/10">{step.n}</div>
                  <div className="space-y-0.5">
                     <h4 className="text-[10px] font-black uppercase tracking-tight text-white">{step.t}</h4>
                     <p className="text-slate-400 text-xs leading-relaxed tracking-wide font-medium">{step.d}</p>
                  </div>
               </div>
            ))}
          </div>

          {/* The Unbeatable Hormozi-Style "Double Guarantee" (Ultimate Risk Reversal) */}
          <div className="bg-[#110925] border border-orange-500/30 p-4 sm:p-10 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-left relative max-w-3xl mx-auto shadow-2xl">
             <div className="shrink-0 h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                <ShieldCheck className="h-7 w-7 animate-pulse" />
             </div>
             <div className="space-y-2">
                <h3 className="text-sm sm:text-2xl font-serif font-black uppercase tracking-tight text-orange-400 italic">
                   THE UNBEATABLE "DO-THE-WORK" DOUBLE GUARANTEE
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed tracking-wide font-medium">
                   We absorb 100% of the risk:
                   <span className="block mt-1 text-white font-extrabold">
                      🛡️ Guarantee #1: The 14-Day Performance Check
                   </span>
                   Try the first two weeks. If you aren't absolutely blown away, message us for a 100% immediate refund.
                   <span className="block mt-1 text-white font-extrabold">
                      🛡️ Guarantee #2: The Ayodeji 1-on-1 Action Guarantee
                   </span>
                   If you attend the sessions, submit tasks, and build your capstone—and you still don’t feel 100% confident querying databases or building dashboard portfolios... Coach Ayodeji will work with you 1-on-1 for free. If you still want your money back, we will refund every single Kobo of tuition **AND** let you keep templates for free just to compensate for your time.
                </p>
             </div>
             <div className="absolute -top-2.5 -right-2 bg-orange-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg rotate-3">
                Zero Risk
             </div>
          </div>

          {/* Checkout Core Form Panel - Tighter padding & inputs */}
          <div id="checkout-panel" className="bg-white text-slate-900 rounded-2xl border-t-4 border-orange-600 shadow-2xl overflow-hidden max-w-3xl mx-auto p-4 sm:p-8 text-left grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-start">
             {/* Left Column: Plan selection and benefits */}
             <div id="enroll-section" className="space-y-4" >
                <div className="space-y-1.5">
                   <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">1. CHOOSE PAYMENT TERM:</h3>
                   <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                         type="button"
                         onClick={() => setIsInstallment(false)}
                         className={`flex-1 text-center py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${!isInstallment ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                         Pay In Full
                      </button>
                      <button
                         type="button"
                         onClick={() => setIsInstallment(true)}
                         className={`flex-1 text-center py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${isInstallment ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                         Pay Small Small
                      </button>
                   </div>
                   {
                    isInstallment &&
                    <div className="text-[10px] font-black text-orange-600 text-center uppercase tracking-wider">
                      PAY { selectedTrack === 'full' ? formatCurrency(fullProgramInstallment) : formatCurrency(ExcelAndAIInstallment)} NOW AND PAY THE REST BY WEEK 6
                    </div>
                   }
                </div>

                <div className="space-y-0.5">
                   <h3 className="text-xs font-black uppercase tracking-tight text-slate-900">2. SELECT COHORT PACKAGE:</h3>
                   <p className="text-slate-400 text-[9px] font-black tracking-wider uppercase">Select which program track you are enrolling for:</p>
                </div>

                <div className="flex flex-col gap-2.5">
                   {/* Option 1 Button */}
                   <button 
                     type="button"
                     onClick={() => setSelectedTrack('full')}
                     className={`w-full p-3 rounded-xl border-2 text-left relative overflow-hidden transition-all flex flex-col gap-0.5 ${selectedTrack === 'full' ? 'border-orange-500 bg-orange-500/5 shadow-md' : 'border-slate-200 bg-white hover:border-orange-500/40'}`}
                   >
                      <div className="absolute top-0 right-0 bg-orange-500 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
                        Best Value
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Option 1</p>
                      <h4 className="text-sm font-black tracking-tight text-slate-900 font-bold">Full Accelerator Program</h4>
                      <div className="flex items-baseline gap-1 mt-0.5">
                         <span className="text-lg font-black text-orange-600 tracking-tighter">
                            {isInstallment ? formatCurrency(fullProgramInstallment) : formatCurrency(fullProgramPrice)}
                         </span>
                         <span className="text-slate-400 line-through text-[10px] font-semibold">₦50,000</span>
                      </div>
                      <p className="text-slate-500 text-[10px] font-medium mt-0.5 leading-tight italic">
                         {isInstallment 
                           ? "(INSTALLMENT DEPOSIT. BALANCE OF " + formatCurrency(fullProgramPriceRemaining) + " DUE BY WEEK 6. INCLUDES ALL 5 BONUSES)" 
                           : "(INCLUDES EXCEL + SQL + POWER BI + AI + MONETIZATION + ALL 5 BONUSES)"}
                      </p>
                   </button>

                   {/* Option 2 Button */}
                   <button 
                     type="button"
                     onClick={() => setSelectedTrack('excel_only')}
                     className={`w-full p-3 rounded-xl border-2 text-left relative overflow-hidden transition-all flex flex-col gap-0.5 ${selectedTrack === 'excel_only' ? 'border-orange-500 bg-orange-500/5 shadow-md' : 'border-slate-200 bg-white hover:border-orange-500/40'}`}
                   >
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Option 2</p>
                      <h4 className="text-sm font-black tracking-tight text-slate-900 font-bold">Excel + AI Track Only</h4>
                      <div className="flex items-baseline gap-1 mt-0.5">
                         <span className="text-lg font-black text-orange-600 tracking-tighter">
                            {isInstallment ?  formatCurrency(ExcelAndAIInstallment) : formatCurrency(ExcelAndAIPrice)}
                         </span>
                         <span className="text-slate-400 line-through text-[10px] font-semibold">₦30,000</span>
                      </div>
                      <p className="text-slate-500 text-[10px] font-medium mt-0.5 leading-tight italic">
                         {isInstallment 
                           ? "(INSTALLMENT DEPOSIT. BALANCE OF " + formatCurrency(ExcelAndAIPriceRemaining) + " DUE BY WEEK 6. NO SQL / POWER BI / LINKEDIN SPRINT)" 
                           : "(INCLUDES DATASETS + EXCEL + AI MODULES ONLY. NO SQL / POWER BI / LINKEDIN SPRINT)"}
                      </p>
                   </button>
                </div>

                <div className="p-3 bg-orange-600/5 rounded-lg border border-orange-600/20 flex gap-2 items-center">
                   <Info className="h-4.5 w-4.5 text-orange-600 shrink-0" />
                   <p className="text-[10px] text-slate-500 font-medium leading-tight">
                     Cohort spots are locked in sequence. Your special Grand Slam rate is highly protected.
                   </p>
                </div>
             </div>

             {/* Right Column: Secure Details Input */}
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-orange-600" /> Secure {month} Batch Entry
                  </h4>
                  <p className="text-slate-400 text-[10px] font-medium leading-tight">Your data is safe and encrypted.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                   <div className="space-y-0.5">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-0.5">Full Name</label>
                     <input 
                       type="text" 
                       required
                       placeholder="e.g. Ebuka John"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans text-base md:text-sm"
                     />
                   </div>
                   <div className="space-y-0.5">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-0.5">Email Address</label>
                     <input 
                       type="email" 
                       required
                       placeholder="e.g. ebuka@gmail.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans text-base md:text-sm"
                     />
                   </div>
                   <div className="space-y-0.5">
                     <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-0.5">WhatsApp Number</label>
                     <input 
                       type="tel" 
                       required
                       placeholder="e.g. +234 816 000 0000"
                       value={whatsapp}
                       onChange={(e) => setWhatsapp(e.target.value)}
                       className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans text-base md:text-sm"
                     />
                   </div>

                   <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight text-slate-900">
                        <span>Amount Due Now:</span>
                        <span className="text-base text-orange-600 font-serif font-black">
                          {isInstallment ? selectedTrack === 'full' ? formatCurrency(fullProgramInstallment) : formatCurrency(ExcelAndAIInstallment) : selectedTrack === 'full' ? formatCurrency(fullProgramPrice) : formatCurrency(ExcelAndAIPrice)}
                        </span>
                      </div>
                   </div>

                   <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-1.5">
                     SECURE MY SEAT NOW <ArrowRight className="h-3.5 w-3.5" />
                   </button>
                   
                   {/* Direct WhatsApp Help Button */}
                   <a 
                     href={`https://wa.me/2348149517851?text=Hello%20Coach%20Omidoyin,%20I%20have%20a%20question%20about%20the%20${month}%20cohort%20Data%20Analysis%20Accelerator...`}
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                   >
                     <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                     Have Questions? Chat on WhatsApp
                   </a>
                </form>

                {/* Direct Manual Bank Transfer Option */}
                <div className="pt-1.5 border-t border-slate-200">
                    <div className="bg-white p-3 rounded-xl border-dashed border-2 border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-600 font-black uppercase text-[9px] tracking-wider">
                        <Building2 className="h-4 w-4 animate-pulse text-orange-600" /> Fast Manual Transfer Option
                      </div>

                      <p className="text-slate-500 ml-0.5 leading-relaxed">To bypass automated gateway delays and lock in your Fast-Action discount instantly, you can transfer directly to our head coach. Onboarding approved within 15 minutes.</p>
                      <div className="space-y-0.5 pt-1">
                        <div className="flex justify-between items-center">
                           <span className="font-bold text-slate-400 uppercase text-[9px]">Bank:</span>
                           <span className="font-black text-slate-900">Guaranty Trust Bank (GTB)</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="font-bold text-slate-400 uppercase text-[9px]">Account Name:</span>
                           <span className="font-black text-slate-900 truncate">Ayodeji Omidoyin</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="font-bold text-slate-400 uppercase text-[9px]">Account Number:</span>
                           <span className="font-black text-slate-900 text-xs select-all underline decoration-orange-600 decoration-1">0212516916</span>
                        </div>
                      </div>
                      <div className="bg-[#25D366]/5 p-1.5 rounded-md border border-[#25D366]/20 text-emerald-700 text-[9px] font-black uppercase tracking-wider text-center font-bold">
                        Send Receipt to WhatsApp: +234 810 528 1572
                      </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 12. FAQs SECTION - Condensed paddings & margins */}
      <section className="py-4 sm:py-24 px-3 sm:px-6 border-t border-white/5 bg-[#020617]">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-10">
          <div className="text-center space-y-1">
             <h2 className="text-lg sm:text-4xl font-serif font-black tracking-tight uppercase">
                FREQUENTLY ASKED QUESTIONS
             </h2>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">
                Addressing every objection to make your decision simple:
             </p>
          </div>

          <div className="space-y-4">
             {FAQS.map((faq, idx) => (
                <div key={idx} className="pb-4 border-b border-white/10 space-y-1.5 text-left">
                  <div className="flex gap-2 items-start">
                     <span className="text-orange-500 font-serif font-black text-sm shrink-0">Q.</span>
                     <h3 className="font-serif font-black text-xs sm:text-lg text-white leading-tight">
                       {faq.q}
                     </h3>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed tracking-wide font-medium pl-5">
                    {faq.a}
                  </p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Floating/Sticky Mobile CTA Footer - Condense size */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-md border-t border-white/10 px-3 py-2 flex items-center justify-between shadow-2xl">
        <div className="space-y-0.5">
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{month} Batch Enrollment</p>
           <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-orange-500">
                 {isInstallment ? formatCurrency(fullProgramInstallment) : selectedTrack === 'full' ? formatCurrency(fullProgramPrice) : formatCurrency(ExcelAndAIPrice)}
              </span>
              <span className="text-[8px] font-bold text-slate-400 line-through">
                 {selectedTrack === 'full' ? '₦50,000' : '₦30,000'}
              </span>
           </div>
        </div>
        <a 
          href="#enroll-section"
          onClick={scrollToEnroll}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-[0_5px_15px_rgba(249,115,22,0.4)] active:scale-95 transition-transform flex items-center gap-1"
        >
          Enroll Now <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Footer minimal */}
      <footer className="py-8 sm:py-20 border-t border-white/5 text-center space-y-4 px-4 pb-20 md:pb-20">
        <img src="/veleonacademy_logo.jpg" alt="Logo" className="h-6 sm:h-10 mx-auto grayscale opacity-40 hover:opacity-100 transition-opacity" />
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-slate-600 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
           <Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
           <Link to="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link>
           <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Contact Support</a>
        </div>
        <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-700 font-bold">© {new Date().getFullYear()} Veleon Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default SalesLandingPage;
