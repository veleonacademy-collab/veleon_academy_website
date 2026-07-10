import React, { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../api/academy";
import { PlayCircle, FileText, ArrowLeft, Lock, Calendar, Book, Mail, Folder, ChevronDown, ChevronUp, Video, Edit } from "lucide-react";
import SEO from "../components/SEO";
import { useAuth } from "../state/AuthContext";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import { Input } from "../components/forms/Input";

const renderDescriptionWithLinks = (text: string) => {
  if (!text) return null;

  // Split by URLs (both http/https and www.)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      let href = part;
      if (href.toLowerCase().startsWith("www.")) {
        href = "https://" + href;
      }
      
      let displayUrl = part;
      let trailingPunctuation = "";
      
      // Strip trailing punctuation from href and displayUrl (e.g. period at the end of sentence)
      const trailingMatch = part.match(/([.,?!;:]+)$/);
      if (trailingMatch) {
        const punctuation = trailingMatch[1];
        displayUrl = part.slice(0, -punctuation.length);
        if (part.toLowerCase().startsWith("www.")) {
          href = "https://" + displayUrl;
        } else {
          href = displayUrl;
        }
        trailingPunctuation = punctuation;
      }

      return (
        <React.Fragment key={index}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold break-all"
          >
            {displayUrl}
          </a>
          {trailingPunctuation}
        </React.Fragment>
      );
    }
    return part;
  });
};

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const id = parseInt(courseId || "0");
  const [searchParams] = useSearchParams();
  const cohort = searchParams.get("cohort") || undefined;

  const { data: details, isLoading } = useQuery({
    queryKey: ["course-details", id, cohort],
    queryFn: () => academyApi.getCourseDetails(id, cohort),
    enabled: !!id,
  });

  const [activeTab, setActiveTab] = useState<"folders" | "curriculum">("folders");
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({ [-1]: true });
  const [expandedClasses, setExpandedClasses] = useState<Record<number, boolean>>({ [-1]: true });

  React.useEffect(() => {
    if (details?.folders) {
      const initial: Record<number, boolean> = { [-1]: true };
      details.folders.forEach((f: any) => {
        initial[f.id] = true;
      });
      setExpandedFolders(initial);
    }
  }, [details?.folders]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleClass = (classId: number) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };
  
  const { user } = useAuth();
  const isTutorOrAdmin = user?.role === 'tutor' || user?.role === 'admin';

  // Edit Recording State
  const [editingRecording, setEditingRecording] = useState<any | null>(null);
  const [editRecTitle, setEditRecTitle] = useState("");
  const [editRecUrl, setEditRecUrl] = useState("");

  // Edit Assignment State
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [editAssignTitle, setEditAssignTitle] = useState("");
  const [editAssignDesc, setEditAssignDesc] = useState("");
  const [editAssignFileUrl, setEditAssignFileUrl] = useState("");
  const [editAssignDueDate, setEditAssignDueDate] = useState("");

  const formatInputDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const handleEditRecording = (recording: any) => {
    setEditingRecording(recording);
    setEditRecTitle(recording.title || "");
    setEditRecUrl(recording.video_url || "");
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
    setEditAssignTitle(assignment.title || "");
    setEditAssignDesc(assignment.description || "");
    setEditAssignFileUrl(assignment.file_url || "");
    setEditAssignDueDate(formatInputDate(assignment.due_date));
  };

  const queryClient = useQueryClient();

  const updateRecordingMutation = useMutation({
    mutationFn: (data: { id: number; title: string; videoUrl: string }) =>
      academyApi.updateRecording(data.id, { title: data.title, videoUrl: data.videoUrl }),
    onSuccess: () => {
      toast.success("Recording updated successfully!");
      setEditingRecording(null);
      queryClient.invalidateQueries({ queryKey: ["course-details", id, cohort] });
    },
    onError: () => {
      toast.error("Failed to update recording");
    }
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: (data: { id: number; title: string; description: string; fileUrl?: string; dueDate?: string }) =>
      academyApi.updateAssignment(data.id, {
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        dueDate: data.dueDate
      }),
    onSuccess: () => {
      toast.success("Assignment updated successfully!");
      setEditingAssignment(null);
      queryClient.invalidateQueries({ queryKey: ["course-details", id, cohort] });
    },
    onError: () => {
      toast.error("Failed to update assignment");
    }
  });
  
  const course = details?.course;
  const enrollment = details?.enrollment;
  const curriculum = details?.curriculum || [];
  const folders = details?.folders || [];

  const isVerified = user?.isEmailVerified;

  const backPath = user?.role === 'tutor' 
    ? "/tutor/dashboard" 
    : user?.role === 'admin' 
    ? "/admin/dashboard" 
    : "/student/dashboard";

  if (isLoading) return <div className="py-20 text-center font-bold text-slate-400">Loading course...</div>;

  if (!details && !isLoading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="text-xl font-bold">Course access denied or not found.</p>
        <Link to={backPath} className="text-primary hover:underline text-sm mt-4 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <SEO 
        title={course?.title || "Course Details"}
        description={course?.description || undefined}
        image={course?.thumbnail_url || undefined}
        type="course"
      />
      {/* Back */}
      <Link
        to={backPath}
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
              {course?.title} {cohort ? `(${cohort})` : ""}
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
          onClick={() => setActiveTab("folders")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "folders"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Folder className="h-4 w-4" /> Class Folders
        </button>
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-4 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "curriculum"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Book className="h-4 w-4" /> Curriculum Progress
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
      ) : !isVerified ? (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">You're just one click away! ✨</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed mb-6">
            <span className="hidden sm:inline">We're excited to have you! To start watching your recordings and downloading assignments, just verify your email address via the link we sent to your inbox.</span>
            <span className="sm:hidden">Verify your email to access all materials! ✨</span>
          </p>
          <div className="p-4 bg-white/50 border border-slate-100 rounded-xl inline-block">
             <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Why do we do this?</p>
             <p className="text-xs text-slate-400">It keeps your account safe and ensures your hard-earned certificates reach you!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "folders" && (
            <div className="space-y-6">
              {folders.length > 0 ? (
                folders.map((folder: any) => {
                  const isExpanded = !!!expandedFolders[folder.id];
                  const classesCount = folder.classes?.length || 0;
                  return (
                    <div key={folder.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
                      {/* Folder Header */}
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="w-full flex items-center justify-between p-6 bg-slate-50/60 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Folder className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">{folder.name}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{classesCount} {classesCount === 1 ? "Class" : "Classes"}</p>
                          </div>
                        </div>
                        <div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Folder Classes List */}
                      {isExpanded && (
                        <div className="p-6 space-y-6 border-t border-slate-100 divide-y divide-slate-100">
                          {folder.classes && folder.classes.length > 0 ? (
                             [...folder.classes]
      .sort((a, b) => a.id - b.id).map((cls: any, idx: number) => {
                              const isExpandedClass = !!expandedClasses[cls.id]; 
                              return (

                              <div key={cls.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""}`}>
                                <button
                                  onClick={() => toggleClass(cls.id)}
                                  className="w-full flex items-center justify-between mb-4 text-left group/cls"
                                >
                                  <div>
                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover/cls:text-primary transition-colors">{cls.name}</h4>
                                    {cls.description && <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{cls.description}</p>}
                                  </div>
                                  <div className="ml-4 flex-shrink-0">
                                    {isExpandedClass ? (
                                      <ChevronUp className="h-4 w-4 text-slate-400" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-slate-400" />
                                    )}
                                  </div>
                                </button>

                                {isExpandedClass && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Recordings (Lessons) */}
                                  <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/80 space-y-3">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                      <Video className="h-4 w-4 text-primary" />
                                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Lessons & Recordings</h5>
                                    </div>
                                    {cls.recordings && cls.recordings.length > 0 ? (
                                      <div className="space-y-2.5">
                                        {cls.recordings.map((r: any) => (
                                          <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-primary transition-all">
                                            <div className="flex items-center gap-3">
                                              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                <PlayCircle className="h-4 w-4" />
                                              </div>
                                              <div>
                                                <h6 className="font-bold text-slate-900 text-xs">{r.title}</h6>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Published on {new Date(r.recording_date).toLocaleDateString()}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              {isTutorOrAdmin && (
                                                <button
                                                  onClick={() => handleEditRecording(r)}
                                                  className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest transition-all hover:underline flex items-center gap-1"
                                                >
                                                  <Edit className="h-3 w-3" /> Edit
                                                </button>
                                              )}
                                              <a href={r.video_url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-primary uppercase tracking-widest transition-all hover:underline flex items-center gap-1">
                                                Watch →
                                              </a>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 py-4 text-center font-medium">Class recordings will appear here as your tutor uploads them.</p>
                                    )}
                                  </div>

                                  {/* Assignments */}
                                  <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/80 space-y-3">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                      <FileText className="h-4 w-4 text-secondary" />
                                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Class Tasks & Assignments</h5>
                                    </div>
                                    {cls.assignments && cls.assignments.length > 0 ? (
                                      <div className="space-y-3">
                                        {cls.assignments.map((a: any) => (
                                          <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <h6 className="font-bold text-slate-900 text-xs mb-1">{a.title}</h6>
                                                <div className="flex items-center gap-1">
                                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Due:</span>
                                                  <span className="text-[10px] font-bold text-secondary">{new Date(a.due_date).toLocaleDateString()}</span>
                                                </div>
                                              </div>
                                              {isTutorOrAdmin && (
                                                <button
                                                  onClick={() => handleEditAssignment(a)}
                                                  className="text-[10px] font-black text-slate-500 hover:text-secondary uppercase tracking-widest transition-all hover:underline flex items-center gap-1"
                                                >
                                                  <Edit className="h-3 w-3" /> Edit
                                                </button>
                                              )}
                                            </div>
                                            <p className="text-slate-500 text-[11px] leading-relaxed whitespace-pre-wrap">{renderDescriptionWithLinks(a.description)}</p>
                                            {a.file_url && (
                                              <a href={a.file_url} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100">
                                                <FileText className="h-3 w-3" /> Resource
                                              </a>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400 py-4 text-center font-medium">No tasks assigned for this class yet.</p>
                                    )}
                                  </div>
                                </div>
                                )}
                              </div>

                            )})
                          ) : (
                            <div className="py-6 text-center text-slate-400 text-xs">No classes uploaded in this folder yet.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Class materials will appear here once uploaded.</p>
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
        </div>
      )}
      {/* Edit Recording Modal */}
      <Modal
        isOpen={!!editingRecording}
        onClose={() => setEditingRecording(null)}
        title="Edit Lesson Recording"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Lesson Title</label>
            <Input
              placeholder="e.g. Lesson 1a: Basic Math operations"
              value={editRecTitle}
              onChange={(e) => setEditRecTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Video URL</label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={editRecUrl}
              onChange={(e) => setEditRecUrl(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              if (editingRecording) {
                updateRecordingMutation.mutate({
                  id: editingRecording.id,
                  title: editRecTitle,
                  videoUrl: editRecUrl
                });
              }
            }}
            disabled={updateRecordingMutation.isPending || !editRecTitle.trim() || !editRecUrl.trim()}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6 uppercase"
          >
            {updateRecordingMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        title="Edit Class Assignment"
      >
        <div className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-1">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Assignment Title</label>
            <Input
              placeholder="e.g. Homework: Formulas Practice"
              value={editAssignTitle}
              onChange={(e) => setEditAssignTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description / Instructions</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              rows={4}
              placeholder="Write instructions here..."
              value={editAssignDesc}
              onChange={(e) => setEditAssignDesc(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Resource File URL (Optional)</label>
            <Input
              placeholder="https://..."
              value={editAssignFileUrl}
              onChange={(e) => setEditAssignFileUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Due Date</label>
            <Input
              type="date"
              value={editAssignDueDate}
              onChange={(e) => setEditAssignDueDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              if (editingAssignment) {
                updateAssignmentMutation.mutate({
                  id: editingAssignment.id,
                  title: editAssignTitle,
                  description: editAssignDesc,
                  fileUrl: editAssignFileUrl || undefined,
                  dueDate: editAssignDueDate || undefined
                });
              }
            }}
            disabled={updateAssignmentMutation.isPending || !editAssignTitle.trim() || !editAssignDesc.trim()}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6 uppercase"
          >
            {updateAssignmentMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
