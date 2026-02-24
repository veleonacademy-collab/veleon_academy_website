import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academyApi } from "../../api/academy";
import { BackButton } from "../../components/ui/BackButton";
import { formatDate } from "../../utils/formatUtils";
import { MessageSquare, AlertCircle, User, BookOpen } from "lucide-react";

const AdminAcademySupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"complaints" | "remarks">("complaints");

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: () => academyApi.getAdminComplaints(),
  });

  const { data: remarks, isLoading: remarksLoading } = useQuery({
    queryKey: ["admin-remarks"],
    queryFn: () => academyApi.getAdminRemarks(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academy Support & Remarks</h1>
          <p className="text-sm text-gray-500">Monitor student complaints and tutor feedback.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
         <button 
            onClick={() => setActiveTab("complaints")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'complaints' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
         >
            Student Complaints
         </button>
         <button 
            onClick={() => setActiveTab("remarks")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'remarks' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
         >
            Tutor Remarks
         </button>
      </div>

      <div className="space-y-4">
        {activeTab === "complaints" ? (
          <div className="grid gap-4">
            {complaintsLoading && <p className="text-center py-10 text-gray-400">Loading complaints...</p>}
            {complaints?.map((c: any) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{c.subject}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        From: {c.first_name} {c.last_name} • {c.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed italic border-l-4 border-secondary/30">
                  "{c.message}"
                </div>
                {c.course_title && (
                   <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                      <BookOpen className="h-3 w-3" />
                      Related Course: {c.course_title}
                   </div>
                )}
              </div>
            ))}
            {complaints?.length === 0 && !complaintsLoading && <p className="text-center py-10 text-gray-400">No complaints found.</p>}
          </div>
        ) : (
          <div className="grid gap-4">
            {remarksLoading && <p className="text-center py-10 text-gray-400">Loading remarks...</p>}
            {remarks?.map((r: any) => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Remark on Student</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         By Tutor: {r.tutor_first_name} {r.tutor_last_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                           <User className="h-4 w-4" /> {r.student_first_name} {r.student_last_name}
                        </div>
                        <div className="flex items-center gap-2 font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
                           <BookOpen className="h-4 w-4" /> {r.course_title}
                        </div>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border-l-4 border-primary/30">
                      {r.remark_text}
                    </div>
                </div>
              </div>
            ))}
            {remarks?.length === 0 && !remarksLoading && <p className="text-center py-10 text-gray-400">No remarks found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAcademySupportPage;
