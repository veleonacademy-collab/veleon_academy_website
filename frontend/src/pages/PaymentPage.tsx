import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock,
  ArrowLeft,
  Clock,
  ChevronDown,
  Info,
  BadgeAlert,
  Wallet,
  ArrowDown,
  HeartHandshake,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentPage: React.FC = () => {
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'installment'>('full');
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = (plan: 'full' | 'installment') => {
    setPaymentPlan(plan);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-orange-500 selection:text-white font-sans overflow-x-hidden">
      <SEO 
        title="Secure Checkout | June 2026 Batch" 
        description="Secure your spot for the June 2026 Batch. Registration is closing soon. Simple 3-step process to enroll now."
      />

      {/* Top Banner Urgency */}
      <div className="bg-orange-600 text-white py-2 px-4 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-20">
        Registration for June 2026 Batch is Closing Soon! Don't Miss Out ⏳
      </div>

      {/* Header */}
      <header className="py-4 px-4 border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/landing-page" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest hidden sm:inline">Back</span>
          </Link>
          <img src="/veleonacademy_logo.png" alt="Veleon Academy" className="h-7 sm:h-9" />
          <div className="flex items-center gap-2 text-orange-500 font-black uppercase text-[8px] sm:text-[9px] tracking-widest border border-orange-500/30 px-3 py-1 rounded-full bg-orange-500/5 animate-pulse">
            <BadgeAlert className="h-3 w-3" /> Closing Soon
          </div>
        </div>
      </header>

      {/* 1. HOW IT WORKS */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden bg-slate-900/40 border-b border-white/5">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-2">
             <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase leading-tight">SIMPLE 3-STEP PROCESS <br/><span className="text-orange-500 italic">TO ENROLL NOW</span></h2>
             <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">Secure your spot for June 2026 before registration closes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
               { n: 1, t: "Pick Your Plan", d: "Choose how you want to pay to lock in your June 2026 slot." },
               { n: 2, t: "Fill Details", d: "Entry takes 60 seconds. We need your WhatsApp to add you to the group." },
               { n: 3, t: "Secure My Spot", d: "Complete your deposit now to guarantee your seat before they're gone!" }
            ].map((step, i) => (
               <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-start gap-4 group hover:border-orange-500/30 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-orange-500/10">{step.n}</div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-black uppercase tracking-tight">{step.t}</h4>
                     <p className="text-slate-400 text-[11px] font-medium leading-relaxed">{step.d}</p>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PAYMENT BREAKDOWN */}
      <section className="py-8 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
           <div className="bg-[#180E2B] border border-white/5 p-6 sm:p-8 rounded-[2rem] space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Wallet className="h-24 w-24 text-orange-500" />
              </div>
              <div className="text-center space-y-2 relative z-10">
                 <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">LOCK IN YOUR JUNE 2026 BATCH <span className="text-orange-500 italic">PRICE NOW</span></h2>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Prices will increase for the next batch. Secure this rate today.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 font-black">WEEK 1</span>
                      <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="space-y-0.5">
                       <h4 className="text-2xl font-black tracking-tighter text-white">N17,000</h4>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight italic">Secure Spot Immediately</p>
                    </div>
                 </div>
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3 hover:border-orange-500/30 transition-all opacity-80">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-black">WEEK 2</span>
                      <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="space-y-0.5">
                       <h4 className="text-2xl font-black tracking-tighter text-white">N17,000</h4>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight italic">Balance Due Week 2</p>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-orange-600/5 rounded-xl border border-orange-600/20 flex gap-3 items-center relative z-10">
                 <Info className="h-6 w-6 text-orange-500 shrink-0" />
                 <p className="text-[11px] text-slate-400 font-medium leading-tight">
                   <span className="text-orange-500 font-black mr-1 uppercase italic underline">Hurry:</span> 
                   Registration is closing soon. Full payment (N21,999) guarantees you instant lifetime access.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* 2.5 RISK-FREE GUARANTEE (New Added Section) */}
      <section className="py-4 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
           <div className="bg-approve/5 border-2 border-dashed border-approve/30 p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 relative">
              <div className="shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-approve/10 flex items-center justify-center text-approve">
                 <ShieldCheck className="h-10 w-10 sm:h-12 sm:w-12 animate-pulse" />
              </div>
              <div className="space-y-3 text-center md:text-left">
                 <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-approve italic underline decoration-approve/20 underline-offset-4">100% IRON-CLAD VALUE GUARANTEE</h3>
                 <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                    We don't just teach; we deliver results. If we don’t deliver exactly what we promised, your investment is safe. 
                    <span className="text-white font-bold block mt-2">
                       Personalized Support: If you're struggling, Coach Dami will personally jump on a 1-on-1 coaching session with you to make sure you get it.
                    </span>
                    <span className="text-approve font-black uppercase text-[10px] sm:text-xs block mt-2 tracking-widest italic">
                       Our Promise: If after the 1-on-1 session you still aren't getting value, we will issue a 100% refund—no questions asked.
                    </span>
                 </p>
              </div>
              <div className="absolute -top-3 -right-3 bg-approve text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-approve/20 rotate-3">
                 Risk-Free
              </div>
           </div>
        </div>
      </section>

      {/* 3. PLAN SELECTION */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[200px] bg-orange-500/10 blur-[80px] rounded-full -z-10" />
         
         <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-2">
               <h2 className="text-2xl sm:text-4xl font-black tracking-tighter leading-tight uppercase">SECURE YOUR SEAT <span className="text-orange-500 italic">FOR JUNE 2026 NOW</span></h2>
               <p className="text-orange-500 text-[11px] sm:text-sm font-black uppercase tracking-[0.2em] max-w-md mx-auto italic animate-pulse">
                  FINAL SPOTS REMAINING - REGISTRATION CLOSING SOON
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                 onClick={() => scrollToForm('full')}
                 className="group bg-white/5 border-2 border-white/20 p-6 rounded-3xl hover:border-orange-500/60 transition-all text-left relative overflow-hidden flex flex-col gap-4 shadow-xl"
               >
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-5 py-1.5 rounded-bl-xl text-[9px] font-black uppercase tracking-widest">
                    Best Value Option
                  </div>
                  <div className="space-y-2">
                     <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Option 1</p>
                     <h3 className="text-2xl font-black tracking-tight">Full Payment</h3>
                     <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-orange-500 tracking-tighter">N21,999</span>
                        <span className="text-slate-500 line-through text-sm font-bold">N50k</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-white bg-orange-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:scale-105 transition-all mt-2 w-fit">
                     SECURE MY SEAT IN FULL <ArrowDown className="h-3 w-3" />
                  </div>
               </button>

               <button 
                 onClick={() => scrollToForm('installment')}
                 className="group bg-white/5 border-2 border-white/20 p-6 rounded-3xl hover:border-orange-500/60 transition-all text-left relative overflow-hidden flex flex-col gap-4 shadow-xl"
               >
                  <div className="space-y-2">
                     <p className="text-slate-500 font-black uppercase tracking-widest text-[9px]">Option 2</p>
                     <h3 className="text-2xl font-black tracking-tight uppercase">Pay Small Small</h3>
                     <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-orange-500 tracking-tighter">N34k</span>
                        <span className="text-slate-400 text-[9px] font-black uppercase italic">Total</span>
                     </div>
                     <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic pt-1 text-orange-500/80">Only Pay N17k Now</p>
                  </div>
                  <div className="flex items-center gap-2 text-white bg-orange-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:scale-105 transition-all mt-2 w-fit">
                     LOCK IN PAY SMALL SMALL <ArrowDown className="h-3 w-3" />
                  </div>
               </button>
            </div>
         </div>
      </section>

      {/* 4. CHECKOUT FORM */}
      <main ref={formRef} className="max-w-6xl mx-auto px-4 py-8 bg-white rounded-t-[3rem] text-slate-900 border-t-8 border-orange-600 shadow-2xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
          
          <div className="space-y-6">
            <div className="space-y-2">
               <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight uppercase">FINAL STEP: <br/><span className="text-orange-600 italic">SECURE YOUR SPOT</span></h2>
               <p className="text-slate-500 font-bold text-sm leading-relaxed underline underline-offset-4 decoration-orange-600/30">Training starts June 2026 - Registration Closing Soon!</p>
            </div>

            {/* Refund Badge on Form */}
            <div className="bg-approve/5 border border-approve/10 p-4 rounded-2xl flex items-center gap-4">
                <HeartHandshake className="h-6 w-6 text-approve shrink-0" />
                <p className="text-[10px] font-bold text-slate-600 uppercase italic">
                   Guaranteed Value or 100% Refund (After 1-on-1 coaching session)
                </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
               <div className="space-y-0.5">
                  <p className="text-[9px] font-black uppercase text-slate-400">Locking In Plan:</p>
                  <p className="text-sm font-black uppercase tracking-tight text-orange-600 truncate max-w-[200px]">
                     {paymentPlan === 'full' ? 'Full Payment (N21,999)' : 'Pay Small Small (N17,000)'}
                  </p>
               </div>
               <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-orange-600 transition-colors shadow-sm">
                  <ChevronDown className="h-4 w-4 rotate-180" />
               </button>
            </div>

            <div className="space-y-4 pt-4 mb-4 lg:mb-0 hidden sm:block">
               <div className="flex items-center gap-3 text-approve font-black uppercase text-[10px] tracking-widest">
                  <ShieldCheck className="h-4 w-4" /> Secure Checkout
               </div>
               <div className="flex gap-4 items-center opacity-30 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
               </div>
               <p className="text-slate-400 text-[10px] font-bold italic">© All payments are safe and encrypted.</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
            <form className="space-y-5">
               <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ebuka John"
                      className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. ebuka@gmail.com"
                      className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +234 816 000 0000"
                      className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-600/10 focus:border-orange-600 transition-all font-sans"
                    />
                  </div>
               </div>

               <div className="space-y-2 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center text-lg font-black uppercase tracking-tight text-slate-900">
                    <span>Due Now:</span>
                    <span className="text-2xl text-orange-600">{paymentPlan === 'full' ? 'N21,999' : 'N17,000'}</span>
                  </div>
                  <div className="bg-orange-600/10 p-3 rounded-lg border border-orange-600/20 text-orange-600 text-[9px] font-black uppercase tracking-tight text-center animate-pulse">
                    Final Spots for June Batch - Don't Miss Out!
                  </div>
               </div>

               <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-3">
                 SECURE MY SEAT NOW <ArrowRight className="h-5 w-5" />
               </button>
            </form>

            <div className="pt-4 border-t border-slate-200">
                <div className="bg-white p-5 rounded-2xl border-dashed border-2 border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-600 font-black uppercase text-[9px] tracking-widest">
                    <Building2 className="h-4 w-4" /> Transfer Option (Fast)
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="font-bold text-slate-400 uppercase">Bank:</span>
                       <span className="font-black text-slate-900">Opay Digital Bank</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                       <span className="font-bold text-slate-400 uppercase">Account:</span>
                       <span className="font-black text-slate-900 text-base select-all underline decoration-orange-600 decoration-1">8161747833</span>
                    </div>
                  </div>
                  <div className="bg-approve/5 p-2 rounded-lg border border-approve/10 text-approve text-[8px] font-black uppercase tracking-tight text-center font-bold">
                    SECURE YOUR SPOT: Send Receipt to WhatsApp Immediately
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center px-4 space-y-6">
         <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-600 text-[10px] font-black uppercase tracking-widest">
            <p>© {new Date().getFullYear()} Veleon Academy Technologies - Registration Closing Soon</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default PaymentPage;
