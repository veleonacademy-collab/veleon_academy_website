import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { academyApi } from "../api/academy";
import { Link } from "react-router-dom";
import {
  Book, PlayCircle, FileText, Lock, Calendar,
  CreditCard, MessageSquare, TrendingUp, Clock,
  CheckCircle2, ChevronRight, ArrowRight, Loader2, X,
  WalletCards,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import { Input } from "../components/forms/Input";
import { formatCurrency } from "../utils/formatUtils";
import { useAuth } from "../state/AuthContext";

// ── helpers ────────────────────────────────────────────────────────────────────
function buildSchedule(enrollment: any) {
  const instTotal = Math.max(1, Number(enrollment.installmentsTotal) || Number(enrollment.installments_total) || 1);
  const instPaid  = Number(enrollment.installmentsPaid)  || Number(enrollment.installments_paid)  || 0;
  const coursePrice = Number(enrollment.course_price) || 0;
  const instAmt   = coursePrice / instTotal;
  const startDate = new Date(enrollment.createdAt || enrollment.created_at || Date.now());
  const daysEach  = Math.floor(90 / instTotal);

  return Array.from({ length: instTotal }, (_, i) => {
    const n = i + 1;
    const due = new Date(startDate);
    due.setDate(due.getDate() + daysEach * i);
    return { number: n, amount: instAmt, dueDate: due, paid: n <= instPaid, isNext: n === instPaid + 1 };
  });
}

// ── Installment Modal ──────────────────────────────────────────────────────────
interface PayModalProps {
  enrollment: any;
  onClose: () => void;
  onPay: (enrollment: any, amount: number) => void;
  paying: boolean;
}

const InstallmentModal: React.FC<PayModalProps> = ({ enrollment, onClose, onPay, paying }) => {
  const instTotal   = Math.max(1, Number(enrollment.installmentsTotal) || Number(enrollment.installments_total) || 1);
  const instPaid    = Number(enrollment.installmentsPaid)  || Number(enrollment.installments_paid)  || 0;
  const coursePrice = Number(enrollment.course_price) || 0;
  const totalPaid   = Number(enrollment.totalPaid) || 0;
  const remaining   = Math.max(0, coursePrice - totalPaid);
  const schedule    = buildSchedule(enrollment);
  const fullyPaid   = remaining <= 0 || instPaid >= instTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Payment Schedule</p>
            <h2 className="text-base font-black text-slate-900 leading-tight line-clamp-1">{enrollment.course_title}</h2>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors flex-shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total</p>
            <p className="text-sm font-black text-slate-900">{formatCurrency(coursePrice)}</p>
          </div>
          <div className="bg-approve/5 rounded-xl p-3 border border-approve/10">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Paid</p>
            <p className="text-sm font-black text-approve">{formatCurrency(totalPaid)}</p>
          </div>
          <div className={`rounded-xl p-3 border ${remaining > 0 ? "bg-secondary/5 border-secondary/10" : "bg-approve/5 border-approve/10"}`}>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Left</p>
            <p className={`text-sm font-black ${remaining > 0 ? "text-secondary" : "text-approve"}`}>{formatCurrency(remaining)}</p>
          </div>
        </div>

        {/* Schedule */}
        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Instalment Schedule</p>
          {schedule.map((inst) => (
            <div key={inst.number} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              inst.paid ? "bg-approve/5 border-approve/20" : inst.isNext ? "bg-secondary/5 border-secondary/30" : "bg-slate-50 border-slate-100"
            }`}>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                inst.paid ? "bg-approve text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {inst.paid ? <CheckCircle2 className="h-4 w-4" /> : inst.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-xs">Part {inst.number}</p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {inst.dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-black text-slate-900 text-xs">{formatCurrency(inst.amount)}</p>
                {inst.paid ? (
                  <p className="text-[9px] font-black text-approve uppercase tracking-widest">Paid</p>
                ) : inst.isNext ? (
                  <button
                    onClick={() => onPay(enrollment, inst.amount)}
                    disabled={paying}
                    className="mt-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-primary transition-colors disabled:opacity-60 flex items-center gap-1"
                  >
                    {paying ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <CreditCard className="h-2.5 w-2.5" />}
                    Pay
                  </button>
                ) : (
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-slate-100">
          {fullyPaid ? (
            <div className="flex items-center justify-center gap-2 bg-approve/10 text-approve py-3 rounded-xl font-black text-xs tracking-widest">
              <CheckCircle2 className="h-4 w-4" /> Course Fully Paid
            </div>
          ) : (
            <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs tracking-widest hover:bg-slate-800 transition-all">
              CLOSE ANALYSIS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: academyApi.getStudentDashboard,
  });

  const enrollments  = dashboardData?.enrollments  || [];
  const transactions = dashboardData?.transactions || [];
  const stats        = dashboardData?.stats;

  const [isComplainModalOpen, setIsComplainModalOpen] = React.useState(false);
  const [complainData, setComplainData] = React.useState({ subject: "", message: "", courseId: "" });
  const [paymentModal, setPaymentModal]   = React.useState<any | null>(null);
  const [payingEnrollmentId, setPayingEnrollmentId] = React.useState<number | null>(null);

  const complainMutation = useMutation({
    mutationFn: (data: any) => academyApi.createComplaint(data),
    onSuccess: () => {
      toast.success("Message sent. Support will respond soon.");
      setIsComplainModalOpen(false);
      setComplainData({ subject: "", message: "", courseId: "" });
    },
    onError: () => toast.error("Failed to send message"),
  });

  const handlePayInstallment = async (enrollment: any, exactAmount: number) => {
    const instTotal = Math.max(1, Number(enrollment.installmentsTotal) || Number(enrollment.installments_total) || 1);

    console.log("[PAY INSTALLMENT]", {
      courseId: enrollment.courseId,
      coursePrice: enrollment.course_price,
      totalPaid: enrollment.totalPaid,
      installmentsTotal: enrollment.installmentsTotal,
      installments_total: enrollment.installments_total,
      installmentsPaid: enrollment.installmentsPaid,
      installations_paid: enrollment.installments_paid,
      exactAmount,
    });

    if (!exactAmount || exactAmount <= 0) { toast.success("This course is fully paid!"); return; }

    setPayingEnrollmentId(enrollment.id);
    try {
      const result = await academyApi.payInstallment({ courseId: enrollment.courseId, installmentsTotal: instTotal, amount: exactAmount });
      if (result.url) { window.location.href = result.url; }
      else { toast.error("Could not initiate payment. Please try again."); }
    } catch { toast.error("Payment initiation failed."); }
    finally { setPayingEnrollmentId(null); }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Initialising Portal...</p>
    </div>
  );

  if (error) return <div className="text-center py-16 text-red-500 font-bold text-sm">Error loading dashboard. Please refresh.</div>;

  const hasEnrollments = enrollments.length > 0;

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student <span className="text-primary italic">Portal</span>
          </h1>
          <p className="text-slate-500 text-sm">Welcome back, {user?.firstName}!</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComplainModalOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Support
          </button>
          {/* <Link to="/" className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20">
            Courses <ArrowRight className="h-3.5 w-3.5" />
          </Link> */}
        </div>
      </div>

      {!hasEnrollments ? (
        /* ── Empty state ── */
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-md max-w-lg mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
            <Book className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Your Learning Journey Awaits!</h3>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed max-w-xs mx-auto">
            Enrol in a course to access your student dashboard, materials, and tutor.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-black text-xs tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/30">
            BROWSE COURSES <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Stats — 2×2 on mobile, 4-col on desktop ── */}
          <div className="bg-slate-900 rounded-2xl p-px shadow-lg shadow-slate-200/50">
            <div className="bg-white rounded-[calc(1rem-1px)] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-10">
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Paid</p>
                  <p className="text-lg font-black text-slate-900">{formatCurrency(stats?.totalPaid || 0)}</p>
                </div>
                <div className="h-8 w-px bg-slate-100 hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Remaining</p>
                  <p className="text-lg font-black text-secondary">{formatCurrency(stats?.totalRemaining || 0)}</p>
                </div>
                <div className="h-8 w-px bg-slate-100 hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Next Settlement</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-black text-slate-900">{formatCurrency(stats?.nextPaymentAmount || 0)}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {stats?.nextPaymentDate ? `Due ${new Date(stats.nextPaymentDate).toLocaleDateString("en-GB", {day:"2-digit", month:"short"})}` : "Paid"}
                    </span>
                  </div>
                </div>
              </div>
              {stats?.totalRemaining > 0 && (
                <button 
                  onClick={() => {
                    const nextEnr = enrollments.find((e: any) => e.totalPaid < e.course_price);
                    if (nextEnr) setPaymentModal(nextEnr);
                    else if (enrollments.length > 0) setPaymentModal(enrollments[0]);
                  }}
                  className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-lg shadow-primary/10"
                >
                  SETTLE BALANCE
                </button>
              )}
            </div>
          </div>

          {/* ── Course Cards ── */}
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" /> Active Enrollments
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment: any) => {
                const instTotal   = Math.max(1, Number(enrollment.installmentsTotal) || Number(enrollment.installments_total) || 1);
                const instPaid    = Number(enrollment.installmentsPaid) || Number(enrollment.installments_paid) || 0;
                const coursePrice = Number(enrollment.course_price) || 0;
                const totalPaid   = Number(enrollment.totalPaid) || 0;
                const remaining   = Math.max(0, coursePrice - totalPaid);
                const fullyPaid   = remaining <= 0 || instPaid >= instTotal;

                return (
                  <div key={enrollment.id} className="relative group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">

                    {/* Locked overlay */}
                    {enrollment.portalLocked && (
                      <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-5 shadow-2xl w-full max-w-[220px] text-center">
                          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-6 w-6" />
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mb-1">Portal Locked</h4>
                          <p className="text-xs text-slate-500 mb-4 leading-snug">Overdue instalment. Pay to regain access.</p>
                          <button
                            onClick={() => setPaymentModal(enrollment)}
                            className="w-full bg-primary text-white py-2.5 rounded-lg font-black text-[10px] tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                          >
                            <WalletCards className="h-3.5 w-3.5" /> PAY NOW
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div className="aspect-[16/9] relative overflow-hidden flex-shrink-0">
                      <img
                        src={enrollment.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"}
                        alt={enrollment.course_title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow ${
                        fullyPaid ? "bg-approve text-white" : "bg-secondary text-white"
                      }`}>
                        {fullyPaid ? "✓ Paid" : `${instPaid}/${instTotal} paid`}
                      </div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow">
                        {enrollment.paymentPlan}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col">
                      <h3 className="text-sm font-black text-slate-900 line-clamp-1">{enrollment.course_title}</h3>

                      {/* Pay / View button */}
                      <button
                        onClick={() => setPaymentModal(enrollment)}
                        className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                          fullyPaid
                            ? "bg-approve/5 border-approve/20 text-approve hover:bg-approve/10"
                            : "bg-secondary text-white border-secondary hover:opacity-90 shadow-md shadow-secondary/20"
                        }`}
                      >
                        <WalletCards className="h-3.5 w-3.5" />
                        {fullyPaid ? "Payment History" : `Instalments — ${instPaid}/${instTotal}`}
                      </button>

                      {/* Nav buttons */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* <Link to={`/academy/course/${enrollment.courseId}`}
                          className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-primary hover:text-white transition-all font-black text-[8px] uppercase tracking-widest text-center">
                          <PlayCircle className="h-3.5 w-3.5" /> Home
                        </Link> */}
                        <Link to={`/academy/course/${enrollment.courseId}#assignments`}
                          className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-secondary hover:text-white transition-all font-black text-[8px] uppercase  text-center">
                          <FileText className="h-3.5 w-3.5" /> Class and Tasks
                        </Link>
                        {enrollment.timetable_url ? (
                          <a href={enrollment.timetable_url.includes("cloudinary.com") && enrollment.timetable_url.includes("/upload/")
                              ? enrollment.timetable_url.replace("/upload/", "/upload/fl_attachment/")
                              : enrollment.timetable_url}
                            target="_blank" rel="noreferrer" download
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all font-black text-[8px] uppercase tracking-widest text-center">
                            <Calendar className="h-3.5 w-3.5" /> TimeTable
                          </a>
                        ) : (
                          <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50/50 text-slate-300 font-black text-[8px] uppercase tracking-widest text-center">
                            <Clock className="h-3.5 w-3.5" /> Soon
                          </div>
                        )}
                      </div>

                      {/* Syllabus progress */}
                      {enrollment.total_topics > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span>Syllabus</span>
                            <span className="text-primary">{Math.round((enrollment.completed_topics / enrollment.total_topics) * 100)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-700"
                              style={{ width: `${(enrollment.completed_topics / enrollment.total_topics) * 100}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Payment History ── */}
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Statement
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Description</th>
                        <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Amount</th>
                        <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                        <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/40 transition-colors group">
                          <td className="px-5 py-3.5">
                            <div className="font-black text-slate-900 text-xs group-hover:text-primary transition-colors">{t.course_title || "Academy Tuition"}</div>
                            <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{t.type} · {t.provider}</div>
                          </td>
                          <td className="px-5 py-3.5 font-black text-slate-900 text-sm">{formatCurrency(t.amount)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              t.status === "succeeded" ? "bg-approve/10 text-approve" : "bg-secondary/10 text-secondary"
                            }`}>
                              {t.status === "succeeded" && <CheckCircle2 className="h-2.5 w-2.5" />}
                              {t.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{new Date(t.created_at).toLocaleDateString("en-GB", {day:"2-digit",month:"short",year:"2-digit"})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <CreditCard className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="font-bold text-xs uppercase tracking-widest">No transactions yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Modals ── */}
      {paymentModal && (
        <InstallmentModal
          enrollment={paymentModal}
          onClose={() => setPaymentModal(null)}
          onPay={(enr, amt) => handlePayInstallment(enr, amt)}
          paying={payingEnrollmentId === paymentModal.id}
        />
      )}

      <Modal isOpen={isComplainModalOpen} onClose={() => setIsComplainModalOpen(false)} title="Support & Inquiry">
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course (optional)</label>
            <select
              className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
              value={complainData.courseId}
              onChange={(e) => setComplainData({ ...complainData, courseId: e.target.value })}
            >
              <option value="">General Support</option>
              {enrollments?.map((e: any) => <option key={e.courseId} value={e.courseId}>{e.course_title}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
            <Input placeholder="Brief summary" value={complainData.subject} onChange={(e) => setComplainData({ ...complainData, subject: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[100px]"
              placeholder="Describe your issue in detail..."
              value={complainData.message}
              onChange={(e) => setComplainData({ ...complainData, message: e.target.value })}
            />
          </div>
          <button
            onClick={() => complainMutation.mutate({
              courseId: complainData.courseId ? parseInt(complainData.courseId) : undefined,
              subject: complainData.subject,
              message: complainData.message,
            })}
            disabled={complainMutation.isPending || !complainData.subject || !complainData.message}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-black text-xs tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {complainMutation.isPending ? "SENDING..." : "SEND TO SUPPORT"}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default StudentDashboardPage;
