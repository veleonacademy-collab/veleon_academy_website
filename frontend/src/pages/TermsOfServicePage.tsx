import React from "react";
import { Scale, BookOpen, UserCheck, ShieldAlert, FileCheck, Mail, Calendar } from "lucide-react";
import { APP_NAME, SUPPORT_EMAIL } from "../utils/constants";
import SEO from "../components/SEO";

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-16 px-4">
      <SEO 
        title={`Terms of Service | ${APP_NAME}`}
        description={`Read the standard enrollment guidelines and terms of service for ${APP_NAME}.`}
      />

      {/* Header section with gradient glow */}
      <div className="relative text-center mb-12 sm:mb-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
          <Scale className="h-3.5 w-3.5" />
          Enrollment Guidelines
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
          TERMS OF SERVICE
        </h1>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Last Updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Overview Intro Card */}
      <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-3xl p-6 sm:p-8 mb-10 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" /> Agreement to Terms
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          By creating an account, processing payment, or attending classes on the <strong className="text-slate-900">{APP_NAME}</strong> platform, 
          you agree to be bound by these Terms of Service. If you disagree with any part of these guidelines, you may not access or enroll in our training cohorts.
        </p>
      </div>

      {/* Detailed Section Grid */}
      <div className="space-y-6">
        {/* Section 1 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">1. User Registration & Cohort Access</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                When you create a student profile:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <li>You must provide accurate, complete information, including a functional WhatsApp number for direct coordinator outreach.</li>
                <li>Your student dashboard credentials are strictly personal. Sharing portal logins or course files with external parties will lead to immediate cancellation of your cohort access without a refund.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">2. Intellectual Property Rights</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                All training material, database models, dashboards, slides, pre-recorded videos, and monetization scripts provided in the courses:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <li>Are protected by copyright and intellectual property laws of Nigeria.</li>
                <li>Are licensed strictly for individual study and career application. You may not resell, repackage, or distribute Veleon Academy curriculum assets.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">3. Refund Policy & The Double Guarantee</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Our refund parameters are strictly governed by our bold dual framework:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <li>
                  <strong className="text-slate-900">14-Day Trial:</strong> If you are not satisfied with the course materials, you can request a standard refund within 14 days of cohort commencement.
                </li>
                <li>
                  <strong className="text-slate-900">Action-Based Double Refund:</strong> If you complete all the lessons, do the assignments, construct the capstone database, and apply the outreach templates but fail to see results, you must submit proof of coursework to receive a 100% refund plus keep all files.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:border-slate-300">
          <div className="flex gap-4 items-start">
            <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-orange-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">4. Limitation of Liability</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Veleon Academy and its instructors (including Coach Omidoyin Ayodeji) provide curriculum templates, datasets, and tutoring to maximize career prospects. 
                However, individual career results, job offers, or client acquisition numbers depend on individual efforts, work ethic, and external market factors. 
                We do not guarantee a fixed income level.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Box */}
      <div className="mt-12 text-center bg-slate-900 text-white rounded-3xl p-8 space-y-4 shadow-xl">
        <Mail className="h-8 w-8 text-primary mx-auto animate-bounce" />
        <h3 className="text-lg font-black uppercase tracking-wider">Need Clarity?</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          If you have any questions or require support regarding these terms, enrollment options, or billing schedules, please send a message to:
        </p>
        <div className="pt-2">
          <a 
            href={`mailto:${SUPPORT_EMAIL}`} 
            className="inline-flex bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-primary/20"
          >
            Email Support: {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
