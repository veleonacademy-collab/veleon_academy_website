import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUserRole, updateUserStatus } from "../../api/admin";
import { BackButton } from "../../components/ui/BackButton";
import toast from "react-hot-toast";
import { academyApi } from "../../api/academy";
import Modal from "../../components/Modal";
import { Book, Plus, Trash2 } from "lucide-react";

const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [selectedTutor, setSelectedTutor] = React.useState<{ id: number; name: string } | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);

  const { data: tutorCourses, refetch: refetchTutorCourses } = useQuery({
    queryKey: ["tutor-courses-admin", selectedTutor?.id],
    queryFn: () => selectedTutor ? academyApi.adminGetTutorCourses(selectedTutor.id) : Promise.resolve([]),
    enabled: !!selectedTutor,
  });

  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: academyApi.getCourses,
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
        <table className="w-full text-left text-sm">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default AdminUsersPage;
