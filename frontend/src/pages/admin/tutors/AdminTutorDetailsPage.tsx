import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { academyApi } from "../../../api/academy";
import { BackButton } from "../../../components/ui/BackButton";

const AdminTutorDetailsPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tutor-details", tutorId],
    queryFn: () => academyApi.getAdminTutorDetails(parseInt(tutorId!)),
    enabled: !!tutorId,
  });

  if (isLoading) return <div className="p-10 text-center">Loading tutor details...</div>;
  if (!data) return <div className="p-10 text-center">Tutor not found.</div>;

  const { tutor, students } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex items-center gap-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
           <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-4xl">
               {tutor.first_name?.[0]}{tutor.last_name?.[0]}
           </div>
           <div>
              <h1 className="text-3xl font-bold text-gray-900">{tutor.first_name} {tutor.last_name}</h1>
              <p className="text-gray-500 font-medium">{tutor.email}</p>
              <div className="mt-2 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Tutor
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Assigned Students</h2>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              {students.length} Students
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-8 py-4">Student</th>
                <th className="px-8 py-4">Course</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {students.map((s: any) => (
                    <tr key={s.enrollment_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5">
                            <div className="font-bold text-gray-900">{s.first_name} {s.last_name}</div>
                            <div className="text-xs text-gray-400">{s.email}</div>
                        </td>
                        <td className="px-8 py-5 text-gray-600 font-medium">
                            {s.course_title}
                        </td>
                        <td className="px-8 py-5 text-gray-600">
                            <span className="capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[10px] font-bold">
                                {s.status}
                            </span>
                        </td>
                    </tr>
                ))}
                {students.length === 0 && (
                    <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400">
                            No students assigned to this tutor yet.
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTutorDetailsPage;
