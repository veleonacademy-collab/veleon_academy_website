import React, { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { WHATSAPP_NUMBER } from '../utils/constants';
import { http } from '../api/http';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const SalesLandingPage: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<'full' | 'excel_only'>('full');
  const [isInstallment, setIsInstallment] = useState<boolean>(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 9, hours: 0, minutes: 0, seconds: 0 });

  // Initialize and track Facebook Pixel ONLY for the Sales Landing Page
  useEffect(() => {
    if (typeof window !== 'undefined') {
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

      // Track PageView specifically on landing page mount
      window.fbq('track', 'PageView');
    }
  }, []);

  useEffect(() => {
    const target = new Date("2026-06-06T23:59:59").getTime();
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

  const scrollToEnroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.getElementById('enroll-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

      {/* Top Banner Urgency & Scarcity */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-50 flex flex-wrap justify-center items-center gap-2">
        <span>⚠️ June Batch Enrollment Capped to 30 Spots: 23 Secured — Only 7 Seats Left!</span>
        <span className="hidden sm:inline">•</span>
        <span className="bg-black/20 px-2 py-0.5 rounded animate-pulse">
          Closes in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s ⏳
        </span>
      </div>

      {/* 1. HERO SECTION (Dream Outcome & Value Equation) */}
      <section className="relative pt-12 sm:pt-24 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Background glow highlights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[300px] sm:h-[600px] bg-orange-500/10 blur-[100px] sm:blur-[150px] rounded-full -z-10" />
        <div className="absolute top-[20%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4 sm:mb-8"
          >
            <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl border border-white/10">
              <img src="/veleonacademy_logo.png" alt="Veleon Academy Logo" className="h-10 sm:h-14 px-4 py-2" />
            </div>
          </motion.div>

          <div className="space-y-2">
            {/* <span className="text-orange-500 text-xs sm:text-sm font-black uppercase tracking-[0.35em] block">
              M-A-G-I-C PROGRAM ACCELERATOR
            </span> */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight leading-[1.15] text-white"
              id="hero-heading"
            >
              Master Data Analysis: Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 italic">Job-Ready</span> Pro In 6 Weeks
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-2xl max-w-3xl mx-auto leading-relaxed font-medium px-2"
          >
            Get the technical power of <span className="text-white font-extrabold relative inline-block mx-1">
              <span className="relative z-10 font-bold italic">Excel + SQL + Power BI + AI</span>
              <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-500/30 -z-10 rounded-full" />
            </span> + the Saturday monetization roadmap to turn your skills into freelance client retainers. No tech background required.
          </motion.p>

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

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center pt-2 sm:pt-6"
          >
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              id="cta-hero-enroll"
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white px-8 sm:px-16 py-5 sm:py-7 rounded-2xl font-black text-lg sm:text-xl uppercase tracking-widest shadow-[0_20px_50px_-10px_rgba(249,115,22,0.4)] active:scale-95 flex items-center justify-center gap-3"
            >
              Claim My Grand Slam Offer Now <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            </a>
            <p className="mt-4 text-slate-500 text-xs font-bold uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-orange-500" /> Only 7 of 30 Seats Remaining for June Batch!
            </p>
          </motion.div>

          {/* Social Proof Intro Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 sm:mt-16 bg-white text-slate-900 p-6 sm:p-10 rounded-[2rem] shadow-2xl text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Users className="h-16 w-16 sm:h-24 sm:w-24 text-orange-500" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 relative z-10">
              <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-lg bg-slate-100">
                 <img src="/ayodeji_trainer.png" alt="Coach Omidoyin Ayodeji" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/300?u=ayodeji" }} />
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
          </motion.div>
        </div>
      </section>

      {/* 2. WELCOME SECTION (Identifying the Avatar) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/40 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
            A System Tailored for Career Pivots
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-tight uppercase">
            WHO IS THIS COHORT DESIGNED FOR?<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 italic">VELEON ELITE ACCELERATOR</span>
          </h2>
          
          <div className="space-y-5 sm:space-y-6 text-slate-300 text-sm sm:text-lg font-medium max-w-2xl mx-auto text-center px-2">
            <p className="leading-relaxed">
              If you are a <span className="text-white font-bold">Graduate, Job Seeker, Young Professional, or Tech Transitioner</span> looking to bypass the low-income trap, this is designed explicitly for you.
            </p>
            <p className="leading-relaxed">
              We cut out all the academic bloat and focus 100% on **practical skills and direct monetization**. You get the corporate technical skills of a professional analyst plus the exact business playbook to package and sell your expertise.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 sm:mt-10 px-4">
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

      {/* 3. REALITY CHECK SECTION (Busting Sacrifices & Effort) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-secondary/5 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 sm:space-y-6">
             <div className="bg-secondary/10 border-l-4 border-secondary p-5 sm:p-6 rounded-r-2xl space-y-3">
                <h3 className="text-secondary text-sm font-black uppercase tracking-widest">THE BRUTAL TRUTH...</h3>
                <div className="space-y-2 sm:space-y-3">
                  {[
                    "99% of free YouTube tutorials teach you syntax, not business solutions",
                    "Certificates without real portfolio projects get thrown in the recruiter trash",
                    "Pitching yourself as a generic 'Data Analyst' leads to price wars",
                    "Spending years in 'tutorial purgatory' without building active revenue streams"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="h-4 w-4 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      </div>
                      <p className="text-sm font-bold text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="bg-secondary p-4 rounded-xl shadow-lg">
                <p className="text-white font-black text-xs sm:text-sm uppercase tracking-wider text-center">
                   HOW WE BYPASS THE STUDY BLOAT & TIME DELAY
                </p>
             </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl space-y-4 sm:space-y-6">
            <h3 className="text-slate-900 text-xl sm:text-2xl font-serif font-black tracking-tight uppercase leading-tight">The only effective and easy learning route you need</h3>
            <div className="bg-approve/10 border-l-4 border-approve p-3 rounded-r-lg">
               <p className="text-approve text-[9px] font-black uppercase tracking-widest">
                  MINIMIZING YOUR EFFORT & MAXIMIZING DREAM OUTCOME:
               </p>
            </div>
            <div className="space-y-3">
              {[
                { title: "Directly solve messy business problems using pre-built models", icon: <Target className="h-4.5 w-4.5 text-orange-500" /> },
                { title: "Master only the exact SQL, Excel, and Power BI commands that secure jobs", icon: <Cpu className="h-4.5 w-4.5 text-orange-500" /> },
                { title: "Apply pre-built proposals to lock in ₦50k–₦250k dashboard projects", icon: <ShieldCheck className="h-4.5 w-4.5 text-orange-500" /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="shrink-0">{item.icon}</div>
                  <p className="text-slate-700 text-xs sm:text-sm font-bold">{item.title}</p>
                </div>
              ))}
            </div>
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"
            >
              Enroll Risk-Free Now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. REVIEW SECTION (Perceived Likelihood of Achievement) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-orange-500/5">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-1">
             <h4 className="text-orange-500 font-black uppercase tracking-[0.25em] text-[9px] sm:text-xs">Real Proof: High Likelihood of Success</h4>
             <h2 className="text-xl sm:text-4xl font-serif font-black tracking-tight leading-tight uppercase px-1">"THE ACADEMY REMOVED MY STUCK-FEELINGS & GAVE ME PRACTICAL PORTFOLIO POWER"</h2>
          </div>

          <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-[2rem] shadow-xl relative">
            <div className="absolute -top-3 -left-3 bg-orange-500 p-3 rounded-xl text-white shadow-lg">
               <Star className="h-5 w-5 fill-current" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
              <div className="shrink-0 w-24 h-24 sm:w-36 sm:h-36 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <img src="/cornelius.jpeg" alt="Data Analyst Trainee - CS" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-lg font-serif font-black text-orange-600 uppercase">Cornelius</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data Analyst Trainee, Batch 2</p>
                </div>
                <div className="relative">
                  <span className="absolute -top-4 -left-4 text-5xl text-slate-100 font-serif leading-none -z-10">"</span>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed italic relative z-10">
                    "My experience at Veleon Academy as a data analyst trainee has been very impactful. I’ve gained practical skills in data analysis, especially in Excel, data cleaning, and visualization. The training is well-structured and easy to understand, with hands-on projects that helped me apply what I learned. The instructors are supportive and always ready to help. Overall, the academy has boosted my confidence and given me a strong foundation in data analysis. I highly recommend it to anyone starting a career in this field. 100% ✅"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/reviews" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mx-auto">
            To See More Real Student Proof (Click Here) <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </section>

      {/* 5. OUTCOMES SECTION (Minimizing Effort & Time Delay) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 overflow-hidden relative">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
             <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest block mb-2">MAXIMUM VALUE • MINIMUM FRICTION</span>
             <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight uppercase leading-tight">BY THE END OF THIS ACCELERATOR, YOU WILL BE ABLE TO:</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative aspect-video sm:aspect-square md:aspect-auto rounded-[2rem] overflow-hidden group shadow-xl">
               <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" alt="Job Ready Professional" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-orange-500/90 backdrop-blur-md p-4 rounded-xl">
                    <p className="text-white font-black text-sm uppercase tracking-wider text-center">BECOME THE HIGH-STATUS TECH ASSET BUSINESSES PAY RETAINERS FOR</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              {[
                "Clean messy databases in Excel using expert techniques, cutting manual effort by 90%",
                "Query live SQL servers confidently using joins and CTEs without getting code errors",
                "Construct executive dashboard portals in Power BI from raw data within hours",
                "Deploy advanced AI prompts to summarize analytical findings instantly for management",
                "Confidently pitch SME business owners and bill ₦50,000–₦250,000 per dashboard setup"
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  key={i} 
                  className="flex gap-3 items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/50 transition-colors group"
                >
                  <div className="h-7 w-7 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-sm font-bold text-slate-100">{item}</p>
                </motion.div>
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

      <section className="px-4 sm:px-6">
         <div className="md:w-1/2 relative bg-slate-100 h-full">
              <img src="/Testimonial_segun.jpeg" alt="Lead Trainer Omidoyin Ayodeji" className=" inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/300?u=ayodeji" }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Segun</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
              </div>
           </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
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

      {/* 6. COURSE OVERVIEW & MODULES (Framed as Objection Busters) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               6-Week System Milestones
             </div>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-none">
               THE SYSTEM <span className="text-orange-500 italic">MILESTONES</span>
             </h2>
             <p className="text-slate-400 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
               Each track is specifically engineered to overcome a standard career-limiting obstacle:
             </p>
          </div>

          {/* Timeline Stack (TSA Inspired) */}
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
            ].map((mod, i) => (
              <div 
                key={i} 
                className="bg-[#0b0f19] border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 items-start relative hover:border-orange-500/40 transition-all group"
              >
                <div className="bg-orange-500 text-white font-black text-xs tracking-widest px-3 py-1 rounded-full shrink-0">
                  {mod.step}
                </div>
                <div className="space-y-2">
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
             {/* <Link to="/curriculum" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white/10 flex items-center justify-center gap-2">
               Download Details <FileText className="h-4 w-4 text-orange-500" />
             </Link> */}
          </div>
        </div>
      </section>

      {/* 6.5 ALEX HORMOZI $100M GRAND SLAM OFFER STACK (Value Stack & Objection Busters) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0a0514] border-t border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.25em] border border-orange-500/20">
               Your No-Brainer Value Stack
             </div>
             <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight leading-none uppercase">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">THE GRAND SLAM OFFER STACK</span>
             </h2>
             <p className="text-slate-400 text-sm sm:text-base font-semibold max-w-xl mx-auto leading-relaxed">
               Here is the exact value stack you receive today. We address and eliminate every single obstacle in your way:
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
                      <span className="text-3xl font-serif font-black text-orange-500 tracking-tighter">₦25,000</span>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">(Full Stack. Installments Available)</p>
                   </div>
                </div>
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

      {/* 7. SCHEDULE SECTION (Reducing Effort & Time Delay) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
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
                 <p className="text-slate-400 text-xs font-medium">23/30 spots secured. Only 7 spots remaining for the June 6th class.</p>
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

      {/* 8. WHO IT IS FOR SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
             <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight uppercase leading-tight">WHO IS THIS <span className="text-orange-500 italic">TRAINING</span> FOR?</h2>
             <p className="text-slate-400 text-xs sm:text-sm font-semibold">Designed primarily to help the following people bypass struggle:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
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
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl group hover:border-orange-500/50 transition-all flex flex-col gap-3 text-left">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-serif font-black tracking-tight uppercase">{item.cat}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="bg-approve/10 border border-approve/30 p-5 rounded-2xl text-center w-full">
               <p className="text-approve text-sm sm:text-base font-black italic uppercase tracking-tight">
                  If you fit any of these avatars, this accelerator was custom-built for your success.
               </p>
            </div>
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Reserve My Seat Now <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 9. LEAD TRAINER SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
           <div className="md:w-1/2 relative bg-slate-100 min-h-[250px] sm:min-h-[400px]">
              <img src="/ayodeji_trainer.png" alt="Lead Trainer Omidoyin Ayodeji" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/300?u=ayodeji" }} />
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
                 Enroll in the June Batch
              </a>
           </div>
        </div>
      </section>

      {/* 10. REVIEWS CALLOUT */}
      <section className="py-16 sm:py-24 px-4 bg-orange-500/5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
           {/* <div className="shrink-0 w-48 h-48 bg-slate-900 rounded-[2rem] overflow-hidden shadow-lg relative rotate-2">
              <img src="https://i.pravatar.cc/400?u=student3" alt="Success Student Portrait" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-8 border-white/10" />
           </div> */}
           
           <div className="space-y-4 flex-1">
             <h3 className="text-xl sm:text-2xl font-serif font-black leading-tight uppercase">"THE METHODOLOGY IS EXTREMELY LOGICAL, PRACTICAL, AND EASY TO ABSORB"</h3>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Feedback from a Batch 3 Graduate</p>
             <div className="flex flex-col sm:flex-row gap-3 items-center">
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
           </div>
        </div>
      </section>

      {/* 11. QUALITY PROOF */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0a0514]">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight uppercase leading-[1.1] px-1">
            WHY ACCELERATOR <span className="text-orange-500 italic">GRADUATES</span> SUCCEED?
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg font-black italic uppercase tracking-wider underline decoration-orange-500/30 underline-offset-4">"THEY PROVE IT."</p>

          <div className="space-y-4 text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto px-1">
            <p>Anyone can buy a low-grade certificate. But companies pay for tested results.</p>
            <p className="text-white font-black text-lg sm:text-xl uppercase tracking-tight font-serif">THAT IS THE VELEON STANDARD.</p>
            <p>Before graduating, every student builds an individual capstone project from scratch. No shortcuts. No copy-paste code.</p>
            <p>You apply SQL querying, Excel cleanup, and Power BI dashboards to a real-world messy dataset, proving your skills to yourself and potential clients.</p>
          </div>
          
          <div className="pt-6">
            <a 
              href="#enroll-section" 
              onClick={scrollToEnroll}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-5 rounded-xl font-black text-sm sm:text-base uppercase tracking-[0.15em] shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto"
            >
              ENROLL NOW <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

       <section className="px-4 sm:px-6">
         <div className="md:w-1/2 relative bg-slate-100 h-full">
              <img src="/Testimonial_Barry.jpeg" alt="Lead Trainer Omidoyin Ayodeji" className=" inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/300?u=ayodeji" }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Barry</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
              </div>
           </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
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
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 italic">FOR JUNE 2026 NOW</span>
             </h2>
             <p className="text-orange-500 text-[11px] sm:text-sm font-black uppercase tracking-widest max-w-md mx-auto animate-pulse">
               ⚡️ FINAL SPOTS REMAINING - REGISTRATION CLOSING SOON
             </p>
          </div>

          {/* Simple 3-Step Process Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            {[
               { n: 1, t: "Pick Your Plan", d: "Choose how you want to pay to lock in your June 2026 slot." },
               { n: 2, t: "Fill Details", d: "Entry takes 60 seconds. We need your WhatsApp to add you to the group." },
               { n: 3, t: "Secure Spot", d: "Complete payment to guarantee your seat before they're gone!" }
            ].map((step, i) => (
               <div key={i} className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 flex items-start gap-4 hover:border-orange-500/30 transition-all">
                  <div className="h-8 w-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-orange-500/10">{step.n}</div>
                  <div className="space-y-0.5">
                     <h4 className="text-xs font-black uppercase tracking-tight text-white">{step.t}</h4>
                     <p className="text-slate-400 text-[11px] font-medium leading-tight">{step.d}</p>
                  </div>
               </div>
            ))}
          </div>

          {/* The Unbeatable Hormozi-Style "Double Guarantee" (Ultimate Risk Reversal) */}
          <div className="bg-[#110925] border-2 border-orange-500/50 p-6 sm:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 text-left relative max-w-3xl mx-auto shadow-2xl">
             <div className="shrink-0 h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                <ShieldCheck className="h-12 w-12 animate-pulse" />
             </div>
             <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-tight text-orange-400 italic">
                   THE UNBEATABLE "DO-THE-WORK" DOUBLE GUARANTEE
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  We are so confident in our 6-week curriculum and monetization blueprint that we absorb 100% of the risk:
                  <span className="block mt-2 text-white font-extrabold">
                     🛡️ Guarantee #1: The 14-Day Performance Check
                  </span>
                  Try the first two weeks. If you aren't absolutely blown away by the depth of the Excel modules, simply message us for a 100% immediate refund. No hassle, no hard feelings.
                  <span className="block mt-2 text-white font-extrabold">
                     🛡️ Guarantee #2: The Ayodeji 1-on-1 Action Guarantee
                  </span>
                  If you attend the live sessions, submit your weekly tasks, build your capstone portfolio, and pitch at least 5 businesses or job roles—and you still don’t feel 100% confident querying SQL databases, building premium Power BI dashboards, or pitching digital clients... Coach Ayodeji will work with you 1-on-1 for free until you do. If you still want your money back, we will refund every single Kobo of your tuition **AND** let you keep all ATS templates, visibility scripts, and datasets for free just to compensate you for your time.
                </p>
             </div>
             <div className="absolute -top-3 -right-3 bg-orange-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg rotate-3">
                Zero Risk
             </div>
          </div>

          {/* Checkout Core Form Panel */}
          <div className="bg-white text-slate-900 rounded-[2.5rem] border-t-8 border-orange-600 shadow-2xl overflow-hidden max-w-3xl mx-auto p-6 sm:p-8 text-left grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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
                            {isInstallment ? '₦10,000' : '₦25,000'}
                         </span>
                         <span className="text-slate-400 line-through text-xs font-semibold">₦50,000</span>
                      </div>
                      <p className="text-slate-500 text-[9px] font-medium mt-1 leading-tight italic">
                         {isInstallment 
                           ? "(INSTALLMENT DEPOSIT. BALANCE OF ₦15,000 DUE BY WEEK 3. INCLUDES ALL 5 BONUSES)" 
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
                            {isInstallment ? '₦10,000' : '₦15,000'}
                         </span>
                         <span className="text-slate-400 line-through text-xs font-semibold">₦30,000</span>
                      </div>
                      <p className="text-slate-500 text-[9px] font-medium mt-1 leading-tight italic">
                         {isInstallment 
                           ? "(INSTALLMENT DEPOSIT. BALANCE OF ₦5,000 DUE BY WEEK 3. NO SQL / POWER BI / LINKEDIN SPRINT)" 
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
                    <Lock className="h-4.5 w-4.5 text-orange-600" /> Secure June Batch Entry
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
                          {isInstallment ? '₦10,000' : selectedTrack === 'full' ? '₦25,000' : '₦15,000'}
                        </span>
                      </div>
                   </div>

                   <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2">
                     SECURE MY SEAT NOW <ArrowRight className="h-4.5 w-4.5" />
                   </button>
                   
                   {/* Direct WhatsApp Help Button */}
                   <a 
                     href={`https://wa.me/2348149517851?text=Hello%20Coach%20Omidoyin,%20I%20have%20a%20question%20about%20the%20June%20cohort%20Data%20Analysis%20Accelerator...`}
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5 bg-[#020617]">
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
                 a: "Yes. Coach Ayodeji is committed to student success. If you complete the lessons and assignments, apply the templates, and still don't feel ready or haven't closed client interest, Coach Ayodeji will coach you 1-on-1. If you're still not satisfied, we refund every single Kobo, and you keep all the templates and files anyway." 
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
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">June Batch Enrollment</p>
           <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-orange-500">
                 {isInstallment ? '₦10,000' : selectedTrack === 'full' ? '₦25,000' : '₦15,000'}
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
        <img src="/veleonacademy_logo.png" alt="Logo" className="h-8 sm:h-10 mx-auto grayscale opacity-40 hover:opacity-100 transition-opacity" />
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
