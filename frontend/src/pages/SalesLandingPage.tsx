import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Users, 
  Award, 
  ShieldCheck, 
  Star, 
  MessageCircle, 
  Zap, 
  Clock, 
  Calendar,
  CheckCircle,
  PlayCircle,
  FileText,
  MousePointer2,
  TrendingUp,
  Cpu,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const SalesLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      <SEO 
        title="From Graduate to Job-Ready: Master Essential Digital Skills | Veleon Academy" 
        description="Even if you're starting from zero, learn the essential digital skills schools don't teach. Become confident and job-ready in 30 days."
      />

      {/* Top Banner Urgency */}
      <div className="bg-orange-600 text-white py-2.5 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-50">
        Registration for June 2026 Batch is Closing Soon! ⏳ 
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-20 pb-12 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        {/* Abstract backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[300px] sm:h-[600px] bg-orange-500/10 blur-[100px] sm:blur-[150px] rounded-full -z-10" />
        <div className="absolute top-[20%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8 sm:mb-16"
          >
            <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl border border-white/10">
              <img src="/veleonacademy_logo.png" alt="Veleon Academy" className="h-10 sm:h-14 px-4 py-2" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1] text-white"
          >
            "You finished school... but can you <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 italic">actually</span> handle tasks on a computer?"
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg sm:text-3xl max-w-3xl mx-auto leading-relaxed font-medium px-4"
          >
            Master the essential digital skills in <span className="text-white font-extrabold relative inline-block mx-2">
              <span className="relative z-10">just 30 days</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-orange-500/30 -z-10 rounded-full" />
            </span> – even if you are starting from zero
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center pt-8 sm:pt-12"
          >
            <Link to="/checkout" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white px-10 sm:px-16 py-6 sm:py-8 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-2xl uppercase tracking-widest shadow-[0_20px_60px_-15px_rgba(249,115,22,0.5)] active:scale-95 flex items-center justify-center gap-4">
              Enroll for June Batch <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
            </Link>
            <p className="mt-6 text-slate-500 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Clock className="h-4 w-4" /> Next batch starts June 2026
            </p>
          </motion.div>

          {/* Stat Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 sm:mt-20 bg-white text-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-3xl text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10">
              <Users className="h-16 w-16 sm:h-24 sm:w-24 text-orange-500" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
              <div className="shrink-0 w-24 h-24 sm:w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-xl">
                 <img src="https://i.pravatar.cc/200?u=coach" alt="Coach Dami" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-3 sm:space-y-4 text-center md:text-left">
                <h3 className="text-xl sm:text-4xl font-black tracking-tight leading-tight">
                  "OVER 1,000 STUDENTS, GRADUATES, AND PROFESSIONALS HAVE TRUSTED US TO BUILD THEIR DIGITAL SKILLS"
                </h3>
                <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] sm:text-sm flex items-center justify-center md:justify-start gap-2">
                   YOU COULD BE NEXT <CheckCircle2 className="h-4 w-4" />
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. WELCOME SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-slate-900/40 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
            Welcome to the Elite Academy
          </div>
          <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight uppercase px-4 sm:px-0">HELLO & WELCOME TO <br className="sm:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 italic">VELEON ACADEMY</span></h2>
          
          <div className="space-y-6 sm:space-y-8 text-slate-300 text-base sm:text-xl font-medium max-w-3xl mx-auto text-center px-4">
            <p className="leading-relaxed">
              Veleon Academy is a <span className="text-white font-bold">top-tier professional training organization</span> focused on equipping individuals with practical, job-ready digital skills for today's global workplace.
            </p>
            <p className="leading-relaxed">
              We have successfully trained <span className="text-approve font-bold underline decoration-approve/30 underline-offset-4 text-xl sm:text-2xl px-1 italic">over 1,000 global citizens</span> who are now building real skills across oil and gas, finance, and major tech sectors.
            </p>
            <p className="leading-relaxed">
              Our training is hands-on and practical, designed to help learners confidently handle real workplace tasks using essential digital tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-10 px-4">
            <Link to="/checkout" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-10 sm:px-12 py-5 sm:py-6 rounded-2xl font-black text-base sm:text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/30">
              Enroll Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/reviews" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 sm:px-12 py-5 sm:py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              See Success Stories <PlayCircle className="h-5 w-5 text-orange-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. REALITY CHECK SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-secondary/5 blur-[100px] sm:blur-[150px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-10">
             <div className="bg-secondary/10 border-l-4 border-secondary p-6 sm:p-8 rounded-r-[1.5rem] sm:rounded-r-3xl space-y-4">
                <h3 className="text-secondary text-xl sm:text-2xl font-black uppercase tracking-widest">BE HONEST WITH YOURSELF...</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    "You \"know computer\" but still feel confused",
                    "You are not confident applying for jobs",
                    "You struggle with simple tasks like Excel or email",
                    "You depend on others to help you"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 items-start">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1 sm:mt-0.5">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-secondary" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="bg-secondary p-5 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl shadow-secondary/20">
                <p className="text-white font-black text-lg sm:text-xl uppercase tracking-tight text-center">
                  THIS IS WHY MANY GRADUATES ARE NOT JOB-READY
                </p>
             </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-2xl space-y-6 sm:space-y-8">
            <h3 className="text-slate-900 text-2xl sm:text-3xl font-black tracking-tight">THIS IS NOT JUST ANOTHER COMPUTER CLASS.</h3>
            <div className="bg-approve/10 border-l-4 border-approve p-3 sm:p-4 rounded-r-lg sm:rounded-r-xl">
               <p className="text-approve text-[10px] sm:text-xs font-black uppercase tracking-widest">
                 JOB-READY DIGITAL SKILLS TRAINING DESIGNED TO HELP YOU:
               </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {[
                { title: "Understand how real work is done", icon: <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" /> },
                { title: "Use tools like Word, Excel, and email confidently", icon: <Cpu className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" /> },
                { title: "Handle tasks from start to finish without confusion", icon: <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 items-center p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                  <div className="shrink-0">{item.icon}</div>
                  <p className="text-slate-700 text-sm sm:text-base font-bold">{item.title}</p>
                </div>
              ))}
            </div>
             <Link to="/checkout" className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-xl sm:rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-600/20">
              Enroll Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. REVIEW SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-orange-500/5">
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          <div className="text-center space-y-2 sm:space-y-4">
             <h4 className="text-orange-500 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-sm">Review from one of our students</h4>
             <h2 className="text-2xl sm:text-5xl font-black tracking-tight leading-tight uppercase px-2">"VELEON ACADEMY IS ONE OF THE BEST ONLINE DIGITAL ACADEMIES"</h2>
          </div>

          <div className="bg-white text-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-3xl relative">
            <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 bg-orange-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-xl">
               <Star className="h-6 w-6 sm:h-8 sm:w-8 fill-current" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center text-center md:text-left">
              <div className="shrink-0 w-32 h-32 sm:w-48 sm:h-48 bg-slate-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                <img src="https://i.pravatar.cc/300?u=ike" alt="Ikechukwu Kingsley" className="w-full h-full object-cover grayscale-0" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-orange-500 uppercase">IKECHUKWU KINGSLEY</h3>
                  <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">Logistic Analyst, Craft Offshore Int'l</p>
                </div>
                <div className="relative">
                  <span className="absolute -top-6 sm:-top-8 -left-4 sm:-left-8 text-6xl sm:text-8xl text-slate-100 font-serif leading-none -z-10">"</span>
                  <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed italic relative z-10 px-2 sm:px-0">
                    "I can confidently say that this is one of the best online classes you can attend. The program includes valuable bonuses, such as a weekend live session to review the past week's training and a bonus of weekly freelance classes on how to maximize and monetize your skills as a Data Analyst—all for an incredible price! That's 8 weeks of transformative, educational training!"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/reviews" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-3 mx-auto">
            To See More Reviews (Click Here) <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 5. OUTCOMES SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 overflow-hidden relative">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-5xl font-black tracking-tight uppercase px-4 sm:px-0 leading-tight">BY THE END OF THIS TRAINING, YOU WILL BE ABLE TO:</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="relative aspect-video sm:aspect-square md:aspect-auto rounded-[2rem] sm:rounded-[3rem] overflow-hidden group shadow-2xl">
               <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" alt="Job Ready" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10">
                  <div className="bg-orange-500/90 backdrop-blur-md p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <p className="text-white font-black text-lg sm:text-xl tracking-tight leading-tight uppercase">BECOME THE ASSET EVERY COMPANY WANTS TO HIRE</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {[
                "Use a computer confidently in a workplace",
                "Create documents, reports, and presentations",
                "Work with data using Excel",
                "Send professional emails & communicate properly",
                "Organize files & manage tasks like a professional"
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex gap-4 items-center p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:border-orange-500/50 transition-colors group"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shrink-0">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-100">{item}</p>
                </motion.div>
              ))}
              
             <Link to="/checkout" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20">
                Yes, I want these results <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COURSE OVERVIEW & MODULES */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
             <div className="space-y-6 sm:space-y-8">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:mx-0 mx-auto border border-orange-500/20">
                 Curriculum Overview
               </div>
               <h2 className="text-4xl sm:text-7xl font-black tracking-tighter leading-none text-center lg:text-left">ABOUT THE <br/><span className="text-orange-500 italic">TRAINING</span></h2>
               <p className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed text-center lg:text-left">
                 All you need to know about the training program designed to take you from a curious beginner to a confident professional.
               </p>
               
               <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] space-y-6">
                 <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
                   HERE'S WHAT YOU WILL LEARN: <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4">
                   {[
                     "Computer Foundations & Confidence",
                     "Workplace Tools (Word, Excel, PPT)",
                     "Internet & Digital Workflow",
                     "Communication & Collaboration",
                     "Google Workspace for Work",
                     "Canva for Workplace Designs",
                     "AI Tools for Productivity",
                     "Real Workplace Task Simulation"
                   ].map((item, i) => (
                     <div key={i} className="flex gap-2 items-start text-xs sm:text-sm font-bold text-slate-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                        {item}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
             
             <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-[80px] sm:blur-[100px] rounded-full" />
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Learning" className="rounded-[2rem] sm:rounded-[3rem] shadow-3xl relative" />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { 
                num: 1, 
                title: "Computer Foundations", 
                desc: "Hardware/Software basics, Windows navigation, File management, Keyboard shortcuts." 
              },
              { 
                num: 2, 
                title: "Productivity Tools", 
                desc: "Master Microsoft Word, Excel (formulas/charts), and PowerPoint for stunning presentations." 
              },
              { 
                num: 3, 
                title: "Digital Workflow", 
                desc: "Effective browsing, handling uploads/downloads, Google Workspace mastery (Drive, Meet)." 
              },
              { 
                num: 4, 
                title: "Collab & AI", 
                desc: "Professional emails, Cloud storage, AI tools, and Real Workplace Task Simulation." 
              }
            ].map((mod, i) => (
              <div key={i} className="bg-[#180E2B] border border-white/5 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] space-y-4 hover:border-orange-500/30 transition-all hover:-translate-y-2 group">
                 <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-black text-lg sm:text-xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                    {mod.num}
                 </div>
                 <h3 className="text-lg sm:text-xl font-black tracking-tight">{mod.title}</h3>
                 <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/checkout" className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-105 flex items-center justify-center gap-3">
               Start Learning Now <ArrowRight className="h-4 w-4" />
             </Link>
             <Link to="/curriculum" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-white/10 flex items-center justify-center gap-3">
               Download Curriculum <FileText className="h-4 w-4 text-orange-500" />
             </Link>
          </div>
        </div>
      </section>

      {/* 7. SCHEDULE SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto bg-white text-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-3xl flex flex-col lg:flex-row">
           <div className="p-8 sm:p-16 space-y-8 lg:w-3/5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                Our Teaching Method
              </div>
              <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-none uppercase">TRAINING <span className="text-orange-500 italic">SCHEDULE</span></h2>
              <p className="text-lg sm:text-xl text-slate-600 font-bold tracking-tight uppercase">SEE HOW FLEXIBLE THE TRAINING IS:</p>
              
              <div className="space-y-6 sm:space-y-8 text-left">
                 <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-approve rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-approve/20">
                       <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                       <h4 className="font-black text-base sm:text-lg mb-1 uppercase tracking-tight">Monday to Saturday</h4>
                       <p className="text-slate-500 text-sm sm:text-base font-medium">Get short, pre-recorded lessons released daily. Each one is 30 to 45 minutes, so you can learn at your own pace.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-approve rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-approve/20">
                       <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                       <h4 className="font-black text-base sm:text-lg mb-1 uppercase tracking-tight">Sundays Live Session</h4>
                       <p className="text-slate-500 text-sm sm:text-base font-medium font-bold italic mb-2">"This is where everything becomes practical."</p>
                       <p className="text-slate-500 text-sm sm:text-base font-medium">We meet live for 1 hour for deep-dive guidance through real workplace tasks using what you learned.</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 italic font-medium text-slate-500 text-[11px] sm:text-sm">
                And if you miss any session, the recordings will always be available. You won’t lose anything.
              </div>
           </div>
           
           <div className="lg:w-2/5 bg-slate-950 p-8 sm:p-16 flex flex-col justify-center text-center space-y-6 sm:space-y-8 relative overflow-hidden">
              <div className="h-1.5 w-12 bg-orange-600 rounded-full" />
              <div className="space-y-3 sm:space-y-4 relative z-10">
                 <p className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs">Pay Small Small Available</p>
                 <h3 className="text-2xl sm:text-3xl text-white font-black leading-tight uppercase">ARE YOU READY FOR JUNE 2026?</h3>
                 <p className="text-slate-400 text-sm sm:text-base font-medium">Spots are filling up fast. Secure yours now.</p>
              </div>
             <Link to="/checkout" className="w-full bg-orange-600 hover:bg-orange-700 text-white px-8 sm:px-10 py-5 sm:py-6 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg uppercase tracking-widest transition-all hover:scale-105 shadow-2xl shadow-orange-600/30 relative z-10 text-center">
               Enroll Now
             </Link>
           </div>
        </div>
      </section>

      {/* 8. WHO IT IS FOR SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-3xl sm:text-6xl font-black tracking-tight uppercase px-4 leading-tight">WHO IS THIS <span className="text-orange-500 italic">TRAINING</span> FOR?</h2>
             <p className="text-slate-400 text-base sm:text-xl font-medium px-4">This training is for you if you fall into any of these categories.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {[
              { 
                cat: "Students & Graduates", 
                desc: "Trying to build real skills beyond school to stand out in a crowded job market." 
              },
              { 
                cat: "Job Seekers", 
                desc: "Tired of applying but not feeling confident enough for actual digital work." 
              },
              { 
                cat: "Young Professionals", 
                desc: "Already working but struggling with digital tasks or want to increase efficiency." 
              },
              { 
                cat: "Aspiring Techies", 
                desc: "Anyone wanting to become confident using computers without depending on others." 
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] group hover:border-orange-500/50 transition-all flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase">{item.cat}</h3>
                  <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <div className="bg-approve/10 border border-approve/30 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center w-full">
               <p className="text-approve text-lg sm:text-xl font-black italic uppercase tracking-tight">
                 If any of these sound like you, then this training was created with you in mind.
               </p>
            </div>
            <Link to="/checkout" className="w-full sm:w-auto bg-orange-500 text-white px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 flex items-center justify-center gap-3">
               Reserve My Seat <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. LEAD TRAINER SECTION */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto bg-white text-slate-900 rounded-[2rem] sm:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col lg:flex-row">
           <div className="lg:w-1/2 relative bg-slate-100 min-h-[300px] sm:min-h-[500px]">
              <img src="https://i.pravatar.cc/800?u=dami" alt="Lead Trainer" className="absolute inset-0 w-full h-full object-cover grayscale-0" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent p-6 sm:p-12 text-white">
                 <h3 className="text-2xl sm:text-3xl font-black leading-tight uppercase">DAMILOLA BAKARE</h3>
                 <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] sm:text-sm">CEO & Data Analysis Trainer</p>
              </div>
           </div>
           
           <div className="lg:w-1/2 p-8 sm:p-16 lg:p-20 space-y-6 sm:space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                Meet Your Mentor
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-[1]">ABOUT THE <br/><span className="text-orange-500 italic">LEAD TRAINER</span></h2>
              
              <div className="space-y-3 sm:space-y-4">
                 {[
                   "Seven (7) Years Plus Data Analysis Expert",
                   "8 years experience (Banking, FMCG, Hospitality)",
                   "Co-founder of a Tech & Edutech startup",
                   "BSc. Business Administration (Uopeople, USA)",
                   "Trained Eleven (11) batches of students globally",
                   "Seasoned Trainer & Consultant",
                   "Wife and Mother"
                 ].map((point, i) => (
                   <div key={i} className="flex gap-3 sm:gap-4 items-center font-bold text-slate-600 group text-sm sm:text-base">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0 group-hover:scale-150 transition-transform" />
                      {point}
                   </div>
                 ))}
              </div>
              
              <Link to="/checkout" className="w-full bg-orange-600 text-white px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-600/20 block text-center">
                 Enroll in Next Batch
              </Link>
           </div>
        </div>
      </section>

      {/* 10. REVIEWS CALLOUT */}
      <section className="py-24 px-6 bg-orange-500/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
           <div className="shrink-0 w-64 h-64 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative rotate-3">
              <img src="https://i.pravatar.cc/400?u=student3" alt="Happy Student" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-[12px] border-white/10" />
           </div>
           
           <div className="space-y-6 flex-1">
             <h3 className="text-3xl sm:text-4xl font-black leading-tight uppercase">"COACH DAMI, YOUR PASSION TOWARDS WHAT YOU DO IS SECOND TO NONE"</h3>
             <p className="text-slate-500 font-bold uppercase tracking-widest">Review from a Batch 11 Student</p>
               <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <Link to="/checkout" className="w-full sm:w-auto bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20 text-center">
                    Enroll in Next Batch
                 </Link>
                  <Link to="/reviews" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all text-center">
                    Read Full Story
                  </Link>
               </div>
           </div>
        </div>
      </section>

      {/* 11. QUALITY PROOF */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-[#0a0514]">
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 text-center">
          <h2 className="text-3xl sm:text-6xl font-black tracking-tight uppercase leading-[1.1] sm:leading-none px-2 sm:px-0">WHY OUR <br className="sm:hidden"/><span className="text-orange-500 italic">GRADUATES</span> STAND OUT?</h2>
          <p className="text-slate-400 text-lg sm:text-2xl font-black italic uppercase tracking-tight underline decoration-orange-500/30 underline-offset-8">"THEY PROVED IT."</p>

          <div className="space-y-6 sm:space-y-8 text-slate-300 text-base sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto px-2">
            <p>Many people have certificates. But not many have actually been tested.</p>
            <p className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tighter">THAT IS THE DIFFERENCE.</p>
            <p>Before completing our training, every student must carry out an individual project. No shortcuts. No exceptions.</p>
            <p>They apply everything they've learned to a real task from start to finish. Alone. With real data.</p>
          </div>
          
          <div className="pt-8 sm:pt-12 px-4 sm:px-0">
            <Link to="/checkout" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 sm:px-16 py-7 sm:py-9 rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-2xl uppercase tracking-[0.2em] shadow-[0_20px_60px_-15px_rgba(249,115,22,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 mx-auto">
              ENROLL NOW <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10" />
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Mobile CTA */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <Link 
          to="/checkout" 
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_15px_40px_-10px_rgba(249,115,22,0.6)] flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          Enroll Now <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* Footer minimal */}
      <footer className="py-12 sm:py-20 border-t border-white/5 text-center space-y-6 px-4">
        <img src="/veleonacademy_logo.png" alt="Logo" className="h-8 sm:h-10 mx-auto grayscale opacity-40 hover:opacity-100 transition-opacity" />
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
           <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
           <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
           <a href="#" className="hover:text-orange-500 transition-colors">Contact Support</a>
        </div>
        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-700 font-bold">© {new Date().getFullYear()} Veleon Academy. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default SalesLandingPage;
