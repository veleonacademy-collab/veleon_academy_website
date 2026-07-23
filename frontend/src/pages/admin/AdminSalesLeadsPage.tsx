import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../../api/academy";
import { BackButton } from "../../components/ui/BackButton";
import { formatCurrency, formatDate } from "../../utils/formatUtils";
import toast from "react-hot-toast";
import { Users, UserPlus, CheckCircle2, AlertCircle, Calendar, ArrowLeft, Send } from "lucide-react";
import Modal from "../../components/Modal";
import { Input } from "../../components/forms/Input";

const AdminSalesLeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Form State inside Modal
  const [courseId, setCourseId] = useState<number | "">("");
  const [cohort, setCohort] = useState("Cohort 3");
  const [paymentPlan, setPaymentPlan] = useState<"one-time" | "installment">("one-time");
  const [customPrice, setCustomPrice] = useState<number>(25000);
  const [amountPaid, setAmountPaid] = useState<number>(25000);
  const [installmentsTotal, setInstallmentsTotal] = useState<number>(3);
  const [nextPaymentDue, setNextPaymentDue] = useState("");

  const { data: courses } = useQuery({
    queryKey: ["courses", { all: true }],
    queryFn: () => academyApi.getCourses({ all: true }),
  });

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ["admin-sales-leads"],
    queryFn: academyApi.getSalesLeads,
  });

  const onboardMutation = useMutation({
    mutationFn: (payload: {
      leadId: number;
      data: {
        courseId: number;
        paymentPlan: "one-time" | "installment";
        customPrice: number;
        amountPaid: number;
        installmentsTotal?: number;
        cohort?: string;
        nextPaymentDue?: string;
      };
    }) => academyApi.onboardSalesLead(payload.leadId, payload.data),
    onSuccess: (data) => {
      toast.success(data.message || "Student onboarded successfully! 🎉");
      setSelectedLead(null);
      queryClient.invalidateQueries({ queryKey: ["admin-sales-leads"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to onboard student");
    },
  });

  const handleOpenOnboardModal = (lead: any) => {
    setSelectedLead(lead);

    // Try to auto-select correct Data Analysis sales track in the list
    const isExcelOnly = lead.selected_track === "excel_only";
    const targetTitle = isExcelOnly ? "data analysis - excel only" : "data analysis - full stack";
    const matchedCourse = courses?.find(c => c.title.toLowerCase().includes(targetTitle));
    setCourseId(matchedCourse?.id || "");

    // Default Cohort
    setCohort("Cohort 3");

    // Pricing details pre-filling based on sales funnel selections
    const isInst = lead.payment_term === "installment";
    const track = lead.selected_track; // 'full' or 'excel_only'
    
    const price = track === "full" ? 25000 : 15000;
    const paid = isInst ? 10000 : price;

    setPaymentPlan(isInst ? "installment" : "one-time");
    setCustomPrice(price);
    setAmountPaid(paid);
    setInstallmentsTotal(track === "full" ? 2 : 2); // Split of total balance

    // Next installment due date (pre-fills to 30 days from now)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const yyyy = thirtyDaysFromNow.getFullYear();
    const mm = String(thirtyDaysFromNow.getMonth() + 1).padStart(2, "0");
    const dd = String(thirtyDaysFromNow.getDate()).padStart(2, "0");
    setNextPaymentDue(`${yyyy}-${mm}-${dd}`);
  };

  const handlePaymentPlanChange = (val: "one-time" | "installment") => {
    setPaymentPlan(val);
    if (val === "one-time") {
      setAmountPaid(customPrice);
    } else {
      setAmountPaid(10000); // Standard deposit
    }
  };

  const handleCustomPriceChange = (val: number) => {
    setCustomPrice(val);
    if (paymentPlan === "one-time") {
      setAmountPaid(val);
    }
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    if (!courseId) return toast.error("Please select a standard portal course");

    const payload = {
      courseId: Number(courseId),
      paymentPlan,
      customPrice,
      amountPaid,
      cohort,
      installmentsTotal: paymentPlan === "installment" ? installmentsTotal : undefined,
      nextPaymentDue: paymentPlan === "installment" ? new Date(nextPaymentDue).toISOString() : undefined,
    };

    onboardMutation.mutate({
      leadId: selectedLead.id,
      data: payload,
    });
  };

  const remainingBalance = Math.max(0, customPrice - amountPaid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-primary" />
              Sales Funnel Leads
            </h1>
            <p className="text-sm text-gray-500">Manual onboarding portal for leads captured from the sales landing page.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Source / Ref</th>
                <th className="px-6 py-4">Selected Track</th>
                <th className="px-6 py-4">Payment Plan</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">Loading sales leads...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-red-500 font-bold">Error loading sales leads.</td>
                </tr>
              )}
              {leads?.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-900">{lead.name}</div>
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-600">{lead.email}</td>
                  <td className="px-6 py-5 font-mono text-gray-500">{lead.whatsapp}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lead.referral_code ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-gray-100 text-gray-600"
                    }`}>
                      {lead.referral_code ? `Ref: ${lead.referral_code}` : "Direct"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lead.selected_track === "full" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {lead.selected_track === "full" ? "Full Stack" : "Excel Only"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lead.payment_term === "installment" ? "bg-indigo-50 text-indigo-600" : "bg-green-50 text-green-600"
                    }`}>
                      {lead.payment_term}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-bold">{formatDate(lead.created_at)}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      lead.is_onboarded ? "bg-approve/10 text-approve" : "bg-amber-100 text-amber-700"
                    }`}>
                      {lead.is_onboarded ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {lead.is_onboarded ? "Onboarded" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleOpenOnboardModal(lead)}
                      disabled={lead.is_onboarded}
                      className="px-4 py-2 bg-slate-900 hover:bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors inline-flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      Onboard
                    </button>
                  </td>
                </tr>
              ))}
              {leads?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400 font-bold">No sales leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Dialog Modal */}
      {selectedLead && (
        <Modal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={`Onboard Student: ${selectedLead.name}`}
        >
          <form onSubmit={handleOnboardSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Email</label>
                <Input value={selectedLead.email} disabled />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp Phone</label>
                <Input value={selectedLead.whatsapp} disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Portal Course</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                >
                  <option value="">-- Choose Course --</option>
                  {courses?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign Cohort / Group</label>
                <Input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="e.g. Cohort 2" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Tuition Pricing Adjustments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Term</label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => handlePaymentPlanChange(e.target.value as "one-time" | "installment")}
                    className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                  >
                    <option value="one-time">One-Time (Full)</option>
                    <option value="installment">Installment (Split)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Course Price (NGN)</label>
                  <Input
                    type="number"
                    value={customPrice}
                    onChange={(e) => handleCustomPriceChange(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Paid So Far (NGN)</label>
                  <Input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remaining Balance</label>
                  <div className="h-11 flex items-center px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-secondary">
                    {formatCurrency(remainingBalance)}
                  </div>
                </div>
              </div>

              {paymentPlan === "installment" && (
                <div className="grid grid-cols-2 gap-4 bg-indigo-50/40 p-4 border border-indigo-50 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Total Installments</label>
                    <Input
                      type="number"
                      value={installmentsTotal}
                      onChange={(e) => setInstallmentsTotal(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Next Payment Due Date</label>
                    <input
                      type="date"
                      required
                      value={nextPaymentDue}
                      onChange={(e) => setNextPaymentDue(e.target.value)}
                      className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={onboardMutation.isPending}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-primary text-white text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-1.5"
              >
                {onboardMutation.isPending ? "Onboarding..." : "Complete Onboarding"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminSalesLeadsPage;
