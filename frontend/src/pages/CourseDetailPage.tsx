import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { academyApi } from "../api/academy";
import { PlayCircle, FileText, ArrowLeft, Lock, Calendar, Book } from "lucide-react";

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const id = parseInt(courseId || "0");

  const { data: details, isLoading } = useQuery({
    queryKey: ["course-details", id],
    queryFn: () => academyApi.getCourseDetails(id),
    enabled: !!id,
  });

  const [activeTab, setActiveTab] = useState<"recordings" | "assignments" | "curriculum">("recordings");
  
  const course = details?.course;
  const enrollment = details?.enrollment;
  const recordings = details?.recordings || [];
  const assignments = details?.assignments || [];
  const curriculum = details?.curriculum || [];

  if (isLoading) return <div className="py-20 text-center font-bold text-slate-400">Loading course...</div>;

  if (!details && !isLoading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="text-xl font-bold">Course access denied or not found.</p>
        <Link to="/student/dashboard" className="text-primary hover:underline text-sm mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back */}
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <img
          src={
            course?.thumbnail_url ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
          }
          alt={course?.title}
          className="w-full md:w-64 h-40 object-cover rounded-2xl shadow-lg"
        />
        <div className="flex-1 flex flex-col md:flex-row justify-between items-start gap-6 w-full">
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {course?.title}
            </h1>
            <p className="text-slate-500 max-w-xl">{course?.description}</p>
            {enrollment?.paymentPlan && (
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                {enrollment.paymentPlan} Plan
              </span>
            )}
          </div>
          {course?.timetable_url && (() => {
            // For Cloudinary URLs, inject fl_attachment so browser downloads properly
            const rawUrl = course.timetable_url;
            const downloadUrl = rawUrl.includes("cloudinary.com") && rawUrl.includes("/upload/")
              ? rawUrl.replace("/upload/", "/upload/fl_attachment/")
              : rawUrl;
            return (
              <a 
                href={downloadUrl} 
                target="_blank" 
                rel="noreferrer"
                download
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-200"
              >
                <FileText className="h-4 w-4" /> View Timetable
              </a>
            );
          })()}
        </div>
      </div>

      <div className="border-b border-slate-200 flex flex-wrap gap-8">
        <button
          onClick={() => setActiveTab("recordings")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "recordings"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <PlayCircle className="h-4 w-4" /> Recordings
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "curriculum"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Book className="h-4 w-4" /> Curriculum
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "assignments"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="h-4 w-4" /> Assignments
        </button>
      </div>

      {/* Content */}
      {enrollment?.portalLocked ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Portal Locked</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Your access to this course content is restricted due to an overdue
            installment payment.
          </p>
          {enrollment.nextPaymentDue && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-500">
              <Calendar className="h-4 w-4" />
              Payment due:{" "}
              {new Date(enrollment.nextPaymentDue).toLocaleDateString()}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
           {activeTab === "recordings" && (
              <div className="grid gap-4">
                  {recordings.length > 0 ? (
                      recordings.map((r: any) => (
                          <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary transition-all">
                              <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                      <PlayCircle className="h-5 w-5" />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900">{r.title}</h4>
                                      <p className="text-xs text-slate-400">Published on {new Date(r.recording_date).toLocaleDateString()}</p>
                                  </div>
                              </div>
                              <a href={r.video_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                  Watch Now →
                              </a>
                          </div>
                      ))
                  ) : (
                      <div className="py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                          <p className="text-slate-400 font-medium">Class recordings will appear here as your tutor uploads them.</p>
                      </div>
                  )}
              </div>
           )}

           {activeTab === "curriculum" && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                 <div className="divide-y divide-slate-100">
                    {curriculum.length > 0 ? (
                        curriculum.map((item: any) => (
                            <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors group">
                                <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    item.is_completed 
                                        ? "bg-approve text-white" 
                                        : "bg-slate-100 text-slate-300"
                                }`}>
                                    <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Topic #{item.order_index}</span>
                                        {item.is_completed && <span className="text-[10px] font-black text-approve uppercase tracking-widest">Completed</span>}
                                    </div>
                                    <h4 className={`text-base font-bold mb-1 ${item.is_completed ? "text-slate-400" : "text-slate-900"} transition-all`}>
                                        {item.title}
                                    </h4>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">{item.content}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-400">No curriculum defined for this course yet.</div>
                    )}
                 </div>
              </div>
           )}

           {activeTab === "assignments" && (
              <div className="grid gap-4">
                  {assignments.length > 0 ? (
                      assignments.map((a: any) => (
                        <div key={a.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-secondary transition-all">
                             <div className="flex justify-between items-start mb-3">
                                 <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">{a.title}</h4>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date:</span>
                                       <span className="text-xs font-bold text-secondary">{new Date(a.due_date).toLocaleDateString()}</span>
                                    </div>
                                 </div>
                             </div>
                             <p className="text-slate-500 text-xs mb-5 leading-relaxed">{a.description}</p>
                             {a.file_url && (
                                <a href={a.file_url} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100">
                                    <FileText className="h-3.5 w-3.5" /> Resource
                                </a>
                             )}
                        </div>
                      ))
                  ) : (
                      <div className="py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                          <p className="text-slate-400 font-medium">Assignments will appear here once your tutor posts them.</p>
                      </div>
                  )}
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
