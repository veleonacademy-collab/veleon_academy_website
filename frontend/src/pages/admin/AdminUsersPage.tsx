import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUserRole, updateUserStatus, deleteUser, updateUserEmail, resendUserCredentials } from "../../api/admin";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { academyApi } from "../../api/academy";
import Modal from "../../components/Modal";
import { Book, Plus, Trash2, UserPlus, Mail, Key } from "lucide-react";

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: () => academyApi.getCourses({ all: true }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [selectedUserForEmail, setSelectedUserForEmail] = React.useState<{ id: number; name: string; email: string } | null>(null);
  const [newEmail, setNewEmail] = React.useState("");
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);

  const [userToDelete, setUserToDelete] = React.useState<{ id: number; name: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const [userToResend, setUserToResend] = React.useState<{ id: number; name: string; email: string } | null>(null);
  const [isResendModalOpen, setIsResendModalOpen] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      toast.success("User successfully deleted");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  });

  const emailMutation = useMutation({
    mutationFn: ({ userId, email }: { userId: number; email: string }) => updateUserEmail(userId, email),
    onSuccess: () => {
      toast.success("User email updated");
      setIsEmailModalOpen(false);
      setSelectedUserForEmail(null);
      setNewEmail("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update email");
    }
  });

  const resendCredentialsMutation = useMutation({
    mutationFn: (userId: number) => resendUserCredentials(userId),
    onSuccess: () => {
      toast.success("Credentials successfully reset and sent");
      setIsResendModalOpen(false);
      setUserToResend(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to resend credentials");
    }
  });

  const [selectedTutor, setSelectedTutor] = React.useState<{ id: number; name: string } | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);

  // States for manual enrollment
  const [selectedUserForEnroll, setSelectedUserForEnroll] = React.useState<{ id: number; name: string } | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [enrollCourseId, setEnrollCourseId] = React.useState<string>("");
  const [enrollCohort, setEnrollCohort] = React.useState<string>("");
  const [enrollPaymentPlan, setEnrollPaymentPlan] = React.useState<'one-time' | 'installment'>("one-time");
  const [enrollScholarshipType, setEnrollScholarshipType] = React.useState<"none" | "full" | "percent" | "custom">("none");
  const [enrollDiscountPercent, setEnrollDiscountPercent] = React.useState<number>(50);
  const [enrollCustomPrice, setEnrollCustomPrice] = React.useState<string>("");
  const [enrollAmountPaid, setEnrollAmountPaid] = React.useState<string>("");
  const [enrollNextPaymentDue, setEnrollNextPaymentDue] = React.useState<string>("");
  const [enrollInstallmentsTotal, setEnrollInstallmentsTotal] = React.useState<number>(3);

  const resetEnrollForm = () => {
    setSelectedUserForEnroll(null);
    setEnrollCourseId("");
    setEnrollCohort("");
    setEnrollPaymentPlan("one-time");
    setEnrollScholarshipType("none");
    setEnrollDiscountPercent(50);
    setEnrollCustomPrice("");
    setEnrollAmountPaid("");
    setEnrollNextPaymentDue("");
    setEnrollInstallmentsTotal(3);
  };

  const enrollUserMutation = useMutation({
    mutationFn: (payload: {
      userId: number;
      courseId: number;
      cohort?: string;
      paymentPlan: 'one-time' | 'installment';
      customPrice?: number;
      amountPaid?: number;
      nextPaymentDue?: string;
      installmentsTotal?: number;
    }) => academyApi.adminEnrollUser(payload),
    onSuccess: () => {
      toast.success("User successfully enrolled in course");
      setIsEnrollModalOpen(false);
      resetEnrollForm();
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to enroll user");
    }
  });

  const selectedCourseDetails = allCourses?.find((c: any) => c.id.toString() === enrollCourseId);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEnroll || !enrollCourseId) {
      toast.error("Please select a course");
      return;
    }

    const coursePrice = selectedCourseDetails ? Number(selectedCourseDetails.price) : 0;
    let finalCustomPrice = coursePrice;
    let finalAmountPaid = enrollAmountPaid !== "" ? Number(enrollAmountPaid) : coursePrice;

    if (enrollScholarshipType === "full") {
      finalCustomPrice = 0;
      finalAmountPaid = 0;
    } else if (enrollScholarshipType === "percent") {
      finalCustomPrice = coursePrice * (1 - enrollDiscountPercent / 100);
      if (enrollAmountPaid === "") {
        finalAmountPaid = enrollPaymentPlan === "installment" ? finalCustomPrice / enrollInstallmentsTotal : finalCustomPrice;
      }
    } else if (enrollScholarshipType === "custom") {
      finalCustomPrice = enrollCustomPrice !== "" ? Number(enrollCustomPrice) : coursePrice;
      if (enrollAmountPaid === "") {
        finalAmountPaid = enrollPaymentPlan === "installment" ? finalCustomPrice / enrollInstallmentsTotal : finalCustomPrice;
      }
    }

    enrollUserMutation.mutate({
      userId: selectedUserForEnroll.id,
      courseId: Number(enrollCourseId),
      cohort: enrollCohort || undefined,
      paymentPlan: enrollScholarshipType === "full" ? "one-time" : enrollPaymentPlan,
      customPrice: finalCustomPrice,
      amountPaid: finalAmountPaid,
      nextPaymentDue: enrollPaymentPlan === "installment" && enrollNextPaymentDue ? enrollNextPaymentDue : undefined,
      installmentsTotal: enrollPaymentPlan === "installment" ? enrollInstallmentsTotal : undefined,
    });
  };

  const { data: tutorCourses, refetch: refetchTutorCourses } = useQuery({
    queryKey: ["tutor-courses-admin", selectedTutor?.id],
    queryFn: () => selectedTutor ? academyApi.adminGetTutorCourses(selectedTutor.id) : Promise.resolve([]),
    enabled: !!selectedTutor,
  });

  const assignCourseMutation = useMutation({
    mutationFn: (courseId: number) => academyApi.adminAssignTutorCourse({ tutorId: selectedTutor!.id, courseId }),
    onSuccess: () => {
      toast.success("Course assigned to tutor");
      refetchTutorCourses();
    },
  });

  const removeCourseMutation = useMutation({
    mutationFn: (courseId: number) => academyApi.adminRemoveTutorCourse(selectedTutor!.id, courseId),
    onSuccess: () => {
      toast.success("Course removed from tutor");
      refetchTutorCourses();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) => updateUserStatus(userId, status),
    onSuccess: (_, variables) => {
      toast.success(`User ${variables.status === 'active' ? 'enabled' : 'disabled'}`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">View registered users and manage access levels.</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4 text-center">Assigned</th>
              <th className="px-6 py-4 text-center">Completed</th>
              <th className="px-6 py-4 text-center">Rate</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u: any) => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.status === 'disabled' ? 'opacity-60' : ''}`}>
                <td className="px-6 py-4 font-bold text-gray-900">
                   {u.firstName} {u.lastName}
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                   <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : 
                      u.role === "tutor" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                   }`}>
                      {u.role}
                   </span>
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-700">
                  {u.tasksAssigned || 0}
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-700">
                  {u.tasksCompleted || 0}
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-900">
                  {u.tasksAssigned > 0 
                    ? Math.round((u.tasksCompleted / u.tasksAssigned) * 100) + '%' 
                    : '0%'}
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                   }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {u.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                   <select
                     value={u.role}
                     onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                     className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs focus:outline-none"
                   >
                     <option value="user">User</option>
                     <option value="tutor">Tutor</option>
                     <option value="admin">Admin</option>
                   </select>

                   <button
                    onClick={() => statusMutation.mutate({ userId: u.id, status: u.status === 'active' ? 'disabled' : 'active' })}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                      u.status === 'active' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                   >
                      {u.status === 'active' ? 'DISABLE' : 'ENABLE'}
                   </button>
                   {u.role === 'tutor' && (
                      <button
                        onClick={() => {
                          setSelectedTutor({ id: u.id, name: `${u.firstName} ${u.lastName}` });
                          setIsCourseModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Manage Assigned Courses"
                      >
                        <Book className="h-4 w-4" />
                      </button>
                    )}
                     {u.role !== 'tutor' && (
                       <button
                         onClick={() => {
                           setSelectedUserForEnroll({ id: u.id, name: `${u.firstName} ${u.lastName}` });
                           setIsEnrollModalOpen(true);
                         }}
                         className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                         title="Enroll in Course"
                       >
                         <UserPlus className="h-4 w-4" />
                       </button>
                     )}

                    <button
                      onClick={() => {
                        setSelectedUserForEmail({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email });
                        setNewEmail(u.email);
                        setIsEmailModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Edit Email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        setUserToResend({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email });
                        setIsResendModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      title="Resend Credentials"
                    >
                      <Key className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        setUserToDelete({ id: u.id, name: `${u.firstName} ${u.lastName}` });
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {isLoading && <div className="p-8 text-center text-gray-400">Loading users...</div>}
      </div>

      {/* Mobile Optimized View */}
      <div className="md:hidden space-y-4">
         {isLoading && <div className="p-8 text-center text-gray-400">Loading users...</div>}
         {users?.map((u: any) => (
            <div key={u.id} className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 ${u.status === 'disabled' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
               <div className="flex items-start justify-between">
                  <div className="space-y-1">
                     <h3 className="font-bold text-gray-900">{u.firstName} {u.lastName}</h3>
                     <p className="text-sm text-gray-500">{u.email}</p>
                     <div className="flex gap-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          u.role === "admin" ? "bg-purple-100 text-purple-700" : 
                          u.role === "tutor" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {u.role}
                        </span>
                        {(u.role === 'tutor' || u.role === 'admin') && (
                           <div className="flex gap-2 text-[10px] font-bold text-gray-500 items-center">
                              <span>Tasks: {u.tasksCompleted}/{u.tasksAssigned}</span>
                              <span className="text-primary">
                                 ({u.tasksAssigned > 0 ? Math.round((u.tasksCompleted / u.tasksAssigned) * 100) : 0}%)
                              </span>
                           </div>
                        )}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {u.status}
                        </span>
                     </div>
                  </div>
                  <button
                    onClick={() => statusMutation.mutate({ userId: u.id, status: u.status === 'active' ? 'disabled' : 'active' })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      u.status === 'active' 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                   >
                      {u.status === 'active' ? 'DISABLE' : 'ENABLE'}
                   </button>
               </div>
                {u.role === 'tutor' && (
                  <button
                    onClick={() => {
                      setSelectedTutor({ id: u.id, name: `${u.firstName} ${u.lastName}` });
                      setIsCourseModalOpen(true);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-100 transition-colors"
                  >
                    <Book className="h-4 w-4" /> Manage Courses
                  </button>
                )}
                {u.role !== 'tutor' && (
                  <button
                    onClick={() => {
                      setSelectedUserForEnroll({ id: u.id, name: `${u.firstName} ${u.lastName}` });
                      setIsEnrollModalOpen(true);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" /> Enroll in Course
                  </button>
                )}
               <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Change Role</span>
                  <select
                    value={u.role}
                    onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value })}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
               </div>
               <div className="pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedUserForEmail({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email });
                      setNewEmail(u.email);
                      setIsEmailModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold uppercase hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </button>
                  <button
                    onClick={() => {
                      setUserToResend({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email });
                      setIsResendModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold uppercase hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Key className="h-3.5 w-3.5" /> Reset
                  </button>
                  <button
                    onClick={() => {
                      setUserToDelete({ id: u.id, name: `${u.firstName} ${u.lastName}` });
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
               </div>
            </div>
         ))}
      </div>

      {/* Tutor Courses Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={`Assigned Courses: ${selectedTutor?.name}`}
      >
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Currently Assigned</h3>
            <div className="space-y-2">
              {tutorCourses && tutorCourses.length > 0 ? (
                tutorCourses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900 text-sm">{course.title}</span>
                    <button
                      onClick={() => removeCourseMutation.mutate(course.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm italic">No courses assigned yet.</div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Assign New Course</h3>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
              {allCourses?.filter(c => !tutorCourses?.some((tc: any) => tc.id === c.id)).map((course: any) => (
                <button
                  key={course.id}
                  onClick={() => assignCourseMutation.mutate(course.id)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors text-left"
                >
                  <span className="font-medium text-slate-800 text-sm">{course.title}</span>
                  <Plus className="h-4 w-4 text-primary" />
                </button>
              ))}
              {allCourses?.filter(c => !tutorCourses?.some((tc: any) => tc.id === c.id)).length === 0 && (
                <div className="text-center py-2 text-slate-400 text-xs mt-2">All courses already assigned.</div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Enroll User in Course Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          resetEnrollForm();
        }}
        title={`Enroll Student in Course: ${selectedUserForEnroll?.name}`}
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-5 py-4">
          {/* Select Course */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Course</label>
            <select
              value={enrollCourseId}
              onChange={(e) => {
                setEnrollCourseId(e.target.value);
                setEnrollCustomPrice("");
                setEnrollAmountPaid("");
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">-- Select Course --</option>
              {allCourses?.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title} ({Number(course.price).toLocaleString()} NGN)
                </option>
              ))}
            </select>
          </div>

          {enrollCourseId && selectedCourseDetails && (
            <>
              {/* Cohort input */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cohort Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cohort A, Jan 2026"
                  value={enrollCohort}
                  onChange={(e) => setEnrollCohort(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Scholarship selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Scholarship / Price Option</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollScholarshipType("none");
                      setEnrollPaymentPlan("one-time");
                    }}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-colors ${
                      enrollScholarshipType === "none"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    No Scholarship (Full Price)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollScholarshipType("full");
                      setEnrollPaymentPlan("one-time");
                    }}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-colors ${
                      enrollScholarshipType === "full"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Full Scholarship (100% Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollScholarshipType("percent");
                    }}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-colors ${
                      enrollScholarshipType === "percent"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Percentage Scholarship
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEnrollScholarshipType("custom");
                    }}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-colors ${
                      enrollScholarshipType === "custom"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Custom Pricing
                  </button>
                </div>
              </div>

              {/* Conditionally show percentage discount options */}
              {enrollScholarshipType === "percent" && (
                <div className="space-y-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <label className="text-xs font-bold text-slate-600">Discount Percentage (%)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={enrollDiscountPercent}
                      onChange={(e) => setEnrollDiscountPercent(Number(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <div className="flex items-center text-xs text-slate-500">
                      Original: {Number(selectedCourseDetails.price).toLocaleString()} NGN → 
                      <span className="font-bold text-blue-600 ml-1">
                        {(Number(selectedCourseDetails.price) * (1 - enrollDiscountPercent / 100)).toLocaleString()} NGN
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditionally show custom price options */}
              {enrollScholarshipType === "custom" && (
                <div className="space-y-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <label className="text-xs font-bold text-slate-600">Custom Course Price (NGN)</label>
                  <input
                    type="number"
                    min="0"
                    value={enrollCustomPrice}
                    onChange={(e) => setEnrollCustomPrice(e.target.value)}
                    placeholder={Number(selectedCourseDetails.price).toString()}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Display Computed Price & Payment Plan / Paid Upfront configuration (for non-full scholarship) */}
              {enrollScholarshipType !== "full" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Plan</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEnrollPaymentPlan("one-time")}
                        className={`rounded-xl border p-2 text-center text-xs font-semibold transition-colors ${
                          enrollPaymentPlan === "one-time"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        One-Time Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollPaymentPlan("installment")}
                        className={`rounded-xl border p-2 text-center text-xs font-semibold transition-colors ${
                          enrollPaymentPlan === "installment"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Installment Plan
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Upfront Amount Paid (NGN)</label>
                      <input
                        type="number"
                        min="0"
                        value={enrollAmountPaid}
                        onChange={(e) => setEnrollAmountPaid(e.target.value)}
                        placeholder="Leave blank for full upfront payment"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        How much payment should be manually logged as already received right now.
                      </span>
                    </div>

                    {enrollPaymentPlan === "installment" && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Total Installments</label>
                          <select
                            value={enrollInstallmentsTotal}
                            onChange={(e) => setEnrollInstallmentsTotal(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none"
                          >
                            <option value={2}>2 Installments</option>
                            <option value={3}>3 Installments</option>
                            <option value={4}>4 Installments</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Next Installment Due</label>
                          <input
                            type="date"
                            value={enrollNextPaymentDue}
                            onChange={(e) => setEnrollNextPaymentDue(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Information Summary */}
              <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-emerald-800 space-y-1">
                <span className="font-bold uppercase tracking-wider block text-[10px]">Enrollment Summary:</span>
                <div>
                  Student: <span className="font-semibold text-slate-900">{selectedUserForEnroll?.name}</span>
                </div>
                <div>
                  Course: <span className="font-semibold text-slate-900">{selectedCourseDetails.title}</span>
                </div>
                <div>
                  Final Cost: <span className="font-semibold text-slate-900">
                    {enrollScholarshipType === "full"
                      ? "0 NGN (100% Scholarship)"
                      : `${(enrollScholarshipType === "percent"
                          ? Number(selectedCourseDetails.price) * (1 - enrollDiscountPercent / 100)
                          : enrollScholarshipType === "custom" && enrollCustomPrice !== ""
                          ? Number(enrollCustomPrice)
                          : Number(selectedCourseDetails.price)
                        ).toLocaleString()} NGN`}
                  </span>
                </div>
                <div>
                  Plan: <span className="font-semibold text-slate-900">{enrollScholarshipType === "full" ? "one-time" : enrollPaymentPlan}</span>
                </div>
                <div>
                  Paid Upfront: <span className="font-semibold text-slate-900">
                    {enrollScholarshipType === "full"
                      ? "0 NGN"
                      : `${(enrollAmountPaid !== ""
                          ? Number(enrollAmountPaid)
                          : enrollScholarshipType === "percent"
                          ? Number(selectedCourseDetails.price) * (1 - enrollDiscountPercent / 100)
                          : enrollScholarshipType === "custom" && enrollCustomPrice !== ""
                          ? Number(enrollCustomPrice)
                          : Number(selectedCourseDetails.price)
                        ).toLocaleString()} NGN`}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsEnrollModalOpen(false);
                resetEnrollForm();
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={enrollUserMutation.isPending || !enrollCourseId}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl"
            >
              {enrollUserMutation.isPending ? "Enrolling..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Email Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedUserForEmail(null);
          setNewEmail("");
        }}
        title={`Edit Student Email: ${selectedUserForEmail?.name}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedUserForEmail) {
              emailMutation.mutate({ userId: selectedUserForEmail.id, email: newEmail });
            }
          }}
          className="space-y-5 py-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsEmailModalOpen(false);
                setSelectedUserForEmail(null);
                setNewEmail("");
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={emailMutation.isPending}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl"
            >
              {emailMutation.isPending ? "Saving..." : "Save Email"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Resend Credentials Confirmation Modal */}
      <Modal
        isOpen={isResendModalOpen}
        onClose={() => {
          setIsResendModalOpen(false);
          setUserToResend(null);
        }}
        title="Reset & Resend Login Credentials"
      >
        <div className="space-y-5 py-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to reset the password for <strong className="text-slate-900">{userToResend?.name}</strong> and send new credentials to <strong className="text-slate-900">{userToResend?.email}</strong>?
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
            <strong>Note:</strong> This will generate a new random temporary password, update it in the database, and send the welcome onboarding email immediately. The student's old password will stop working.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsResendModalOpen(false);
                setUserToResend(null);
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (userToResend) {
                  resendCredentialsMutation.mutate(userToResend.id);
                }
              }}
              disabled={resendCredentialsMutation.isPending}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl"
            >
              {resendCredentialsMutation.isPending ? "Resending..." : "Yes, Reset & Resend"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Delete User Account"
      >
        <div className="space-y-5 py-4">
          <div className="text-sm text-slate-600 space-y-3">
            <p>
              Are you sure you want to permanently delete the account of <strong className="text-slate-900">{userToDelete?.name}</strong>?
            </p>
            <p className="font-semibold text-red-600">
              ⚠️ DANGER: This action is permanent and CANNOT be undone.
            </p>
            <p>
              This will completely erase:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>User login credentials and profile details.</li>
              <li>Associated customer records, measurements, and files.</li>
              <li>Course enrollments and learning progress.</li>
              <li>Assigned tasks, remarks, and system configurations.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (userToDelete) {
                  deleteMutation.mutate(userToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl"
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
