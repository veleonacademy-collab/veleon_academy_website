import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Play, 
  MessageCircle, 
  ArrowLeft,
  Quote,
  TrendingUp,
  Award,
  Users,
  BadgeCheck,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      <SEO 
        title="Student Success Stories | Veleon Academy" 
        description="See real results from real people. Over 5,000+ students have transformed their careers with Veleon Academy."
      />

      {/* Top Banner Urgency */}
      <div className="bg-orange-600 text-white py-2.5 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-20">
        Registration for June 2026 Batch is Closing Soon! ⏳
      </div>

      {/* Header */}
      <header className="py-6 px-4 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/landing-page" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden sm:inline">Back to School</span>
          </Link>
          <img src="/veleonacademy_logo.png" alt="Veleon Academy" className="h-8 sm:h-10" />
          <Link to="/checkout" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 active:scale-95">
            ENROLL NOW <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-12 px-4 overflow-hidden border-b border-white/5">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />
         
         <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
               <Users className="h-3 w-3" /> Join 5,000+ Successful Alumni
            </div>
            <h1 className="text-4xl sm:text-8xl font-black tracking-tight uppercase leading-[0.9] text-white">
               REAL <span className="text-orange-500 italic">RESULTS</span> <br/>
               FROM REAL <span className="text-orange-500 italic">PEOPLE.</span>
            </h1>
            <p className="text-slate-400 text-lg sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
               Don't just take our word for it. See exactly how our students are landing 6-figure jobs and changing their lives across the globe.
            </p>
         </div>
      </section>

      {/* 2. PERSUASIVE NARRATIVE ONE */}
      <section className="py-12 px-4 bg-slate-900/20">
         <div className="max-w-3xl mx-auto text-center space-y-6">
            <Quote className="h-10 w-10 text-orange-500/20 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight italic text-slate-200 leading-tight">
               "This page isn't just about testimonials. It's proof that no matter your background—Accountant, Student, or Unemployed—our system works if YOU do."
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Scroll down to see what's possible for you.</p>
         </div>
      </section>

      {/* 3. ELITE VIDEO STORIES SECTION */}
      <section className="py-20 px-4 bg-slate-950">
         <div className="max-w-6xl mx-auto space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-4">
                  <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white">ELITE <span className="text-orange-500 italic">ALUMNI</span> STORIES</h3>
                  <p className="text-slate-500 text-lg font-bold">Watch how these students went from zero to Tech Pros.</p>
               </div>
               <div className="flex gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                     <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                     <span className="font-black text-xl">4.9/5 <span className="text-slate-600 text-sm font-bold tracking-widest uppercase ml-1">Rating</span></span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Video Card 1 */}
               <div className="group relative bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all shadow-2xl">
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                     <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop" alt="Student Success" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                     <button className="absolute inset-0 flex items-center justify-center group/btn">
                        <div className="h-20 w-20 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-600/40 group-hover/btn:scale-110 transition-all">
                           <Play className="h-8 w-8 fill-white ml-1" />
                        </div>
                     </button>
                     <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest">
                           Career Transformation
                        </div>
                        <div className="bg-orange-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                           Live Case Study
                        </div>
                     </div>
                  </div>
                  <div className="p-8 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center font-black text-black">FU</div>
                        <div>
                           <h4 className="font-black uppercase tracking-tight text-yellow-500">Francis Umoren</h4>
                           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Senior Data Analyst</p>
                        </div>
                     </div>
                     <p className="text-slate-200 text-lg font-medium leading-relaxed italic">
                        "I was skeptical at first, but Veleon Academy's curriculum is Top-Tier. I landed a high-paying role in a UK firm just 2 months after finishing. The support is unmatched!"
                     </p>
                  </div>
               </div>

               {/* Video Card 2 */}
               <div className="group relative bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all shadow-2xl">
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                     <img src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=1000&auto=format&fit=crop" alt="Student Success" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" />
                     <button className="absolute inset-0 flex items-center justify-center group/btn">
                        <div className="h-20 w-20 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-600/40 group-hover/btn:scale-110 transition-all">
                           <Play className="h-8 w-8 fill-white ml-1" />
                        </div>
                     </button>
                  </div>
                  <div className="p-8 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center font-black text-black">EA</div>
                        <div>
                           <h4 className="font-black uppercase tracking-tight text-yellow-500">Emeka Adebayo</h4>
                           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Full-Stack Architect</p>
                        </div>
                     </div>
                     <p className="text-slate-200 text-lg font-medium leading-relaxed italic">
                        "Veleon Academy didn't just teach me code; they taught me how to THINK like a developer. I'm currently working remotely for a US startup earning in dollars!"
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* REPEATING CTA BAR */}
      <section className="bg-orange-600 py-6 px-4">
         <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <h4 className="text-white text-xl sm:text-2xl font-black uppercase tracking-tight text-center sm:text-left">
               DO YOU WANT TO BE THE NEXT SUCCESS STORY?
            </h4>
            <Link to="/checkout" className="w-full sm:w-auto bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
               ENROLL NOW FOR JUNE BATCH <ArrowRight className="h-5 w-5" />
            </Link>
         </div>
      </section>

      {/* 4. HIGH-STATUS AUTHORITY REVIEWS (Leverages Authority Bias) */}
      <section className="py-24 px-4 relative">
         <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <h3 className="text-3xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">THE <span className="text-orange-500 italic">"AUTHORITY"</span> PROOF</h3>
               <p className="text-slate-500 text-lg font-bold">Professionals, Directors, and PhDs prefer Veleon Academy.</p>
            </div>

            <div className="grid grid-cols-1 gap-12">
               {[
                  { name: "Dr. Adeoti Johnson", role: "Director of Accounts (Lagos State)", quote: "I needed to understand Data Analytics to run my department more effectively. Veleon Academy made it so simple that even at my level, I could follow along and implement immediately.", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" },
                  { name: "Blessing Okunola", role: "PhD Scholar | Tech Researcher", quote: "The curriculum here is more practical than anything I've seen in academia. They focus on what the industry actually needs. Worth every kobo of the enrollment fee.", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" }
               ].map((auth, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-white/5 p-10 rounded-[3rem] border border-white/10 relative group hover:border-orange-500/30 transition-all">
                     <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-2 border-orange-500 shrink-0 shadow-2xl">
                        <img src={auth.photo} alt={auth.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-6 text-center md:text-left">
                        <Quote className="h-8 w-8 text-orange-500 opacity-40 mx-auto md:mx-0" />
                        <p className="text-xl sm:text-2xl font-bold italic text-slate-100 leading-relaxed">"{auth.quote}"</p>
                        <div>
                           <h4 className="text-2xl font-black uppercase text-yellow-500 tracking-tight">{auth.name}</h4>
                           <p className="text-slate-500 font-black uppercase tracking-widest text-xs mt-1">{auth.role}</p>
                        </div>
                     </div>
                     <div className="absolute top-8 right-8 text-orange-500/10">
                        <BadgeCheck className="h-24 w-24" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 5. WHATSAPP PROOF GRID (RAW & AUTHENTIC) */}
      <section className="py-20 px-4 bg-orange-600/5">
         <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-approve/10 text-approve text-[10px] font-black uppercase tracking-widest border border-approve/20">
                  <TrendingUp className="h-3 w-3" /> Raw Proof from Students
               </div>
               <h3 className="text-3xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">THE <span className="text-orange-500 italic">"WINNING"</span> CHATS</h3>
               <p className="text-slate-500 text-lg font-bold">These are real messages from our student community every day.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-[#075e54]/10 border border-[#128c7e]/30 rounded-3xl overflow-hidden group hover:border-orange-500/50 transition-all shadow-xl">
                     <div className="bg-[#075e54] p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/20" />
                        <div>
                           <p className="text-white text-xs font-black">Student #{idx} - Veleon Batch 8</p>
                           <p className="text-[#25d366] text-[8px] font-black uppercase tracking-widest">Online</p>
                        </div>
                     </div>
                     <div className="p-6 space-y-4 bg-slate-900/40">
                        <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-white/5 space-y-2 max-w-[90%]">
                           <p className="text-white text-sm font-bold leading-relaxed">
                              "Guys! I just received my offer letter for a remote Developer role. N500k monthly start! Thank you Veleon Academy for the mentorship. Batch 8 rocks! 🥳🚀"
                           </p>
                           <p className="text-[9px] text-slate-500 text-right">11:24 PM ✓✓</p>
                        </div>
                        <div className="bg-[#075e54]/20 p-4 rounded-2xl rounded-tr-none border border-approve/10 space-y-2 max-w-[90%] ml-auto">
                           <p className="text-approve text-xs font-black uppercase italic">
                              CONGRATS TECH BRO! KEEP WINNING! 🎉
                           </p>
                           <p className="text-[9px] text-slate-500 text-right">11:25 PM ✓✓</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. PERSUASIVE NARRATIVE CLOSE */}
      <section className="py-24 px-4 border-t border-white/5">
         <div className="max-w-4xl mx-auto text-center space-y-10">
            <Zap className="h-12 w-12 text-orange-500 mx-auto animate-bounce" />
            <h2 className="text-4xl sm:text-7xl font-black uppercase tracking-tight text-white leading-[1]">
               YOUR FUTURE SELF <br/><span className="text-orange-500 italic">IS WAITING FOR YOU.</span>
            </h2>
            <p className="text-slate-400 text-lg sm:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
               The proof is right before your eyes. In 6 months, you could be the one sharing your story on this page. Or you could still be exactly where you are today. The choice is yours.
            </p>
            
            <div className="pt-8">
               <Link to="/checkout" className="inline-flex flex-col sm:flex-row items-center gap-6 group">
                  <div className="bg-orange-600 text-white px-12 py-7 rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-orange-600/30 group-hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                     SECURE MY SPOT FOR JUNE BATCH <ArrowRight className="h-7 w-7" />
                  </div>
               </Link>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-8">
                  REGISTRATION CLOSING SOON • JUNE 2026 BATCH
               </p>
            </div>
         </div>
      </section>

      {/* Trust Footer */}
      <footer className="py-20 bg-slate-950 border-t border-white/5 text-center px-4">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <img src="/veleonacademy_logo.png" alt="Veleon Academy" className="h-8 opacity-40" />
            <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-600">
               <Link to="/landing-page" className="hover:text-white transition-colors">Sales Page</Link>
               <Link to="/checkout" className="hover:text-white transition-colors">Checkout</Link>
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
            </div>
            <p className="text-slate-800 text-[10px] font-black uppercase tracking-widest">
               © {new Date().getFullYear()} Veleon Academy Technologies. All Rights Reserved.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default ReviewsPage;
