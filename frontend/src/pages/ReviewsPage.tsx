import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Play, 
  ArrowLeft,
  Quote,
  TrendingUp,
  BadgeCheck,
  Zap,
  X,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewsPage: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null);

  const handlePlayVideo = (name: string) => {
    // Premium custom mockup YouTube embeds or test video URLs
    const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"; // Placeholder premium video link
    setActiveVideo({ title: `${name}'s Success Story`, url: videoUrl });
  };

  const whatsappReviews = [
    {
      name: "Miss Rita Clc - Batch 2 Trainee",
      time: "07:06 PM",
      message: "Thank you so much Sir. I really enjoyed the class. You really broke things down making it easy for us to understand. I'm so grateful Sir for the access! 🙏",
      reply: "Oh I'm privileged Ma. Thank you for the feedback! Keep practicing! 🌟"
    },
    {
      name: "Oracle - Batch 1 Alumnus",
      time: "09:46 AM",
      message: "I had a great experience with Veleon Academy. The training was practical, easy to understand, and highly impactful. The instructors are knowledgeable and genuinely committed to helping students succeed. I've gained valuable skills that I can already apply. Highly recommend to anyone! 🔥",
      reply: "GREAT WORK ORACLE! TURNING PRACTICAL SKILLS INTO OPPORTUNITIES IS THE GOAL! 🚀"
    },
    {
      name: "Cornelius - Data Analyst Trainee",
      time: "09:48 AM",
      message: "My experience at Veleon Academy as a data analyst trainee has been very impactful. I’ve gained practical skills in data analysis, especially in Excel, data cleaning, and visualization. The training is well-structured and easy to understand. Boosted my confidence! 100% ✅",
      reply: "CONGRATULATIONS CS! A STRONG FOUNDATION IN DATA VISUALIZATION AND CLEANING IS KEY! 💼"
    },
    {
      name: "Akande Daniel - Batch 3 Student",
      time: "11:25 PM",
      message: "I joined the online training last night and I was blessed. Thank you Sir for such privilege. I want to ask, how much is the registration fee Sir and what gadgets are needed? I really want to lock this in.",
      reply: "Welcome Daniel! We support flexible learning. A basic laptop and internet access is all you need to start! ⚡"
    },
    {
      name: "Tunde - Batch 2 Graduate",
      time: "10:12 PM",
      message: "Just cleaned a messy regional sales database for a freelance client I got on LinkedIn. They were so impressed. The data cleaning track in Excel & SQL made this so easy! 😭🙌",
      reply: "BOOM! THAT'S THE POWER OF THE MONETIZATION BLUEPRINT IN ACTION! 💰"
    },
    {
      name: "Amina - Batch 1 Alumna",
      time: "02:30 PM",
      message: "Passed my technical assessment for a database query role! The window functions and CTE practice SQL questions we did on Saturday were exactly what they asked. Thank you Coach Ayodeji! 😭🙏",
      reply: "PROUD OF YOU AMINA! WINNING THE RECRUITER VISIBILITY SPRINT SAYS IT ALL! 🚀"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden pb-20">
      <SEO 
        title="Student Success Stories | Veleon Academy" 
        description="See real results from real people. Over 1,000+ students have transformed their careers with Veleon Academy."
      />

      {/* Top Banner Urgency */}
      <div className="bg-orange-600 text-white py-2.5 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-20">
        Registration for June 2026 Batch is Closing Soon! ⏳
      </div>

      {/* Header */}
      <header className="py-5 px-4 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/data" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden sm:inline">Back</span>
          </Link>
          <img src="/veleonacademy_logo.jpg" alt="Veleon Academy Logo" className="h-8 sm:h-10" />
          <Link 
            to="/data#enroll-section" 
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 active:scale-95"
          >
            ENROLL NOW <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* 1. HERO SECTION (Perceived Likelihood of Success) */}
      {/* <section className="relative pt-16 pb-12 px-4 overflow-hidden border-b border-white/5 text-center">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-orange-600/5 blur-[120px] rounded-full -z-10" />
         
         <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
               <Users className="h-3.5 w-3.5" /> High Perceived Likelihood of Success
            </div>
            <h1 className="text-4xl sm:text-7xl font-serif font-black tracking-tight uppercase leading-[1.1] text-white">
               VERIFIED <span className="text-orange-500 italic">EVIDENCE</span> <br/>
               OF SKILL <span className="text-orange-500 italic">MONETIZATION.</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-xl font-medium max-w-xl mx-auto leading-relaxed">
               Below is the proof that Veleon Academy's 6-Week Accelerator maximizes your likelihood of achieving data career success while eliminating standard learning blockades.
            </p>
         </div>
      </section> */}

      {/* 2. PERSUASIVE NARRATIVE ONE */}
      <section className="py-10 px-4 bg-slate-900/20 border-b border-white/5">
         <div className="max-w-3xl mx-auto text-center space-y-4">
            <Quote className="h-8 w-8 text-orange-500/20 mx-auto" />
            <h2 className="text-lg sm:text-2xl font-serif font-black uppercase tracking-tight italic text-slate-200 leading-relaxed">
               "This page isn't just about happy students. It is proof that our structured bonuses and double guarantee eliminate all risk for you."
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[9px]">Scroll down to see the real outcomes.</p>
         </div>
      </section>

      {/* 3. ELITE VIDEO STORIES SECTION */}
      <section className="md:py-16  px-4 bg-slate-950">
         <div className="max-w-5xl mx-auto space-y-12">
            {/* <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
               <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl sm:text-4xl font-serif font-black uppercase tracking-tighter text-white">
                    ELITE <span className="text-orange-500 italic">ACQUISITION</span> SUCCESS
                  </h3>
                  <p className="text-slate-500 text-sm font-bold">See how these students went from zero data skills to closing clients and secure queries.</p>
               </div>
               <div className="flex justify-center">
                  <div className="bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                     <Star className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500" />
                     <span className="font-black text-sm">4.9/5 <span className="text-slate-600 text-xs font-bold tracking-wider uppercase ml-1">Rating</span></span>
                  </div>
               </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Video Card 1 */}
               {/* <div className="group relative bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all shadow-xl">
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                     <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1000&auto=format&fit=crop" alt="Francis Umoren success video thumbnail" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                     <button onClick={() => handlePlayVideo("Francis Umoren")} className="absolute inset-0 flex items-center justify-center group/btn">
                        <div className="h-16 w-16 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/40 group-hover/btn:scale-110 transition-all">
                           <Play className="h-6 w-6 fill-white ml-0.5" />
                        </div>
                     </button>
                     <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-wider">
                           Office Automation
                        </div>
                        <div className="bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                           Case Study
                        </div>
                     </div>
                  </div>
                  <div className="p-6 space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-yellow-500 flex items-center justify-center font-black text-black text-sm">FU</div>
                        <div>
                           <h4 className="font-serif font-black uppercase tracking-tight text-yellow-500 text-sm">Francis Umoren</h4>
                           <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Database Administrator</p>
                        </div>
                     </div>
                     <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                        "I was skeptical at first, but Veleon Academy's curriculum is extremely practical. I went from struggling with basic Excel reports to automating database logs in no time!"
                     </p>
                  </div>
               </div> */}

               {/* Video Card 2 */}
               {/* <div className="group relative bg-white/5 rounded-3xl border border-white/10 overflow-hidden hover:border-orange-500/50 transition-all shadow-xl">
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                     <img src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=1000&auto=format&fit=crop" alt="Emeka Adebayo success video thumbnail" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                     <button onClick={() => handlePlayVideo("Emeka Adebayo")} className="absolute inset-0 flex items-center justify-center group/btn">
                        <div className="h-16 w-16 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-600/40 group-hover/btn:scale-110 transition-all">
                           <Play className="h-6 w-6 fill-white ml-0.5" />
                        </div>
                     </button>
                     <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[9px] font-black uppercase tracking-wider">
                           Digital Efficiency
                        </div>
                        <div className="bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                           Testimonial
                        </div>
                     </div>
                  </div>
                  <div className="p-6 space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-yellow-500 flex items-center justify-center font-black text-black text-sm">EA</div>
                        <div>
                           <h4 className="font-serif font-black uppercase tracking-tight text-yellow-500 text-sm">Emeka Adebayo</h4>
                           <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Administrative Lead</p>
                        </div>
                     </div>
                     <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                        "They don't teach you theories. Everything we did was simulating a real office task. Today, I build visual decks and handle cloud operations without asking colleagues for help."
                     </p>
                  </div>
               </div> */}
            </div>
         </div>
      </section>

      {/* REPEATING CTA BAR */}
      <section className="bg-orange-600 py-6 px-4">
         <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <h4 className="text-white text-lg sm:text-xl font-serif font-black uppercase tracking-tight">
               DO YOU WANT TO BE THE NEXT SUCCESS STORY?
            </h4>
            <Link 
              to="/data#enroll-section" 
              className="w-full sm:w-auto bg-white text-orange-600 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               ENROLL NOW FOR JUNE BATCH <ArrowRight className="h-4.5 w-4.5" />
            </Link>
         </div>
      </section>

      {/* 4. HIGH-STATUS AUTHORITY REVIEWS */}
      {/* <section className="py-16 px-4 relative">
         <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-2">
               <h3 className="text-2xl sm:text-4xl font-serif font-black uppercase tracking-tight text-white leading-none">
                 THE <span className="text-orange-500 italic">"AUTHORITY"</span> PROOF
               </h3>
               <p className="text-slate-500 text-sm font-bold">Professionals, Directors, and Researchers choose Veleon Academy.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
               {[
                  { name: "Dr. Adeoti Johnson", role: "Director of Accounts (Lagos State)", quote: "I needed to understand Data Analytics to run my department more effectively. Veleon Academy made it so simple that even at my level, I could follow along and implement immediately.", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" },
                  { name: "Blessing Okunola", role: "PhD Scholar & Tech Researcher", quote: "The curriculum here is more practical than anything I've seen in academia. They focus on what the industry actually needs. Worth every kobo of the enrollment fee.", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" }
               ].map((auth, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-white/5 p-8 rounded-[2rem] border border-white/10 relative group hover:border-orange-500/30 transition-all">
                     <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-orange-500 shrink-0 shadow-xl">
                        <img src={auth.photo} alt={auth.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-4 text-center sm:text-left">
                        <Quote className="h-6 w-6 text-orange-500 opacity-40 mx-auto sm:ml-0" />
                        <p className="text-base sm:text-lg font-bold italic text-slate-200 leading-relaxed">"{auth.quote}"</p>
                        <div>
                           <h4 className="text-xl font-serif font-black uppercase text-yellow-500 tracking-tight">{auth.name}</h4>
                           <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mt-0.5">{auth.role}</p>
                        </div>
                     </div>
                     <div className="absolute top-6 right-6 text-orange-500/5 hidden sm:block">
                        <BadgeCheck className="h-20 w-20" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section> */}

      {/* 5. WHATSAPP PROOF GRID (Differentiated WhatsApp Testimony Grid) */}
      <section className="py-16 px-4 bg-orange-600/5">
         <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-3">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-approve/10 text-approve text-[9px] font-black uppercase tracking-widest border border-approve/20">
                  <TrendingUp className="h-3 w-3" /> Raw Proof from Students
               </div>
               <h3 className="text-2xl sm:text-4xl font-serif font-black uppercase tracking-tight text-white leading-none">
                 THE <span className="text-orange-500 italic">"WINNING"</span> CHATS
               </h3>
               <p className="text-slate-500 text-sm font-bold">Real, raw snapshots from our cohort WhatsApp group communities.</p>
            </div>

              <div className="md:w-1/2 relative bg-slate-100 h-full">
              <img src="/Testimonial_Cornelius.jpg" alt="Lead Trainer Omidoyin Ayodeji" className=" inset-0 w-full h-full object-cover"  />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Cornelius</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
              </div>
           </div>

            <div className="md:w-1/2 relative bg-slate-100 h-full">
              <img src="/Testimonial_segun.jpg" alt="Lead Trainer Omidoyin Ayodeji" className=" inset-0 w-full h-full object-cover"  />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Segun</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
              </div>
           </div>

            <div className="md:w-1/2 relative bg-slate-100 h-full">
              <img src="/Testimonial_Rita.jpg" alt="Lead Trainer Omidoyin Ayodeji" className=" inset-0 w-full h-full object-cover"   />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Rita</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
              </div>
           </div>

            <div className="md:w-1/2 relative bg-slate-100 h-full">
              <img src="/Testimonial_Barry.jpg" alt="Lead Trainer Omidoyin Ayodeji" className=" inset-0 w-full h-full object-cover"   />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 text-white">
                 <h3 className="text-xl font-serif font-black leading-tight uppercase">Barry</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[9px]">Cohort 2 Student</p>
              </div>
           </div>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {whatsappReviews.map((rev, idx) => (
                  <div key={idx} className="bg-[#075e54]/10 border border-[#128c7e]/30 rounded-3xl overflow-hidden group hover:border-orange-500/50 transition-all shadow-md">
                     <div className="bg-[#075e54] p-3.5 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs text-white uppercase">{rev.name.charAt(0)}</div>
                        <div>
                           <p className="text-white text-xs font-black truncate max-w-[180px]">{rev.name}</p>
                           <p className="text-[#25d366] text-[7px] font-black uppercase tracking-widest">Active Member</p>
                        </div>
                     </div>
                     <div className="p-5 space-y-3 bg-slate-900/40 min-h-[180px] flex flex-col justify-between">
                        <div className="bg-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-white/5 space-y-1 max-w-[95%]">
                           <p className="text-white text-[12px] font-medium leading-relaxed">
                              "{rev.message}"
                           </p>
                           <p className="text-[8px] text-slate-500 text-right">{rev.time} ✓✓</p>
                        </div>
                        <div className="bg-[#075e54]/20 p-3 rounded-2xl rounded-tr-none border border-approve/10 space-y-1 max-w-[95%] ml-auto">
                           <p className="text-approve text-[10px] font-black uppercase italic leading-tight">
                              {rev.reply}
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div> */}
         </div>
      </section>

      {/* 6. PERSUASIVE NARRATIVE CLOSE */}
      <section className="py-20 px-4 border-t border-white/5">
         <div className="max-w-3xl mx-auto text-center space-y-8">
            <Zap className="h-10 w-10 text-orange-500 mx-auto animate-bounce" />
            <h2 className="text-3xl sm:text-6xl font-serif font-black uppercase tracking-tight text-white leading-tight">
               YOUR FUTURE SELF <br/><span className="text-orange-500 italic">IS WAITING FOR YOU.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto font-medium">
               The proof is right before your eyes. In a few weeks, you could be the one sharing your success story on this page. Or you could still be exactly where you are today. The choice is yours.
            </p>
            
            <div className="pt-6">
               <Link 
                 to="/data#enroll-section" 
                 className="inline-flex bg-orange-600 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl shadow-orange-600/30 hover:scale-[1.02] active:scale-95 transition-all items-center gap-3"
               >
                  SECURE MY SPOT FOR JUNE BATCH <ArrowRight className="h-5 w-5" />
               </Link>
               <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-6">
                  REGISTRATION CLOSING SOON • JUNE 2026 BATCH
               </p>
            </div>
         </div>
      </section>

      {/* Interactive Video Modal Portal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4"
          >
             <div className="bg-[#0b0f19] border border-white/10 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors z-10"
                >
                   <X className="h-5 w-5" />
                </button>
                <div className="p-4 sm:p-6 border-b border-white/5">
                   <h3 className="font-serif font-black text-base sm:text-lg text-white uppercase tracking-tight">
                     {activeVideo.title}
                   </h3>
                </div>
                <div className="aspect-video w-full bg-black relative">
                   <iframe 
                     title={activeVideo.title}
                     src={activeVideo.url} 
                     className="absolute inset-0 w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen
                   ></iframe>
                </div>
                <div className="p-4 sm:p-6 bg-slate-900/40 text-center space-y-3">
                   <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                     This is a simulator placeholder. When user clicks, we load the student's actual video recording.
                   </p>
                   <Link 
                     to="/data#enroll-section"
                     className="inline-flex bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                   >
                     Enroll Now & Get Results
                   </Link>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center px-4">
         <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
            <img src="/veleonacademy_logo.jpg" alt="Veleon Academy Logo" className="h-8 opacity-40" />
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
               <Link to="/data" className="hover:text-white transition-colors">Sales Page</Link>
               <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
               <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <p className="text-slate-800 text-[9px] font-black uppercase tracking-widest">
               © {new Date().getFullYear()} Veleon Academy Technologies. All Rights Reserved.
            </p>
         </div>
      </footer>
    </div>
  );
};

export default ReviewsPage;
