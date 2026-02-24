import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../api/academy";
import { Link } from "react-router-dom";
import { Plus, Video, ClipboardList, Book, Users, ExternalLink, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../components/forms/Input";
import Modal from "../components/Modal";

const TutorDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{ studentId: number; courseId: number; name: string } | null>(null);

  const [recordingData, setRecordingData] = useState({ title: "", videoUrl: "" });
  const [assignmentData, setAssignmentData] = useState({ title: "", description: "", dueDate: "" });
  const [remarkText, setRemarkText] = useState("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["tutor-courses"],
    queryFn: academyApi.getTutorCourses,
  });

  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: academyApi.getCourses,
  });

  const [isCourseSelectModalOpen, setIsCourseSelectModalOpen] = useState(false);
  const [selectedCourseToJoin, setSelectedCourseToJoin] = useState<number | null>(null);

  const { data: students } = useQuery({
    queryKey: ["tutor-students"],
    queryFn: academyApi.getTutorStudents,
  });

  const recordingMutation = useMutation({
    mutationFn: (data: { courseId: number; title: string; videoUrl: string }) => academyApi.addRecording(data),
    onSuccess: () => {
      toast.success("Recording added and students notified!");
      setIsRecordingModalOpen(false);
      setRecordingData({ title: "", videoUrl: "" });
    },
    onError: () => toast.error("Failed to add recording"),
  });

  const assignmentMutation = useMutation({
    mutationFn: (data: any) => academyApi.createAssignment(data),
    onSuccess: () => {
      toast.success("Assignment posted!");
      setIsAssignmentModalOpen(false);
      setAssignmentData({ title: "", description: "", dueDate: "" });
    },
    onError: () => toast.error("Failed to post assignment"),
  });

  const remarkMutation = useMutation({
    mutationFn: (data: any) => academyApi.createRemark(data),
    onSuccess: () => {
      toast.success("Remark added!");
      setIsRemarkModalOpen(false);
      setRemarkText("");
    },
    onError: () => toast.error("Failed to add remark"),
  });

  const selectCourseMutation = useMutation({
    mutationFn: (courseId: number) => academyApi.selectTutorCourse(courseId),
    onSuccess: () => {
      toast.success("Course added to your dashboard!");
      setIsCourseSelectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tutor-courses"] });
    },
    onError: () => toast.error("Failed to add course"),
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tutor <span className="text-primary italic">Command Center</span></h1>
          <p className="text-slate-500">Manage your courses, recordings, and student assignments.</p>
        </div>
        <div className="flex gap-4">
              <button 
                onClick={() => setIsCourseSelectModalOpen(true)}
                className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="h-5 w-5" /> SELECT COURSE
              </button>
             <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Book className="h-5 w-5" />
                </div>
                <div>
                   <span className="block text-2xl font-black text-slate-900">{courses?.length || 0}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Courses</span>
                </div>
             </div>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-xl max-w-3xl mx-auto mt-10 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Book className="h-12 w-12" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4">No Courses Assigned Yet</h3>
          <p className="text-slate-500 mb-10 leading-relaxed text-lg max-w-xl mx-auto">
            You haven't been assigned any courses to manage. You can select a course to start managing recordings and assignments, or contact the administrator for assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsCourseSelectModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/30"
              >
                <Plus className="h-5 w-5" /> SELECT YOUR FIRST COURSE
              </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{course.title}</h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(course as any).student_count || 0} Students</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-primary">{(course as any).recording_count || 0} Recordings</span>
                      </div>
                  </div>
                  <Link to={`/academy/course/${course.id}`} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                      <ExternalLink className="h-5 w-5" />
                  </Link>
              </div>

              <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => {
                        setSelectedCourseId(course.id);
                        setIsRecordingModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary hover:bg-white transition-all gap-2 group/btn"
                  >
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-primary transition-colors">
                          <Video className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Record</span>
                  </button>
                  <button 
                     onClick={() => {
                          setSelectedCourseId(course.id);
                          setIsAssignmentModalOpen(true);
                     }}
                     className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary hover:bg-white transition-all gap-2 group/btn"
                  >
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-secondary transition-colors">
                          <ClipboardList className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Task</span>
                  </button>
                  {course.timetable_url ? (
                    <a 
                      href={course.timetable_url.includes('cloudinary.com') && course.timetable_url.includes('/upload/')
                        ? course.timetable_url.replace('/upload/', '/upload/fl_attachment/')
                        : course.timetable_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-900 hover:bg-white transition-all gap-2 group/btn"
                    >
                        <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-slate-900 transition-colors">
                            <Book className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">Class</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/50 border border-transparent gap-2 opacity-50">
                        <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
                            <Book className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Soon</span>
                    </div>
                  )}
              </div>

              {((course as any).total_topics > 0) && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Curriculum Progress</span>
                    <span className="text-primary">{Math.round(((course as any).completed_topics / (course as any).total_topics) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${((course as any).completed_topics / (course as any).total_topics) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <Link 
                to={`/tutor/course/${course.id}/curriculum`}
                className="mt-4 block w-full text-center py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-200"
              >
                Mark Curriculum Progress
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6 pt-10">
        <h2 className="text-2xl font-black text-slate-900">Your Assigned Students</h2>
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {students && students.length > 0 ? (
                <div className="divide-y divide-slate-100">
                    {students.map((student: any) => (
                        <div key={student.enrollment_id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{student.first_name} {student.last_name}</div>
                                    <div className="text-xs text-slate-500">{student.email} • Enrolled in: <span className="font-medium">{student.course_title}</span></div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedStudent({ studentId: student.student_id, courseId: student.course_id, name: `${student.first_name} ${student.last_name}` });
                                    setIsRemarkModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" /> Remark
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-10 text-center text-slate-500">
                    <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    No students currently assigned to you.
                </div>
            )}
        </div>
      </div>

      {/* Recording Modal */}
      <Modal 
        isOpen={isRecordingModalOpen} 
        onClose={() => setIsRecordingModalOpen(false)}
        title="Upload Class Recording"
      >
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Recording Title</label>
                <Input 
                    placeholder="e.g. Introduction to React Hooks" 
                    value={recordingData.title}
                    onChange={(e) => setRecordingData({...recordingData, title: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Video URL (YouTube/Vimeo/Loom)</label>
                <Input 
                    placeholder="https://..." 
                    value={recordingData.videoUrl}
                    onChange={(e) => setRecordingData({...recordingData, videoUrl: e.target.value})}
                />
            </div>
            <button 
                onClick={() => recordingMutation.mutate({ courseId: selectedCourseId!, ...recordingData })}
                disabled={recordingMutation.isPending}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6"
            >
                {recordingMutation.isPending ? "PUBLISHING..." : "PUBLISH RECORDING"}
            </button>
        </div>
      </Modal>

      {/* Assignment Modal */}
      <Modal 
        isOpen={isAssignmentModalOpen} 
        onClose={() => setIsAssignmentModalOpen(false)}
        title="Post New Assignment"
      >
        <div className="space-y-4 py-4">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Task Title</label>
                <Input 
                    placeholder="e.g. Build a Todo App with State" 
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({...assignmentData, title: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                <textarea 
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    rows={4}
                    placeholder="Instructions for the students..."
                    value={assignmentData.description}
                    onChange={(e) => setAssignmentData({...assignmentData, description: e.target.value})}
                />
            </div>
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Due Date</label>
                <Input 
                    type="date"
                    value={assignmentData.dueDate}
                    onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
                />
            </div>
            <button 
                onClick={() => assignmentMutation.mutate({ courseId: selectedCourseId!, ...assignmentData })}
                disabled={assignmentMutation.isPending}
                className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6"
            >
                {assignmentMutation.isPending ? "POSTING..." : "POST ASSIGNMENT"}
            </button>
        </div>
      </Modal>

      {/* Remark Modal */}
      <Modal 
        isOpen={isRemarkModalOpen} 
        onClose={() => setIsRemarkModalOpen(false)}
        title={`Add Remark for ${selectedStudent?.name}`}
      >
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Remark details</label>
                <textarea 
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    rows={4}
                    placeholder="E.g., Student needs help with React hooks..."
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                />
            </div>
            <button 
                onClick={() => remarkMutation.mutate({ 
                   studentId: selectedStudent?.studentId, 
                   courseId: selectedStudent?.courseId, 
                   remarkText 
                })}
                disabled={remarkMutation.isPending || !remarkText}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6"
            >
                {remarkMutation.isPending ? "SAVING..." : "SAVE REMARK"}
            </button>
        </div>
      </Modal>

      {/* Course Selection Modal */}
      <Modal 
        isOpen={isCourseSelectModalOpen} 
        onClose={() => setIsCourseSelectModalOpen(false)}
        title="Select Course to Manage"
      >
        <div className="space-y-6 py-4">
            <p className="text-sm text-slate-500 font-medium">Which course would you like to add to your dashboard? You can then manage recordings and tasks for it.</p>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {allCourses?.map((course: any) => {
                    const isAlreadyAdded = courses?.some((c: any) => c.id === course.id);
                    return (
                        <button
                            key={course.id}
                            disabled={isAlreadyAdded}
                            onClick={() => setSelectedCourseToJoin(course.id)}
                            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                                selectedCourseToJoin === course.id 
                                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                    : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200"
                            } ${isAlreadyAdded ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <div>
                                <span className="block font-bold text-slate-900">{course.title}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{isAlreadyAdded ? "ALREADY ADDED" : "AVAILABLE"}</span>
                            </div>
                            {selectedCourseToJoin === course.id && (
                                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-white">
                                    <Plus className="h-3 w-3" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            <button 
                onClick={() => selectedCourseToJoin && selectCourseMutation.mutate(selectedCourseToJoin)}
                disabled={selectCourseMutation.isPending || !selectedCourseToJoin}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-2"
            >
                {selectCourseMutation.isPending ? "ADDING..." : "ADD TO MY COURSES"}
            </button>
        </div>
      </Modal>
    </div>
  );
};

export default TutorDashboardPage;
