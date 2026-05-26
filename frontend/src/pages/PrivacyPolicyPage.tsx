import React from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, Lock, FileText, Mail, Globe, Calendar, CheckCircle2 } from "lucide-react";
import { APP_NAME, PRIVACY_EMAIL } from "../utils/constants";
import SEO from "../components/SEO";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 px-4">
      <SEO 
        title={`Privacy Policy | ${APP_NAME}`}
        description={`Learn how we handle, protect, and use your personal information at ${APP_NAME}.`}
      />

      {/* Header section with gradient glow */}
      <div className="relative text-center mb-12 sm:mb-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
          <Shield className="h-3.5 w-3.5" />
          Security & Trust
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
          PRIVACY POLICY
        </h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Last Updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Overview Intro Card */}
      <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-3xl p-6 sm:p-8 mb-10 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Welcome to {APP_NAME}
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          At <strong className="text-slate-900">{APP_NAME}</strong>, we respect your privacy and are committed to protecting your personal data. 
          This policy details how we look after your information when you enroll in our programs, browse our platform, or chat with our training advisors, 
          as well as your privacy rights and standard legal protections.
        </p>
      </div>

      {/* Detailed Section Grid */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <Eye className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">1. The Data We Collect</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                To process your enrollment and provide a personalized cohort experience, we may collect and store:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-xs">
                <li className="flex items-center gap-2 font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Identity: Name, Avatar
                </li>
                <li className="flex items-center gap-2 font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Contact: Email, WhatsApp Number
                </li>
                <li className="flex items-center gap-2 font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Technical: IP Address, Browser cookies
                </li>
                <li className="flex items-center gap-2 font-bold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  Usage: Lesson progress, feedback
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <Lock className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">2. How We Protect & Use Your Data</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                We only use your personal data when authorized by law. The primary use cases include:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <li>Setting up your student dashboard and delivering cohort curricula.</li>
                <li>Providing customized tutor feedback, capstone monitoring, and technical certificates.</li>
                <li>Securing payments securely via Paystack without storing credit card details on our servers.</li>
                <li>Updating you via WhatsApp or Email on class updates and resource changes.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">3. Cookies & Analytics</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                We use tracking tools to study student interaction and improve page speeds:
              </p>
              <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
                <li>
                  <strong className="text-slate-900">Google Analytics:</strong> Helps us trace page hits and navigation dropoffs to fix user experience bugs.
                </li>
                <li>
                  <strong className="text-slate-900">Microsoft Clarity:</strong> Helps us watch session replays and click heatmaps to improve user layout logic.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section Box */}
      <div className="mt-12 text-center bg-slate-900 text-white rounded-3xl p-8 space-y-4 shadow-xl">
        <Mail className="h-8 w-8 text-primary mx-auto animate-bounce" />
        <h3 className="text-lg font-black uppercase tracking-wider">Have Questions?</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          If you have any questions regarding this Privacy Policy, your personal data options, or want to request account deletion, contact our support desk directly:
        </p>
        <div className="pt-2">
          <a 
            href={`mailto:${PRIVACY_EMAIL}`} 
            className="inline-flex bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            Email Support: {PRIVACY_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
