import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { academyApi } from "../../../api/academy";
import { BackButton } from "../../../components/ui/BackButton";

const AdminTutorsPage: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: academyApi.getCourses,
  });

  const { data: tutors, isLoading } = useQuery({
    queryKey: ["admin-tutors", selectedCourseId],
    queryFn: () => academyApi.getAdminTutors(selectedCourseId),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Tutors</h1>
            <p className="text-sm text-gray-500">View and manage faculty members.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Filter by Course:</label>
            <select 
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">All Courses</option>
              {courses?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <div className="col-span-full py-10 text-center text-gray-400">Loading tutors...</div>}
        {tutors?.map((t: any) => (
          <div key={t.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-2xl">
                 {t.first_name?.[0]}{t.last_name?.[0]}
             </div>
             <div>
                <h3 className="font-bold text-gray-900 text-lg">{t.first_name} {t.last_name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{t.email}</p>
                <Link 
                   to={`/admin/tutor/${t.id}`}
                   className="mt-2 inline-block text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                 >
                   View Students →
                 </Link>
             </div>
          </div>
        ))}
         {tutors?.length === 0 && !isLoading && (
            <div className="col-span-full py-10 text-center text-gray-400">No tutors found. Ensure users with 'tutor' role exist.</div>
         )}
      </div>
    </div>
  );
};

export default AdminTutorsPage;
