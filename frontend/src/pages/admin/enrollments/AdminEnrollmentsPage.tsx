import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../../../api/academy";
import { BackButton } from "../../../components/ui/BackButton";
import { formatCurrency, formatDate } from "../../../utils/formatUtils";
import toast from "react-hot-toast";
import { Calendar, Filter, ArrowUpDown, AlertCircle, CheckCircle2 } from "lucide-react";

const AdminEnrollmentsPage: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "due">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: academyApi.getCourses,
  });

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["admin-students", selectedCourseId],
    queryFn: () => academyApi.getAdminStudents(selectedCourseId),
  });

  const { data: tutors } = useQuery({
    queryKey: ["admin-tutors"],
    queryFn: () => academyApi.getAdminTutors(),
  });

  const assignMutation = useMutation({
    mutationFn: (data: { enrollmentId: number; tutorId: number }) => academyApi.assignTutor(data),
    onSuccess: () => {
      toast.success("Tutor assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-students"] });
    },
    onError: () => toast.error("Failed to assign tutor"),
  });

  const students = studentsData || [];

  const filteredAndSortedStudents = students
    .filter((s: any) => {
      const planMatch = planFilter === "all" || s.payment_plan === planFilter;
      
      let dueMatch = true;
      if (dueFilter !== "all" && s.payment_plan === 'installment') {
        const dueDate = s.next_payment_due ? new Date(s.next_payment_due) : null;
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        if (dueFilter === "due") {
          dueMatch = dueDate !== null && dueDate <= now && !s.portal_locked;
        } else if (dueFilter === "close") {
          dueMatch = dueDate !== null && dueDate > now && dueDate <= nextWeek;
        } else if (dueFilter === "locked") {
          dueMatch = s.portal_locked;
        }
      } else if (dueFilter !== "all" && s.payment_plan === 'one-time') {
        dueMatch = false; // Only installments have due dates
      }

      return planMatch && dueMatch;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "date") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else {
        const dueA = a.next_payment_due ? new Date(a.next_payment_due).getTime() : Infinity;
        const dueB = b.next_payment_due ? new Date(b.next_payment_due).getTime() : Infinity;
        return sortOrder === "desc" ? dueB - dueA : dueA - dueB;
      }
    });

  const toggleSort = (key: "date" | "due") => {
     if (sortBy === key) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
     } else {
        setSortBy(key);
        setSortOrder("desc");
     }
  };

  const getDueStatus = (s: any) => {
    if (s.payment_plan === 'one-time') return null;
    if (s.portal_locked) return { label: "Locked", color: "text-secondary bg-secondary/10", icon: AlertCircle };
    if (!s.next_payment_due) return { label: "Fully Paid", color: "text-approve bg-approve/10", icon: CheckCircle2 };
    
    const dueDate = new Date(s.next_payment_due);
    const now = new Date();
    if (dueDate <= now) return { label: "Overdue", color: "text-secondary bg-secondary/10", icon: AlertCircle };
    
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 7) return { label: `Due in ${diffDays}d`, color: "text-amber-600 bg-amber-50", icon: Calendar };
    
    return { label: `Next: ${formatDate(s.next_payment_due)}`, color: "text-gray-500 bg-gray-50", icon: Calendar };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-sm text-gray-500">View enrollments and assign tutors.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Filter Course</label>
            <select 
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Courses</option>
              {courses?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Plan</label>
            <select 
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="all">Any Plan</option>
              <option value="one-time">One-Time</option>
              <option value="installment">Installment</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Status</label>
            <select 
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white"
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
            >
              <option value="all">Any Status</option>
              <option value="due">Overdue</option>
              <option value="close">Due Soon (7 days)</option>
              <option value="locked">Locked Portals</option>
            </select>
          </div>

          <div className="flex items-end">
             <button 
                onClick={() => toggleSort("date")}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold hover:bg-gray-50 transition-all bg-white"
             >
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                Sort by {sortBy === 'date' ? 'Enrollment' : 'Due Date'} ({sortOrder})
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Plan & Status</th>
                <th className="px-6 py-4">Portal</th>
                <th className="px-6 py-4">Tutor</th>
                <th className="px-6 py-4 text-right">Total Paid</th>
                <th className="px-6 py-4 text-right">Assign Tutor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading students...</td>
                </tr>
              )}
              {filteredAndSortedStudents.map((s: any) => {
                const dueStatus = getDueStatus(s);
                return (
                  <tr key={s.enrollment_id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{s.student_first_name} {s.student_last_name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Joined: {formatDate(s.created_at)}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-gray-900 font-medium">{s.course_title}</div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                             s.payment_plan === 'installment' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {s.payment_plan}
                          </span>
                          {dueStatus && (
                             <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${dueStatus.color}`}>
                                <dueStatus.icon className="h-3 w-3" />
                                {dueStatus.label}
                             </span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          s.status === 'enrolled' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                       }`}>
                          {s.status}
                       </span>
                    </td>
                      <td className="px-6 py-5 font-bold text-sm">
                        {s.tutor_id ? (
                          <div className="text-primary italic">@{s.tutor_first_name}</div>
                        ) : (
                          <div className="text-gray-300">Not assigned</div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-gray-900">
                        {formatCurrency(s.total_paid || 0)}
                      </td>
                      <td className="px-6 py-5 text-right">
                      <select
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-widest focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white text-gray-700 disabled:opacity-50"
                        value={s.tutor_id || ""}
                        onChange={(e) => assignMutation.mutate({ enrollmentId: s.enrollment_id, tutorId: parseInt(e.target.value) })}
                        disabled={assignMutation.isPending}
                      >
                        <option value="">Assign Tutor</option>
                        {tutors?.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedStudents.length === 0 && !isLoading && (
                 <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No enrollments found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
