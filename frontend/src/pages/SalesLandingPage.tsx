import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Star, 
  Zap, 
  Clock, 
  Calendar,
  PlayCircle,
  FileText,
  Cpu,
  Target,
  ChevronDown,
  Building2,
  Lock,
  Info,
  HeartHandshake,
  ArrowDown,
  Wallet
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../utils/constants';
import { http } from '../api/http';


declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    clarity?: any;
  }
}

// Helper: fire a Microsoft Clarity custom event (safe — queues if Clarity not loaded yet)
const clarityEvent = (name: string, value?: string) => {
  try {
    if (typeof window !== 'undefined') {
      window.clarity = window.clarity || function() {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
      window.clarity('event', name, value);
    }
  } catch { /* noop */ }
};


const SalesLandingPage: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<'full' | 'excel_only'>('full');
  const [isInstallment, setIsInstallment] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 9, hours: 0, minutes: 0, seconds: 0 });

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

  const month = "July"
  const cap = 30;
  const secured = 15;
  const remaining = cap - secured;
  const targetDate = "2026-07-02T23:59:59"

  const price1 = "₦25,999"
  const price2 = "₦15,999"
  const installment1 = "₦10,999"
  const installment2 = "₦10,999"
  const priceremaining1 = "₦15,000"
  const priceremaining2 = "₦5,000"
  
  

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
  }, []);

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
    if (isInstallment) return 10000;
    return selectedTrack === 'full' ? 25000 : 15000;
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

        {/* Inline CSS animations replacing Framer Motion for speed */}
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
        `}</style>

        {/* Top Banner Urgency & Scarcity */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-50 flex flex-wrap justify-center items-center gap-2">
        <span>⚠️ {month} Batch Enrollment Capped to {cap} Spots: {secured} Secured — Only {remaining} Seats Left!</span>
        <span className="hidden sm:inline">•</span>
        <span className="bg-black/20 px-2 py-0.5 rounded ">
          Closes in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s ⏳
        </span>
      </div>

        {/* 1. HERO SECTION (Dream Outcome & Value Equation) */}
        <section className="relative pt-12 sm:pt-24 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden">
          {/* Background glow highlights */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[300px] sm:h-[600px] bg-orange-500/10 blur-[100px] sm:blur-[150px] rounded-full -z-10" />
          <div className="absolute top-[20%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-10">
            <div className="flex justify-center mb-4 sm:mb-8 anim-fade-down">
              <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl border border-white/10">
                <img src="/veleonacademy_logo.jpg" alt="Veleon Academy Logo" className="h-16 sm:h-14 px-4 py-2" fetchPriority="high" />
              </div>
            </div>

            <div className="space-y-2 anim-scale-in">
              <h1 
                className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight leading-[1.15] text-white uppercase animate-pulse"
                id="hero-heading"
              >
                STOP GUESSING WHAT TO LEARN TO BECOME A DATA ANALYST
              </h1>
            </div>

            <p 
              className="text-slate-300 text-base sm:text-2xl max-w-3xl mx-auto leading-relaxed font-medium px-2 anim-fade-up-d2"
            >
              Build real portfolio projects, master Excel + SQL + Power BI + AI, and become job-ready in 6 weeks—even if you're starting from scratch.
            </p>

            {/* Bullet list of benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto anim-fade-up-d3 pt-2">
              {[
                "Beginner-Friendly Roadmap",
                "Real Business Projects",
                "CV + LinkedIn Career Toolkit",
                "Freelancing & Client Acquisition Training",
                "Direct Mentor Support"
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-slate-300 text-sm sm:text-base font-bold bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                  <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Urgent Ticking Visual Board */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 max-w-2xl mx-auto backdrop-blur-sm grid grid-cols-4 gap-2 text-center shadow-xl">
              {[
                { val: timeLeft.days, label: "Days" },
                { val: timeLeft.hours, label: "Hours" },
                { val: timeLeft.minutes, label: "Minutes" },
                { val: timeLeft.seconds, label: "Seconds" }
              ].map((unit, idx) => (
                <div key={idx} className="bg-slate-950/80 p-3 rounded-2xl border border-white/5">
                  <div className="text-2xl sm:text-4xl font-serif font-black text-orange-500">{String(unit.val).padStart(2, '0')}</div>
                  <div className="text-[8px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">{unit.label}</div>
                </div>
              ))}
            </div>

            {/* Flyer Badges */}
            <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto pt-2">
              {["6 WEEKS", "100% ONLINE", "SATURDAY REVENUE CLASSES", "DOUBLE MONEY-BACK GUARANTEE"].map((b, i) => (
                <span key={i} className="px-3.5 py-1 text-[9px] font-black tracking-widest text-orange-400 border border-orange-500/20 bg-orange-500/5 rounded-full uppercase">
                  {b}
                </span>
              ))}
            </div>

            <div className="flex flex-col items-center pt-2 sm:pt-6 anim-fade-up-d3">
              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                id="cta-hero-enroll"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white px-8 sm:px-16 py-5 sm:py-7 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] active:scale-95 flex items-center justify-center gap-3"
              >
                Claim My Grand Slam Offer Now <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              </a>
              <p className="mt-4 text-slate-400 text-sm font-black uppercase tracking-wider flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
                <Clock className="h-4 w-4 text-orange-500 animate-pulse" /> Only {remaining} Seats Remaining For The {month} Cohort
              </p>
            </div>

            {/* Social Proof Intro Card */}
            <div className="mt-10 sm:mt-16 bg-white text-slate-900 p-6 sm:p-10 rounded-[2rem] shadow-2xl text-left relative overflow-hidden anim-fade-up-d5">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users className="h-16 w-16 sm:h-24 sm:w-24 text-orange-500" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative z-10">
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg bg-slate-100">
                   <img src="/ayodeji_trainer.jpg" alt="Coach Omidoyin Ayodeji" className="w-full h-full object-cover" loading="lazy"  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-lg sm:text-2xl font-serif font-black tracking-tight leading-tight uppercase">
                    "I don't just teach data analytics. I install a system that enables you to build high-paying dashboard services."
                  </h3>
                  <p className="text-orange-600 font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center sm:justify-start gap-1">
                     Omidoyin Ayodeji • CEO, Veleon Academy Technologies <CheckCircle2 className="h-3.5 w-3.5" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* 2. PROBLEM SECTION (Why Most Aspiring Data Analysts Never Get Hired) */}
      <section className="py-4 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-slate-950 border-t border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-red-500/5 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-12">
          <div className="text-center space-y-4">
            <span className="text-red-500 text-xs font-black uppercase tracking-[0.2em]">The Hard Reality</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight uppercase text-white">
              WHY MOST ASPIRING DATA ANALYSTS <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 italic">NEVER GET HIRED</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Left side: The Problem */}
            <div className="bg-red-950/20 border border-red-500/20 p-6 sm:p-8 rounded-[2rem] space-y-4 sm:space-y-6 flex flex-col justify-between">
              <div className="space-y-3 sm:space-y-4 text-left">
                <p className="text-slate-200 text-base sm:text-lg font-bold">
                  Most people think they need more certificates.
                </p>
                <p className="text-red-400 text-xl font-black uppercase tracking-wider font-bold">
                  They don't.
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                  The real problem is they never build projects that prove they can solve business problems. That's why they spend months learning... yet still don't feel ready for interviews.
                </p>
              </div>

              {/* Red crosses */}
              <div className="space-y-2.5 sm:space-y-3 pt-4 border-t border-red-500/10 text-left">
                {[
                  "Collecting certificates",
                  "Watching endless tutorials",
                  "Learning random tools",
                  "Applying without a portfolio"
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 items-center text-slate-300 font-bold text-sm">
                    <span className="text-red-500 shrink-0">❌</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: The Climax & Solution */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 sm:p-8 rounded-[2rem] space-y-6 flex flex-col justify-center text-center">
              <div className="space-y-2">
                <p className="text-slate-400 text-xs sm:text-sm font-black uppercase tracking-widest">The Hiring Filter</p>
                <h3 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white leading-tight">
                  Employers don't pay for certificates.
                </h3>
                <div className="py-2 inline-block">
                  <span className="text-4xl sm:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">
                    They pay for proof.
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                <p className="text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed">
                  That's why every student inside the <span className="text-white font-extrabold">Veleon Elite Accelerator</span> builds practical portfolio projects using real-world datasets before graduation.
                </p>
              </div>

              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Enroll Risk-Free Now <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHO THIS IS PERFECT FOR SECTION */}
      <section className="py-4 sm:py-24 px-4 sm:px-6 bg-slate-900/40 relative border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <span className="text-orange-500 text-xs font-black uppercase tracking-[0.2em]">Targeted Audience</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight uppercase text-white">
              WHO THIS IS PERFECT FOR
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-semibold">
              This program was built for people who want a clear path into Data Analysis without wasting months figuring everything out themselves.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
            {[
              { 
                cat: "Students", 
                desc: "Gain a head start and prepare for the job market by learning real corporate data analytics skills early." 
              },
              { 
                cat: "Graduates", 
                desc: "Equip yourself with SQL querying, Excel reporting, and Power BI skills that recruiter bot filters prioritize." 
              },
              { 
                cat: "Job Seekers", 
                desc: "Gain raw capstone portfolio project assets and SQL expertise to outshine candidates in corporate interviews." 
              },
              { 
                cat: "Career Transitioners", 
                desc: "Successfully pivot into high-paying corporate data roles, even starting with zero prior technical code experience." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] group hover:border-orange-500/50 hover:bg-white/10 transition-all flex flex-col gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-serif font-black tracking-tight uppercase text-white group-hover:text-orange-400 transition-colors">{item.cat}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 sm:py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20"
            >
              Secure My Grand Slam Offer <ArrowRight className="h-4.5 w-4.5" />
            </a>
            <Link to="/reviews" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 sm:py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              See Student Proof <PlayCircle className="h-4.5 w-4.5 text-orange-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. LEAD TRAINER SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden border-b border-white/5">
        <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
           <div className="md:w-1/2 relative bg-slate-100 min-h-[250px] sm:min-h-[400px]">
              <img src="/ayodeji_trainer.jpg" alt="Lead Trainer Omidoyin Ayodeji" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Omidoyin Ayodeji</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">CEO & Lead Data Analyst Trainer</p>
              </div>
           </div>
           
           <div className="md:w-1/2 p-6 sm:p-10 space-y-6 text-left flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest">
                  Elite Mentorship
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight uppercase leading-[1.1]">
                  ABOUT YOUR <br/><span className="text-orange-500 italic">MENTOR</span>
                </h2>
                
                <div className="space-y-2">
                   {[
                     "CEO of Veleon Academy Technologies",
                     "5+ Year Software Engineer & Tech Consultant who builds the actual systems data flows through.",
                     "Successfully mentored multiple cohorts of working analysts",
                     "Creator of the Veleon 6-Week Monetization Blueprint system"
                   ].map((point, i) => (
                      <div key={i} className="flex gap-2 items-center font-bold text-slate-600 text-xs sm:text-sm">
                         <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                         {point}
                      </div>
                   ))}
                </div>
              </div>
              
              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md text-center block mt-4"
              >
                 Enroll in the {month} Batch
              </a>
           </div>
        </div>
      </section>

      {/* 5. STUDENT TESTIMONIALS SECTION (Proof) */}
      <section className="py-4 sm:py-24 px-4 sm:px-6 bg-orange-500/5 space-y-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-3">
           <h4 className="text-orange-500 font-black uppercase tracking-[0.25em] text-[9px] sm:text-xs">Real Proof: High Likelihood of Success</h4>
           <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight uppercase px-1 text-white">"THE ACADEMY REMOVED MY STUCK-FEELINGS & GAVE ME PRACTICAL PORTFOLIO POWER"</h2>
        </div>

        {/* Cornelius Testimonial */}
        <div className="max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-10 rounded-[2rem] shadow-xl relative">
          <div className="absolute -top-3 -left-3 bg-orange-500 p-3 rounded-xl text-white shadow-lg">
             <Star className="h-5 w-5 fill-current" />
          </div>
          
          {/* Before/After summary */}
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-left mb-6 font-sans">
            <div>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-widest block">Before:</span>
              <p className="text-slate-700 text-xs sm:text-sm font-bold">Unsure where to start in Data Analysis.</p>
            </div>
            <div className="hidden sm:block border-r border-orange-200" />
            <div>
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest block">After:</span>
              <p className="text-slate-700 text-xs sm:text-sm font-bold">Built practical projects and gained confidence working with data.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
            <div className="shrink-0 w-24 h-24 sm:w-36 sm:h-36 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
              <img src="/cornelius.jpg" alt="Data Analyst Trainee - CS" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="text-lg font-serif font-black text-orange-600 uppercase">Cornelius</h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data Analyst Trainee, Batch 2</p>
              </div>
              <div className="relative text-left">
                <span className="absolute -top-4 -left-4 text-5xl text-slate-100 font-serif leading-none -z-10">"</span>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed italic relative z-10">
                  "My experience at Veleon Academy as a data analyst trainee has been very impactful. I’ve gained practical skills in data analysis, especially in Excel, data cleaning, and visualization. The training is well-structured and easy to understand, with hands-on projects that helped me apply what I learned. The instructors are supportive and always ready to help. Overall, the academy has boosted my confidence and given me a strong foundation in data analysis. I highly recommend it to anyone starting a career in this field. 100% ✅"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Segun Testimonial */}
        <div className="max-w-4xl mx-auto bg-slate-900 border border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-xl relative">
          {/* Before/After summary */}
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-left mb-6 font-sans">
            <div>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest block">Before:</span>
              <p className="text-slate-300 text-xs sm:text-sm font-bold">Struggled with disorganized learning materials and lack of guidance.</p>
            </div>
            <div className="hidden sm:block border-r border-orange-500/20" />
            <div>
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest block">After:</span>
              <p className="text-slate-300 text-xs sm:text-sm font-bold">Mastered structured data analytics and successfully built business-ready dashboard solutions.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
             <div className="md:w-1/2 relative bg-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
                <img src="/Testimonial_segun.jpg" alt="Cohort 2 Student Segun" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 text-white text-left">
                   <h3 className="text-xl font-serif font-black leading-tight uppercase">Segun</h3>
                   <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
                </div>
             </div>
             <div className="md:w-1/2 flex flex-col justify-center space-y-4 text-left">
               <h3 className="text-white font-serif font-black text-xl uppercase">Fast tracked career ready portfolio</h3>
               <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                 Segun joined Veleon Academy to transition from theory to real-world deployment. The intensive cohort modules and supportive mentor check-ins allowed him to build data dashboards that match institutional quality.
               </p>
             </div>
          </div>
        </div>

        {/* Barry Testimonial */}
        <div className="max-w-4xl mx-auto bg-slate-900 border border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-xl relative">
          {/* Before/After summary */}
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-left mb-6 font-sans">
            <div>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest block">Before:</span>
              <p className="text-slate-300 text-xs sm:text-sm font-bold">Needed practical experience to complement theoretical knowledge.</p>
            </div>
            <div className="hidden sm:block border-r border-orange-500/20" />
            <div>
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest block">After:</span>
              <p className="text-slate-300 text-xs sm:text-sm font-bold">Built real capstone projects and gained technical SQL & Power BI confidence for hiring managers.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
             <div className="md:w-1/2 relative bg-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
                <img src="/Testimonial_Barry.jpg" alt="Cohort 2 Student Barry" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 text-white text-left">
                   <h3 className="text-xl font-serif font-black leading-tight uppercase">Barry</h3>
                   <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
                </div>
             </div>
             <div className="md:w-1/2 flex flex-col justify-center space-y-4 text-left">
               <h3 className="text-white font-serif font-black text-xl uppercase">Real corporate workflows</h3>
               <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                 Barry built a highly detailed end-to-end relational database workspace. Through direct coaching and practical exercises, he bridged the gap from simple worksheets to advanced analytical capabilities.
               </p>
             </div>
          </div>
        </div>

        {/* Batch 3 Graduate Testimonial */}
        <div className="max-w-4xl mx-auto bg-slate-900 border border-white/10 p-6 sm:p-10 rounded-[2rem] shadow-xl relative">
          {/* Before/After summary */}
          <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-left mb-6 font-sans">
            <div>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest block">Before:</span>
              <p className="text-slate-300 text-xs sm:text-sm font-bold">Tried self-teaching through scattered online tutorials.</p>
            </div>
            <div className="hidden sm:block border-r border-orange-500/20" />
            <div>
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest block">After:</span>
              <p className="text-slate-300 text-xs sm:text-sm font-bold">Mastered data pipelines with a logical, step-by-step corporate methodology.</p>
            </div>
          </div>

          <div className="text-left space-y-4">
             <h3 className="text-xl sm:text-2xl font-serif font-black leading-tight uppercase text-orange-400">"THE METHODOLOGY IS EXTREMELY LOGICAL, PRACTICAL, AND EASY TO ABSORB"</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Feedback from a Batch 3 Graduate</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
             <a 
               href="#enroll-section" 
               onClick={scrollToEnroll}
               className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-md text-center"
             >
                Claim My Grand Slam Offer
             </a>
             <Link to="/reviews" className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all text-center">
                Read Success Stories
             </Link>
        </div>
      </section>

      {/* 6. OUTCOMES SECTION (Minimizing Effort & Time Delay) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden relative bg-slate-950 border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
             <span className="text-orange-500 text-xs font-black uppercase tracking-[0.2em] block">MAXIMUM VALUE • MINIMUM FRICTION</span>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight uppercase leading-tight text-white">
               BY THE END OF THIS PROGRAM, YOU'LL BE ABLE TO:
             </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center ">
            <div className="relative  sm:aspect-square md:aspect-auto rounded-[2rem] overflow-hidden group shadow-xl bg-gradient-to-br from-slate-900 via-orange-950/40 to-slate-900 flex items-end min-h-[300px]">
               <div className="absolute inset-0 flex items-center justify-center opacity-10">
                 <svg viewBox="0 0 100 100" className="w-48 h-48 text-orange-500" fill="currentColor"><path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"/></svg>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent  " />
               <div className="absolute bottom-4 left-4 right-4 w-full pr-8">
                  <div className="bg-orange-500/90 backdrop-blur-md p-4 rounded-xl">
                    <p className="text-white font-black text-sm  uppercase tracking-wider text-center">BECOME THE HIGH-STATUS TECH ASSET BUSINESSES PAY RETAINERS FOR</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              {[
                "Build professional dashboards using Excel and Power BI",
                "Query databases confidently using SQL",
                "Create portfolio projects recruiters can actually evaluate",
                "Present data insights in a way decision-makers understand",
                "Apply for analyst roles with confidence",
                "Offer dashboard and reporting services to businesses"
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/50 transition-colors group`}
                >
                  <div className="h-7 w-7 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-100 text-left">{item}</p>
                </div>
              ))}
              
              <a 
                href="#enroll-section" 
                onClick={scrollToEnroll}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
              >
                Yes, I Want to Secure These Skills <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COURSE OVERVIEW & MODULES (System Milestones) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/40 border-b border-white/5">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               6-Week System Milestones
             </div>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-none text-white">
               THE SYSTEM <span className="text-orange-500 italic">MILESTONES</span>
             </h2>
             <p className="text-slate-400 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
               Each track is specifically engineered to overcome a standard career-limiting obstacle:
             </p>
          </div>

          {/* Timeline Stack */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {[
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
                desc: "Query databases from scratch (SELECT, DISTINCT, WHERE, ORDER BY). Master the art of multi-table Joins (INNER, LEFT) to analyze customer databases. Learn advanced SQL techniques used in real analyst roles and technical interviews, and subqueries/CTEs to solve real-world analyst SQL interview patterns." 
              },
              { 
                step: "TRACK 3", 
                title: "Power BI Storytelling & Star Schema Modeling (Week 5)", 
                objection: "Overcomes: 'I do not know how to present my results to managers'",
                desc: "Connect multiple CSV, Excel, and database sources in Power Query. Learn how to organize and model business data so your dashboards remain accurate and easy to maintain. Master DAX calculation metrics (Measures, CALCULATE, Time Intelligence) and configure Row-Level Security." 
              },
              { 
                step: "TRACK 4", 
                title: "AI Tools & Client Monetization Blueprint (Week 6)", 
                objection: "Overcomes: 'I don't know how to land a job or make money with my skills'",
                desc: "Leverage advanced ChatGPT and Gemini prompt frameworks to accelerate workflows. Optimize your LinkedIn personal brand (Headline, About, visibility sprint) and build an ATS-optimized resume. Learn to price SME dashboard packages, write high-converting proposals, and secure recurring monthly reporting retainers." 
              }
            ].map((mod, i) => (
              <div 
                key={i} 
                className="bg-[#0b0f19] border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 items-start relative hover:border-orange-500/40 transition-all group"
              >
                <div className="bg-orange-500 text-white font-black text-xs tracking-widest px-3 py-1 rounded-full shrink-0 animate-bounce">
                   {mod.step}
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black tracking-wider text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                     {mod.objection}
                  </span>
                  <h3 className="text-lg font-serif font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                     {mod.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                     {mod.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-6">
             <a 
               href="#enroll-section" 
               onClick={scrollToEnroll}
               className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
             >
               Start Learning Now <ArrowRight className="h-4 w-4" />
             </a>
          </div>
        </div>
      </section>

      {/* 8. TRAINING SCHEDULE SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative bg-[#060b18] border-b border-white/5">
        <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
           <div className="p-6 sm:p-10 space-y-6 md:w-3/5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest">
                High-Flex Efficiency System
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-none uppercase text-slate-900">
                TRAINING <span className="text-orange-500 italic">SCHEDULE</span>
              </h2>
              <p className="text-sm text-slate-600 font-bold uppercase tracking-tight">HOW WE REDUCE YOUR WEEKLY EFFORT:</p>
              
              <div className="space-y-4">
                 <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 bg-approve rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Monday to Friday (Pre-recorded Lessons)</h4>
                       <p className="text-slate-500 text-xs sm:text-sm font-medium">Bite-sized, practical analytics video lessons released daily (30 to 45 mins). Designed to slot into the busiest schedules easily.</p>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 bg-approve rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Saturday Live Technical Classes</h4>
                       <p className="text-slate-500 text-xs font-bold italic mb-1">"Build the skills that unlock high-paying job offers."</p>
                       <p className="text-slate-500 text-xs sm:text-sm font-medium">Meet live with Coach Ayodeji for 1 hour where I guide you through real workplace projects, using what you learned during the week. You will get to ask questions and get answers immediately from me.</p>
                    </div>
                 </div>
                 <div className="flex gap-3 items-start">
                    <div className="h-8 w-8 bg-approve rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
                       <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                       <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Sunday Live Monetization Classes</h4>
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
                 <h3 className="text-xl sm:text-2xl text-white font-serif font-black uppercase leading-tight">LIMITED TO ONLY {cap} SEATS</h3>
                 <p className="text-slate-400 text-xs font-medium">{secured}/{cap} spots secured. Only {remaining} spots remaining for the {month} batch.</p>
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

      {/* 9. ALEX HORMOZI $100M GRAND SLAM OFFER STACK */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0a0514] border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
                Your No-Brainer Value Stack
             </div>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-none uppercase text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">THE GRAND SLAM OFFER STACK</span>
             </h2>
             <p className="text-slate-400 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
                Most courses teach tools. This accelerator helps you build skills, projects, career assets, and income opportunities—all in one structured roadmap.
             </p>
          </div>

          <div className="bg-[#110925]/60 border border-orange-500/30 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl space-y-8 max-w-2xl mx-auto text-left relative">
             <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest rotate-2 shadow-md">
                Unbeatable Offer
             </div>
             
             {/* Offer Stack Items */}
             <div className="space-y-6 divide-y divide-white/5">
                {[
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
                    val: '₦25,000'
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
                    val: '₦25,000'
                  },
                  { 
                    title: "Bonus #5: WhatsApp VIP Direct Support & Private Alumni Network", 
                    sub: "Direct access to Coach Ayodeji and batch graduates to review broken queries and grading support.", 
                    objection: "Busts: 'What if I get completely stuck with code or formula errors?'",
                    val: "₦50,000" 
                  }
                ].map((item, idx) => (
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

             {/* Total vs Price comparison */}
             <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                   <span>Combined Real Value:</span>
                   <span className="line-through text-slate-500 font-serif font-black">₦300,000+</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                   <span className="text-white font-black text-sm sm:text-base uppercase tracking-wider">Your Grand Slam Price Today:</span>
                   <div className="text-right">
                      <span className="text-3xl font-serif font-black text-orange-500 tracking-tighter">{price1}</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">( <span className="text-[10px] font-serif font-black text-orange-500 ">Installments</span> Available) </p>
                   </div>
                </div>
             </div>
             
             <div className="text-xs font-black text-orange-600 text-center">
                 PAY ₦10,000 NOW AND PAY THE REST BY WEEK 6
             </div>

             <div className="text-center">
                <a 
                  href="#enroll-section" 
                  onClick={scrollToEnroll}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all inline-block text-center"
                >
                   Claim My Grand Slam Offer Now
                </a>
             </div>
          </div>
        </div>
      </section>

      {/* 10. TWO WAYS THIS PROGRAM PAYS FOR ITSELF */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#07020d] border-b border-white/5">
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

      {/* 11.5 SECURE CHECKOUT & PAYMENT SECTION (New Single-Page Funnel Integration) */}
      <section id="enroll-section" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-slate-900/30 border-t border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[250px] bg-orange-500/10 blur-[90px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               Secure Checkout
             </div>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-none uppercase">
               SECURE YOUR SPOT <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">FOR {month} 2026 NOW</span>
             </h2>
             <p className="text-orange-500 text-[11px] sm:text-sm font-black uppercase tracking-widest max-w-md mx-auto animate-pulse">
               ⚡️ FINAL SPOTS REMAINING - REGISTRATION CLOSING SOON
             </p>
          </div>

          {/* Simple 3-Step Process Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            {[
               { n: 1, t: "Pick Your Plan", d: `Choose how you want to pay to lock in your ${month} 2026 slot.` },
               { n: 2, t: "Fill Details", d: "Entry takes 60 seconds. We need your WhatsApp to add you to the group." },
               { n: 3, t: "Secure Spot", d: "Complete payment to guarantee your seat before they're gone!" },
               { 
                  n: 4, 
                  t: "Join the Cohort", 
                  d: "Secure your spot by joining the private cohort group or send your payment screenshot to this WhatsApp number! (08105281572)" 
                }
            ].map((step, i) => (
               <div 
                  key={i} 
                  onClick={() => {
                     const element = document.getElementById('checkout-panel');
                     if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }
                  }}
                  className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-orange-500/30 hover:bg-white/10 hover:scale-[1.02] cursor-pointer transition-all active:scale-[0.98] select-none"
               >
                  <div className="h-8 w-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-orange-500/10">{step.n}</div>
                  <div className="space-y-0.5">
                     <h4 className="text-xs font-black uppercase tracking-tight text-white">{step.t}</h4>
                     <p className="text-slate-400 text-[11px] font-medium leading-tight">{step.d}</p>
                  </div>
               </div>
            ))}
          </div>

          {/* Simplified Guarantee */}
          <div className="bg-[#110925] border-2 border-orange-500/50 p-6 sm:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 text-left relative max-w-3xl mx-auto shadow-2xl">
             <div className="shrink-0 h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                <ShieldCheck className="h-12 w-12 animate-pulse" />
             </div>
             <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-tight text-orange-400 italic">
                   100% Risk-Free Enrollment
                </h3>
                <div className="space-y-3 text-slate-300 text-xs sm:text-sm font-medium">
                  <div>
                    <span className="text-white font-extrabold block">🛡️ 14-Day Refund Guarantee</span>
                    <p className="text-slate-400 mt-1">Try the first two weeks. If you aren't absolutely blown away, simply message us for a 100% immediate refund.</p>
                  </div>
                  <div>
                    <span className="text-white font-extrabold block">🛡️ 1-on-1 Support Guarantee</span>
                    <p className="text-slate-400 mt-1">If you do the work and still don't feel confident, Coach Ayodeji will coach you 1-on-1 for free until you do, or refund your tuition in full.</p>
                  </div>
                </div>
             </div>
             <div className="absolute -top-3 -right-3 bg-orange-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg rotate-3">
                Zero Risk
             </div>
          </div>

          {/* Checkout Core Form Panel */}
          <div id="checkout-panel" className="bg-white text-slate-900 rounded-[2.5rem] border-t-8 border-orange-600 shadow-2xl overflow-hidden max-w-3xl mx-auto p-6 sm:p-8 text-left grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             {/* Left Column: Plan selection and benefits */}
             <div className="space-y-6">
                <div className="space-y-2">
                   <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">1. CHOOSE PAYMENT TERM:</h3>
                   <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                         type="button"
                         onClick={() => setIsInstallment(false)}
                         className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isInstallment ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                         Pay In Full
                      </button>
                      <button
                         type="button"
                         onClick={() => setIsInstallment(true)}
                         className={`flex-1 text-center py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${isInstallment ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                         Pay Small Small
                      </button>
                   </div>
                   {
                    isInstallment &&
                    <div className="text-xs font-black text-orange-600 text-center">
                      PAY ₦10,000 NOW AND PAY THE REST BY WEEK 6
                    </div>
                   }
                </div>

                <div className="space-y-1">
                   <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">2. SELECT COHORT PACKAGE:</h3>
                   <p className="text-slate-400 text-[10px] font-bold uppercase italic">Select which program track you are enrolling for:</p>
                </div>

                <div className="flex flex-col gap-3">
                   {/* Option 1 Button */}
                   <button 
                     type="button"
                     onClick={() => setSelectedTrack('full')}
                     className={`w-full p-4 rounded-2xl border-2 text-left relative overflow-hidden transition-all flex flex-col gap-1 ${selectedTrack === 'full' ? 'border-orange-500 bg-orange-500/5 shadow-md' : 'border-slate-200 bg-white hover:border-orange-500/40'}`}
                   >
                      <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">
                        Best Value
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Option 1</p>
                      <h4 className="text-base font-black tracking-tight text-slate-900 font-bold">Full Accelerator Program</h4>
                      <div className="flex items-baseline gap-1.5 mt-1">
                         <span className="text-2xl font-black text-orange-600 tracking-tighter">
                            {isInstallment ? installment1 : price1}
                         </span>
                         <span className="text-slate-400 line-through text-xs font-semibold">₦50,000</span>
                      </div>
                      <p className="text-slate-500 text-[10px] font-medium mt-1 leading-tight italic">
                         {isInstallment 
                           ? `(INSTALLMENT DEPOSIT. BALANCE OF ${priceremaining1} DUE BY WEEK 6. INCLUDES ALL 5 BONUSES)` 
                           : "(INCLUDES EXCEL + SQL + POWER BI + AI + MONETIZATION + ALL 5 BONUSES)"}
                      </p>
                   </button>

                   {/* Option 2 Button */}
                   <button 
                     type="button"
                     onClick={() => setSelectedTrack('excel_only')}
                     className={`w-full p-4 rounded-2xl border-2 text-left relative overflow-hidden transition-all flex flex-col gap-1 ${selectedTrack === 'excel_only' ? 'border-orange-500 bg-orange-500/5 shadow-md' : 'border-slate-200 bg-white hover:border-orange-500/40'}`}
                   >
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Option 2</p>
                      <h4 className="text-base font-black tracking-tight text-slate-900 font-bold">Excel + AI Track Only</h4>
                      <div className="flex items-baseline gap-1.5 mt-1">
                         <span className="text-2xl font-black text-orange-600 tracking-tighter">
                            {isInstallment ? installment2 : price2}
                         </span>
                         <span className="text-slate-400 line-through text-xs font-semibold">₦30,000</span>
                      </div>
                      <p className="text-slate-500 text-[10px] font-medium mt-1 leading-tight italic">
                         {isInstallment 
                           ? `(INSTALLMENT DEPOSIT. BALANCE OF ${priceremaining2} DUE BY WEEK 6. NO SQL / POWER BI / LINKEDIN SPRINT)` 
                           : "(INCLUDES DATASETS + EXCEL + AI MODULES ONLY. NO SQL / POWER BI / LINKEDIN SPRINT)"}
                      </p>
                   </button>
                </div>

                <div className="p-4 bg-orange-600/5 rounded-xl border border-orange-600/20 flex gap-2 items-center">
                   <Info className="h-5 w-5 text-orange-600 shrink-0" />
                   <p className="text-[10px] text-slate-500 font-medium leading-tight">
                     Cohort spots are locked in sequence. Your special Grand Slam rate is highly protected.
                   </p>
                </div>
             </div>

             {/* Right Column: Secure Details Input */}
             <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-5">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                    <Lock className="h-4.5 w-4.5 text-orange-600" /> Secure {month} Batch Entry
                  </h4>
                  <p className="text-slate-400 text-[10px] font-medium leading-tight">Your data is safe and encrypted.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="space-y-1">
                     <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-0.5">Full Name</label>
                     <input 
                       type="text" 
                       required
                       placeholder="e.g. Ebuka John"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans text-xs"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-0.5">Email Address</label>
                     <input 
                       type="email" 
                       required
                       placeholder="e.g. ebuka@gmail.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans text-xs"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-0.5">WhatsApp Number</label>
                     <input 
                       type="tel" 
                       required
                       placeholder="e.g. +234 816 000 0000"
                       value={whatsapp}
                       onChange={(e) => setWhatsapp(e.target.value)}
                       className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans text-xs"
                     />
                   </div>

                   <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center text-sm font-black uppercase tracking-tight text-slate-900">
                        <span>Amount Due Now:</span>
                        <span className="text-xl text-orange-600 font-serif font-black">
                          {isInstallment ? (selectedTrack === 'full' ? installment1:installment2) : selectedTrack === 'full' ? price1 : price2}
                        </span>
                      </div>
                   </div>

                   <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2">
                     SECURE MY SEAT NOW <ArrowRight className="h-4.5 w-4.5" />
                   </button>
                   
                   {/* Direct WhatsApp Help Button */}
                   <a 
                     href={`https://wa.me/2348149517851?text=Hello%20Coach%20Omidoyin,%20I%20have%20a%20question%20about%20the%20${month}%20cohort%20Data%20Analysis%20Accelerator...`}
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                   >
                     <span className="shrink-0 h-2 w-2 rounded-full bg-white animate-pulse" />
                     Have Questions? Chat on WhatsApp
                   </a>
                </form>

                {/* Direct Manual Bank Transfer Option */}
                <div className="pt-2 border-t border-slate-200">
                    <div className="bg-white p-4 rounded-2xl border-dashed border-2 border-slate-200 space-y-2.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600 font-black uppercase text-[8px] tracking-widest">
                        <Building2 className="h-4.5 w-4.5 animate-pulse text-orange-600" /> Fast Manual Transfer Option
                      </div>

                      <p className="text-[12px] font-medium  text-slate-500 ml-0.5">To bypass automated gateway delays and lock in your Fast-Action discount instantly, you can transfer directly to our head coach and founder’s verified personal account. Your onboarding will be manually approved within 15 minutes.</p>
                      <div className="space-y-1">
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
                           <span className="font-black text-slate-900 text-sm select-all underline decoration-orange-600 decoration-1">0212516916</span>
                        </div>
                      </div>
                      <div className="bg-[#25D366]/5 p-2 rounded-lg border border-[#25D366]/20 text-emerald-700 text-[8px] font-black uppercase tracking-tight text-center font-bold">
                        Send Receipt to WhatsApp: +234 810 528 1572
                      </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 12. STATIC INLINE FAQs (Busting lingering objections) */}
      <section className="py-4 sm:py-24 px-4 sm:px-6 border-t border-white/5 bg-[#020617]">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-2">
             <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight uppercase">
                FREQUENTLY ASKED QUESTIONS
             </h2>
             <p className="text-slate-500 text-xs uppercase tracking-widest font-black">
                Addressing every objection to make your decision simple:
             </p>
          </div>

          <div className="space-y-6">
             {[
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
                 a: "Yes. Coach Ayodeji is committed to student success. If you complete the lessons and assignments, apply the templates, and still don't feel confident, Coach Ayodeji will coach you 1-on-1. If you're still not satisfied, we refund every single Kobo, and you keep all the templates and files anyway." 
               },
               { 
                 q: "Do I get a certificate of completion?", 
                 a: "Yes. Upon completing your technical curriculum and submitting your capstone workspace project, you will be awarded a verified digital Certificate of Completion from Veleon Academy Technologies." 
               }
             ].map((faq, idx) => (
                <div key={idx} className="pb-6 border-b border-white/10 space-y-2 text-left">
                  <div className="flex gap-2 items-start">
                     <span className="text-orange-500 font-serif font-black text-lg shrink-0">Q.</span>
                     <h3 className="font-serif font-black text-base sm:text-lg text-white leading-tight">
                       {faq.q}
                     </h3>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Floating/Sticky Mobile CTA Footer (TSA inspired) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/90 backdrop-blur-md border-t border-white/10 px-4 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="space-y-0.5">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{month} Batch Enrollment</p>
           <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-orange-500">
                 {isInstallment ? (selectedTrack === 'full' ? installment1 : installment2) : selectedTrack === 'full' ? price1 : price2}
              </span>
              <span className="text-[9px] font-bold text-slate-400 line-through">
                 {selectedTrack === 'full' ? '₦50,000' : '₦30,000'}
              </span>
           </div>
        </div>
        <a 
          href="#enroll-section"
          onClick={scrollToEnroll}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(249,115,22,0.5)] active:scale-95 transition-transform flex items-center gap-1.5"
        >
          Enroll Now <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Footer minimal */}
      <footer className="py-12 sm:py-20 border-t border-white/5 text-center space-y-6 px-4 pb-24 md:pb-20">
        <img src="/veleonacademy_logo.jpg" alt="Logo" className="h-8 sm:h-10 mx-auto grayscale opacity-40 hover:opacity-100 transition-opacity" />
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
           <Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
           <Link to="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link>
           <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Contact Support</a>
        </div>
        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-700 font-bold">© {new Date().getFullYear()} Veleon Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default SalesLandingPage;
