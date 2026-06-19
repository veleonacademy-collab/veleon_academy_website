import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Input } from '../components/forms/Input';
import { CheckCircle2, XCircle, Clock, Calendar, ArrowRight, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { captureWebinarLead } from '../api/webinar';
import toast from 'react-hot-toast';

// --- Components ---

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3 sm:gap-4 justify-center items-center font-black">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds }
      ].map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="bg-slate-900 border border-slate-800 text-teal-400 w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl shadow-lg">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-1.5 font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const TestimonialCard = ({ name, role, content }: { name: string; role: string; content: string }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Star className="w-12 h-12 fill-teal-400 text-teal-400" />
    </div>
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
      ))}
    </div>
    <p className="text-slate-300 italic mb-5 text-sm leading-relaxed">"{content}"</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold uppercase text-xs ring-2 ring-teal-500/30">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="text-white font-bold text-xs tracking-tight">{name}</h4>
        <p className="text-teal-500/70 text-[9px] uppercase tracking-widest font-black">{role}</p>
      </div>
    </div>
  </div>
);

// --- Main Page ---

const BannerCountdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return <span>Happening Now!</span>;

  return (
    <span>
      {timeLeft.d > 0 && `${timeLeft.d}d : `}
      {String(timeLeft.h).padStart(2, '0')}h : {String(timeLeft.m).padStart(2, '0')}m : {String(timeLeft.s).padStart(2, '0')}s
    </span>
  );
};

const WebinarPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const webinarDate = "2026-06-04T16:00:00"; // Updated to match June 4th registration close
  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/DDZgPPNTfKE0yvlAD3WQOD"; 

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Capture lead in database
      await captureWebinarLead({
        ...formData,
        topic: "Data Analytics",
        cohort: "June 2026"
      });

      toast.success("Redirecting to WhatsApp group...");
      
      // Immediate redirect to WhatsApp
      setTimeout(() => {
        window.location.href = WHATSAPP_GROUP_LINK;
      }, 800);

    } catch (error) {
      console.error("Webinar registration failed:", error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-teal-500 selection:text-black font-sans pb-20">
      <SEO 
        title="How to Become a Job-Ready Data Analyst & Start Earning in 6 Weeks" 
        description="In this free live training, you’ll discover how beginners are breaking into tech, building real projects, and earning from companies—even without a tech background."
      />

      {/* Top Banner Countdown */}
      <div className="bg-teal-500 text-slate-950 py-2.5 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest">
          <span className="hidden sm:inline">⚠️ Limited spots remaining! Training starts in:</span>
          <span className="sm:hidden">Starts in: </span>
          <div className="flex gap-2 bg-slate-950 text-teal-400 px-3 py-1 rounded-full text-xs font-bold">
            <BannerCountdown targetDate={webinarDate} />
          </div>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 overflow-hidden text-center">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-teal-500/10 blur-[100px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-teal-400"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            Limited Free 2-Day Training Session
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight leading-[1.15]"
          >
            How to Become a <span className="text-teal-400 italic">Job-Ready</span> Data Analyst & Start Earning in <span className="text-teal-400 font-bold">6 Weeks</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-xl max-w-2xl mx-auto leading-relaxed font-semibold uppercase tracking-wide px-2"
          >
            In this free live training, you’ll discover how beginners are breaking into tech, building real projects—even with <span className="text-white font-bold underline decoration-teal-500 underline-offset-4">Zero Experience</span>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 sm:p-10 rounded-[2rem] shadow-2xl space-y-6 max-w-2xl mx-auto"
          >
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight">Save your seat for this free training 👇</h3>
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-1.5">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-1">Full Name</label>
                <Input 
                  required
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="!bg-black/50 !border-slate-800 h-12 rounded-xl text-white placeholder:text-slate-600 focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-1">Email Address</label>
                <Input 
                  required
                  type="email"
                  placeholder="name@email.com" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="!bg-black/50 !border-slate-800 h-12 rounded-xl text-white placeholder:text-slate-600 focus:border-teal-400 transition-colors"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-500 ml-1">Phone (WhatsApp)</label>
                <Input 
                  required
                  type="tel"
                  placeholder="+234..." 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="!bg-black/50 !border-slate-800 h-12 rounded-xl text-white placeholder:text-slate-600 focus:border-teal-400 transition-colors"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="sm:col-span-2 bg-teal-500 hover:bg-teal-400 text-slate-950 h-14 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-teal-500/10"
              >
                {isLoading ? 'Processing...' : 'Join WhatsApp Group'}
                {!isLoading && <ArrowRight className="h-4.5 w-4.5" />}
              </button>
            </form>
            
            <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">
              ⚠️ Access links will ONLY be shared in the WhatsApp group.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. PAIN SECTION */}
      <section className="py-16 px-4 bg-[#080808]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 order-2 md:order-1 text-left">
            <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight leading-tight">
              Are you tired of trying to figure out <span className="text-secondary italic">tech</span> on your own?
            </h2>
            <div className="space-y-3">
              {[
                "You’ve watched YouTube tutorials but still feel confused",
                "You don’t know which skill to focus on",
                "You’re tired of low income or no job opportunities",
                "You want to enter tech but don’t know where to start"
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="bg-secondary/10 p-1 rounded-lg shrink-0 mt-0.5">
                    <XCircle className="h-4 w-4 text-secondary" />
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 border-l-4 border-teal-400 p-4 rounded-r-2xl">
              <p className="text-white font-bold text-sm italic">"You’re not alone—and that’s exactly why this training exists."</p>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
            <div className="absolute inset-0 bg-teal-500/10 blur-[80px] rounded-full" />
            <img 
              src="/data_analytics_screenshot.jpg" 
              alt="Data Analytics Interface Mockup" 
              className="rounded-2xl border border-slate-800 shadow-2xl relative w-full aspect-video object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. WHAT THEY'LL LEARN */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center">
            <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight">
              In this free training, you’ll <span className="text-teal-400 underline underline-offset-4 decoration-teal-500/30">discover:</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            {[
              { 
                title: "Hands-on projects", 
                desc: "No boring theory. We'll dive straight into real-world datasets that you can add to your portfolio immediately.",
                icon: <Zap className="h-5 w-5" />
              },
              { 
                title: "Excel + Dashboard", 
                desc: "Master the fundamental tools used by experts. Create stunning visualizations from scratch using advanced Excel techniques.",
                icon: <ArrowRight className="h-5 w-5" />
              },
              { 
                title: "Personal Branding", 
                desc: "Learn how to position yourself as an authority and land high-paying freelancing gigs globally.",
                icon: <Star className="h-5 w-5" />
              }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-teal-500/50 transition-colors group">
                <div className="h-9 w-9 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 mb-4 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-base sm:text-lg font-serif font-black mb-2">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-xs font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BONUS SECTION */}
      <section className="py-16 px-4 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">🎉 When you attend, you’ll also get:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
            {[
              "Access to a private WhatsApp community",
              "Free resources to help you get started",
              "Opportunity to join a mentorship program",
              "Live Q&A session with the expert"
            ].map((bonus, i) => (
              <div key={i} className="flex items-center gap-3 bg-black/40 border border-slate-800 p-4 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm tracking-tight">{bonus}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 & 6. WHO THIS IS FOR / NOT FOR */}
      <section className="py-16 px-4 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[150px] -z-10" />
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Who this is for */}
          <div className="space-y-6 bg-teal-500/5 border border-teal-500/10 p-8 rounded-3xl">
            <h2 className="text-2xl font-serif font-black tracking-tight">This training is <span className="text-teal-400 italic underline decoration-teal-400/30 underline-offset-4">for you</span> if:</h2>
            <div className="space-y-3">
              {[
                "You just graduated and don’t have a job yet",
                "You’re earning little and want a high-paying skill",
                "You want to break into tech but feel lost",
                "You’re ready to actually take action and learn"
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                  <p className="font-bold text-slate-200 text-xs sm:text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who this is NOT for */}
          <div className="space-y-6 bg-black/40 border border-slate-800 p-8 rounded-3xl">
            <h2 className="text-2xl font-serif font-black tracking-tight">This is <span className="text-secondary italic underline decoration-secondary/30 underline-offset-4">NOT for you</span> if:</h2>
            <div className="space-y-3">
              {[
                "You’re not ready to learn or put in the work",
                "You’re looking for 'Get Rich Quick' schemes",
                "You’re not serious about changing your career",
                "You expect money without any effort"
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <XCircle className="h-5 w-5 text-secondary/50 shrink-0 mt-0.5" />
                  <p className="font-bold text-slate-500/70 text-xs sm:text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. WEBINAR DETAILS */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto bg-slate-900/80 border border-teal-500/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">Training <span className="text-teal-400 italic">Schedule</span></h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 shrink-0">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Day 1</p>
                    <p className="text-sm font-bold">June 4, 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 shrink-0">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Day 2</p>
                    <p className="text-sm font-bold">June 5, 7:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400 shrink-0">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Platform</p>
                    <p className="text-sm font-bold text-teal-400">WhatsApp Access</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/50 p-6 rounded-2xl border border-slate-800/50 space-y-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-teal-500 font-black text-center">Starts In</p>
              <CountdownTimer targetDate={webinarDate} />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 relative">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
             <h2 className="text-[9px] uppercase tracking-[0.25em] text-teal-500 font-black">Success Stories</h2>
             <p className="text-2xl sm:text-3xl font-serif font-black tracking-tight italic">Students are <span className="text-teal-400">winning</span> with this roadmap</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <TestimonialCard 
              name="Tunde A."
              role="Junior Data Analyst"
              content="I was lost for 6 months after graduation. This roadmap simplified everything."
            />
            <TestimonialCard 
              name="Sarah O."
              role="Freelance Analyst"
              content="The positioning strategy is gold. I started helping local businesses with their sales data and they're paying me more than my previous 9-5."
            />
            <TestimonialCard 
              name="David K."
              role="Tech Newcomer"
              content="Zero tech background. But the live training showed me exactly what was wrong with my approach."
            />
          </div>
        </div>
      </section>

      {/* 8. URGENCY SECTION */}
      <section className="py-6 px-4">
        <div className="max-w-lg mx-auto bg-secondary/10 border border-secondary/20 p-6 rounded-2xl text-center space-y-2">
          <h2 className="text-lg font-black text-secondary uppercase tracking-widest flex items-center justify-center gap-2">
            <Clock className="h-5 w-5" />
            Limited Slots Available
          </h2>
          <p className="text-slate-300 text-xs font-semibold">
            We cap our Cohort groups to ensure direct support. Reserve your slot now.
          </p>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-16 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight">Don’t miss this opportunity</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Your future self will thank you for taking this 60-second action.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-2xl space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  required
                  placeholder="Your Full Name" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="!bg-black/40 !border-slate-800 h-12 rounded-xl text-white"
                />
                <Input 
                  required
                  type="email"
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="!bg-black/40 !border-slate-800 h-12 rounded-xl text-white"
                />
              </div>
              <Input 
                  required
                  type="tel"
                  placeholder="Phone Number (WhatsApp)" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="!bg-black/40 !border-slate-800 h-12 rounded-xl text-white"
                />
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 h-14 rounded-xl font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-teal-500/20 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Reserve My Spot & Join WhatsApp
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </form>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center italic">
              ⚠️ You must join the WhatsApp group to receive access to the training.
            </p>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 border-t border-slate-900 text-center space-y-4">
        <img src="/veleonacademy_logo.jpg" alt="Logo" className="h-8 mx-auto grayscale opacity-40" />
        <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">© {new Date().getFullYear()} Veleon Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default WebinarPage;
