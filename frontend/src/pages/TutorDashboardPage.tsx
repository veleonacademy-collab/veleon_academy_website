import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academyApi } from "../api/academy";
import { Link } from "react-router-dom";
import { Plus, Video, ClipboardList, Book, Users, ExternalLink, MessageSquare, Folder, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "../components/forms/Input";
import Modal from "../components/Modal";
import { FileUpload } from "../components/forms/FileUpload";

const TutorDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{ studentId: number; courseId: number; name: string } | null>(null);

  const [folderName, setFolderName] = useState("");
  const [folderCohort, setFolderCohort] = useState("");
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [editFolderCohort, setEditFolderCohort] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<any | null>(null);
  const [remarkText, setRemarkText] = useState("");

  const [uploadData, setUploadData] = useState({
    folderId: "",
    newFolderName: "",
    className: "",
    classDescription: "",
    lessons: [{ title: "", videoUrl: "" }],
    hasAssignment: false,
    assignmentTitle: "",
    assignmentDescription: "",
    assignmentFileUrl: "",
    assignmentDueDate: "",
    cohort: "Cohort 3"
  });

  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [materialsUploadData, setMaterialsUploadData] = useState({
    folderId: "",
    newFolderName: "",
    className: "",
    classDescription: "",
    materials: [{ title: "", url: "", type: "document" as "document" | "video" | "link" }],
    cohort: "Cohort 3"
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["tutor-courses"],
    queryFn: academyApi.getTutorCourses,
  });

  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: () => academyApi.getCourses({ all: true }),
  });

  const [isCourseSelectModalOpen, setIsCourseSelectModalOpen] = useState(false);
  const [selectedCourseToJoin, setSelectedCourseToJoin] = useState<number | null>(null);

  const { data: students } = useQuery({
    queryKey: ["tutor-students"],
    queryFn: academyApi.getTutorStudents,
  });

  const { data: currentFolders, refetch: refetchFolders } = useQuery({
    queryKey: ["course-folders", selectedCourseId, selectedCohort],
    queryFn: () => selectedCourseId ? academyApi.getCourseFolders(selectedCourseId, selectedCohort || undefined) : Promise.resolve([]),
    enabled: !!selectedCourseId,
  });

  const folderMutation = useMutation({
    mutationFn: (data: { courseId: number; name: string; cohort?: string }) => academyApi.createFolder(data),
    onSuccess: () => {
      toast.success("Folder created successfully!");
      setIsFolderModalOpen(false);
      setFolderName("");
      setFolderCohort("");
      refetchFolders();
    },
    onError: () => toast.error("Failed to create folder"),
  });

  const updateFolderMutation = useMutation({
    mutationFn: (data: { id: number; name: string; cohort?: string }) => academyApi.updateFolder(data.id, { name: data.name, cohort: data.cohort }),
    onSuccess: () => {
      toast.success("Folder updated successfully!");
      setEditingFolderId(null);
      refetchFolders();
      queryClient.invalidateQueries({ queryKey: ["tutor-courses"] });
    },
    onError: () => toast.error("Failed to update folder"),
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (data: { id: number; deleteContent: boolean }) => academyApi.deleteFolder(data.id, data.deleteContent),
    onSuccess: () => {
      toast.success("Folder deleted successfully!");
      setDeletingFolder(null);
      refetchFolders();
      queryClient.invalidateQueries({ queryKey: ["tutor-courses"] });
    },
    onError: () => toast.error("Failed to delete folder"),
  });

  const uploadMutation = useMutation({
    mutationFn: (data: any) => academyApi.uploadClassMaterial(data),
    onSuccess: () => {
      toast.success("Class material uploaded and students notified!");
      setIsUploadModalOpen(false);
      setIsMaterialsModalOpen(false);
      setUploadData({
        folderId: "",
        newFolderName: "",
        className: "",
        classDescription: "",
        lessons: [{ title: "", videoUrl: "" }],
        hasAssignment: false,
        assignmentTitle: "",
        assignmentDescription: "",
        assignmentFileUrl: "",
        assignmentDueDate: "",
        cohort: "Cohort 3"
      });
      setMaterialsUploadData({
        folderId: "",
        newFolderName: "",
        className: "",
        classDescription: "",
        materials: [{ title: "", url: "", type: "document" }],
        cohort: "Cohort 3"
      });
      queryClient.invalidateQueries({ queryKey: ["tutor-courses"] });
    },
    onError: () => toast.error("Failed to upload class material"),
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
  });

  const addLesson = () => {
    setUploadData(prev => ({
      ...prev,
      lessons: [...prev.lessons, { title: "", videoUrl: "" }]
    }));
  };

  const removeLesson = (index: number) => {
    setUploadData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, idx) => idx !== index)
    }));
  };

  const handleLessonChange = (index: number, field: "title" | "videoUrl", value: string) => {
    setUploadData(prev => {
      const updated = [...prev.lessons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, lessons: updated };
    });
  };

  const addMaterialRow = () => {
    setMaterialsUploadData(prev => ({
      ...prev,
      materials: [...prev.materials, { title: "", url: "", type: "document" }]
    }));
  };

  const removeMaterialRow = (index: number) => {
    setMaterialsUploadData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, idx) => idx !== index)
    }));
  };

  const handleMaterialRowChange = (index: number, field: "title" | "url" | "type", value: string) => {
    setMaterialsUploadData(prev => {
      const updated = [...prev.materials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, materials: updated };
    });
  };

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
            <div key={`${course.id}-${course.cohort || "default"}`} className="bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {course.title} {course.cohort ? `(${course.cohort})` : ""}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {(course as any).student_count || 0} Students</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-primary">{(course as any).recording_count || 0} Recordings</span>
                      </div>
                  </div>
                  <Link to={`/academy/course/${course.id}?cohort=${course.cohort || ""}`} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                      <ExternalLink className="h-5 w-5" />
                  </Link>
              </div>

              <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => {
                        setSelectedCourseId(course.id);
                        setSelectedCohort(course.cohort || null);
                        setUploadData({
                            folderId: "",
                            newFolderName: "",
                            className: "",
                            classDescription: "",
                            lessons: [{ title: "", videoUrl: "" }],
                            hasAssignment: false,
                            assignmentTitle: "",
                            assignmentDescription: "",
                            assignmentFileUrl: "",
                            assignmentDueDate: "",
                            cohort: course.cohort || "Cohort 3"
                        });
                        setIsUploadModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary hover:bg-white transition-all gap-1.5 group/btn"
                  >
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-primary transition-colors">
                          <Plus className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-slate-900 text-center">Class</span>
                  </button>

                  <button 
                    onClick={() => {
                        setSelectedCourseId(course.id);
                        setSelectedCohort(course.cohort || null);
                        setMaterialsUploadData({
                            folderId: "",
                            newFolderName: "",
                            className: "",
                            classDescription: "",
                            materials: [{ title: "", url: "", type: "document" }],
                            cohort: course.cohort || "Cohort 3"
                        });
                        setIsMaterialsModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary hover:bg-white transition-all gap-1.5 group/btn"
                  >
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-primary transition-colors">
                          <Book className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-slate-900 text-center">Materials</span>
                  </button>

                  <button 
                     onClick={() => {
                          setSelectedCourseId(course.id);
                          setSelectedCohort(course.cohort || null);
                          setFolderName("");
                          setIsFolderModalOpen(true);
                     }}
                     className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-secondary hover:bg-white transition-all gap-1.5 group/btn"
                  >
                      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-secondary transition-colors">
                          <Folder className="h-4 w-4" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-slate-900 text-center">Folder</span>
                  </button>
                  {course.timetable_url ? (
                    <a 
                      href={course.timetable_url.includes('cloudinary.com') && course.timetable_url.includes('/upload/')
                        ? course.timetable_url.replace('/upload/', '/upload/fl_attachment/')
                        : course.timetable_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-900 hover:bg-white transition-all gap-1.5 group/btn"
                    >
                        <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover/btn:text-slate-900 transition-colors">
                            <ExternalLink className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-slate-900 text-center">Timetable</span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50/50 border border-transparent gap-1.5 opacity-50">
                        <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
                            <ExternalLink className="h-4 w-4" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-slate-300 text-center">Timetable</span>
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
              
              <div className="flex gap-2 mt-4">
                <Link 
                  to={`/tutor/course/${course.id}/curriculum`}
                  className="flex-1 text-center py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-slate-200"
                >
                  Mark Curriculum Progress
                </Link>
                <button 
                  onClick={() => {
                    setSelectedCourseId(course.id);
                    setSelectedCohort(course.cohort || null);
                    setIsManageFoldersOpen(true);
                  }}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Manage Folders
                </button>
              </div>
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
                                    <div className="text-xs text-slate-500">{student.email} • Enrolled in: <span className="font-medium">{student.course_title}</span> {student.cohort ? `(${student.cohort})` : ""}</div>
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

      {/* Folder Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create Skill Set Folder"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Folder Name</label>
            <Input
              placeholder="e.g. Excel Classes, SQL Classes"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cohort (Optional)</label>
            <Input
              placeholder="e.g. Cohort 3 (leave blank for all cohorts)"
              value={folderCohort}
              onChange={(e) => setFolderCohort(e.target.value)}
            />
          </div>
          <button
            onClick={() => folderMutation.mutate({ courseId: selectedCourseId!, name: folderName, cohort: folderCohort })}
            disabled={folderMutation.isPending || !folderName.trim()}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6 uppercase"
          >
            {folderMutation.isPending ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </Modal>

      {/* Manage Folders Modal */}
      <Modal
        isOpen={isManageFoldersOpen}
        onClose={() => {
          setIsManageFoldersOpen(false);
          setEditingFolderId(null);
          setDeletingFolder(null);
        }}
        title="Manage Folders"
      >
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          {currentFolders && currentFolders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {currentFolders.map((folder: any) => {
                const isEditing = editingFolderId === folder.id;
                return (
                  <div key={folder.id} className="py-4 flex flex-col gap-3">
                    {isEditing ? (
                      <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Folder Name</label>
                          <Input
                            value={editFolderName}
                            onChange={(e) => setEditFolderName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cohort (Optional)</label>
                          <Input
                            placeholder="Leave blank for all cohorts"
                            value={editFolderCohort}
                            onChange={(e) => setEditFolderCohort(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              updateFolderMutation.mutate({
                                id: folder.id,
                                name: editFolderName,
                                cohort: editFolderCohort
                              });
                            }}
                            disabled={updateFolderMutation.isPending || !editFolderName.trim()}
                            className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:opacity-90 transition-all"
                          >
                            {updateFolderMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingFolderId(null)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-lg hover:bg-slate-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{folder.name}</div>
                          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                            {folder.cohort ? `Cohort: ${folder.cohort}` : "All Cohorts"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingFolderId(folder.id);
                              setEditFolderName(folder.name);
                              setEditFolderCohort(folder.cohort || "");
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingFolder(folder)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No folders created for this course yet.</p>
          )}
        </div>
      </Modal>

      {/* Delete Folder Confirmation Modal */}
      <Modal
        isOpen={!!deletingFolder}
        onClose={() => setDeletingFolder(null)}
        title="Delete Folder"
      >
        <div className="space-y-6 py-4">
          <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl text-sm leading-relaxed">
            <span className="font-bold">Warning:</span> You are about to delete the folder <strong>{deletingFolder?.name}</strong> ({deletingFolder?.cohort ? `Cohort: ${deletingFolder?.cohort}` : "All Cohorts"}).
            <p className="mt-2 text-xs text-red-600">
              Please choose if you also want to delete all classes, lessons (recordings), and assignments inside this folder.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                deleteFolderMutation.mutate({ id: deletingFolder.id, deleteContent: true });
              }}
              disabled={deleteFolderMutation.isPending}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
              {deleteFolderMutation.isPending ? "DELETING EVERYTHING..." : "YES, DELETE EVERYTHING INSIDE"}
            </button>
            
            <button
              onClick={() => {
                deleteFolderMutation.mutate({ id: deletingFolder.id, deleteContent: false });
              }}
              disabled={deleteFolderMutation.isPending}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
              {deleteFolderMutation.isPending ? "DELETING FOLDER..." : "NO, KEEP ITEMS (MOVE TO GENERAL MATERIALS)"}
            </button>

            <button
              onClick={() => setDeletingFolder(null)}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Class Material Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Class Materials"
      >
        <div className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-2">
          {/* Folder selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Folder</label>
            <select
              value={uploadData.folderId}
              onChange={(e) => setUploadData({ ...uploadData, folderId: e.target.value, newFolderName: e.target.value === "new" ? "" : uploadData.newFolderName })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an existing folder</option>
              {currentFolders?.map((f: any) => (
                <option key={f.id} value={f.id}>{f.name}{f.cohort ? ` (${f.cohort})` : ''}</option>
              ))}
              <option value="new">+ Create New Folder inline</option>
            </select>
          </div>

          {/* New folder inline name */}
          {uploadData.folderId === "new" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Folder Name</label>
              <Input
                placeholder="e.g. Excel Intermediate Classes"
                value={uploadData.newFolderName}
                onChange={(e) => setUploadData({ ...uploadData, newFolderName: e.target.value })}
              />
            </div>
          )}

          {/* Class details */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Class Title</label>
            <Input
              placeholder="e.g. Class 1: Introduction to Functions"
              value={uploadData.className}
              onChange={(e) => setUploadData({ ...uploadData, className: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Class Description (Optional)</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              rows={3}
              placeholder="Provide a description for this class..."
              value={uploadData.classDescription}
              onChange={(e) => setUploadData({ ...uploadData, classDescription: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cohort Group</label>
            <Input
              placeholder="e.g. Cohort 3 (optional)"
              value={uploadData.cohort}
              onChange={(e) => setUploadData({ ...uploadData, cohort: e.target.value })}
            />
          </div>

          {/* Dynamic lessons list */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-widest text-slate-900 block">Lessons (Video Recordings)</label>
            {uploadData.lessons.map((lesson, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative space-y-3">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeLesson(idx)}
                    className="absolute right-3 top-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson #{idx + 1} Title</label>
                  <Input
                    placeholder="e.g. Lesson 1a: Basic Math operations"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(idx, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lesson #{idx + 1} Video URL</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={lesson.videoUrl}
                    onChange={(e) => handleLessonChange(idx, "videoUrl", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addLesson}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
            >
              + Add Another Lesson
            </button>
          </div>

          {/* Assignment toggle */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <input
                id="hasAssignment"
                type="checkbox"
                checked={uploadData.hasAssignment}
                onChange={(e) => setUploadData({ ...uploadData, hasAssignment: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="hasAssignment" className="text-xs font-black uppercase tracking-widest text-slate-900 cursor-pointer">
                Include Class Assignment?
              </label>
            </div>

            {uploadData.hasAssignment && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assignment Title</label>
                  <Input
                    placeholder="e.g. Homework: Formulas Practice"
                    value={uploadData.assignmentTitle}
                    onChange={(e) => setUploadData({ ...uploadData, assignmentTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Description / Instructions</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    rows={3}
                    placeholder="Write instructions here..."
                    value={uploadData.assignmentDescription}
                    onChange={(e) => setUploadData({ ...uploadData, assignmentDescription: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Resource File URL (Optional)</label>
                  <Input
                    placeholder="https://..."
                    value={uploadData.assignmentFileUrl}
                    onChange={(e) => setUploadData({ ...uploadData, assignmentFileUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Due Date</label>
                  <Input
                    type="date"
                    value={uploadData.assignmentDueDate}
                    onChange={(e) => setUploadData({ ...uploadData, assignmentDueDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              const payload = {
                courseId: selectedCourseId,
                folderId: uploadData.folderId === "new" || !uploadData.folderId ? null : parseInt(uploadData.folderId),
                newFolderName: uploadData.folderId === "new" ? uploadData.newFolderName : null,
                className: uploadData.className,
                classDescription: uploadData.classDescription || null,
                lessons: uploadData.lessons.filter(l => l.title && l.videoUrl),
                assignment: uploadData.hasAssignment && uploadData.assignmentTitle ? {
                  title: uploadData.assignmentTitle,
                  description: uploadData.assignmentDescription,
                  fileUrl: uploadData.assignmentFileUrl,
                  dueDate: uploadData.assignmentDueDate
                } : null,
                cohort: uploadData.cohort
              };
              uploadMutation.mutate(payload);
            }}
            disabled={uploadMutation.isPending || !uploadData.className.trim() || (uploadData.folderId === "new" && !uploadData.newFolderName.trim())}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6 uppercase"
          >
            {uploadMutation.isPending ? "Uploading..." : "Publish Class Material"}
          </button>
        </div>
      </Modal>

      {/* Upload Class Materials Modal (no assignment, just docs/links) */}
      <Modal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        title="Upload Class Materials"
      >
        <div className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-2">
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-xl">
            Upload documents, video links, or general links for students. No assignment required.
          </p>

          {/* Folder selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Folder</label>
            <select
              value={materialsUploadData.folderId}
              onChange={(e) => setMaterialsUploadData({ ...materialsUploadData, folderId: e.target.value, newFolderName: e.target.value === "new" ? "" : materialsUploadData.newFolderName })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an existing folder</option>
              {currentFolders?.map((f: any) => (
                <option key={f.id} value={f.id}>{f.name}{f.cohort ? ` (${f.cohort})` : ''}</option>
              ))}
              <option value="new">+ Create New Folder inline</option>
            </select>
          </div>

          {materialsUploadData.folderId === "new" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Folder Name</label>
              <Input
                placeholder="e.g. Excel Intermediate Classes"
                value={materialsUploadData.newFolderName}
                onChange={(e) => setMaterialsUploadData({ ...materialsUploadData, newFolderName: e.target.value })}
              />
            </div>
          )}

          {/* Class/Topic title */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Topic / Class Title</label>
            <Input
              placeholder="e.g. Class 3: Advanced Formulas Resources"
              value={materialsUploadData.className}
              onChange={(e) => setMaterialsUploadData({ ...materialsUploadData, className: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description (Optional)</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              rows={2}
              placeholder="Briefly describe these materials..."
              value={materialsUploadData.classDescription}
              onChange={(e) => setMaterialsUploadData({ ...materialsUploadData, classDescription: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Cohort Group</label>
            <Input
              placeholder="e.g. Cohort 3 (optional)"
              value={materialsUploadData.cohort}
              onChange={(e) => setMaterialsUploadData({ ...materialsUploadData, cohort: e.target.value })}
            />
          </div>

          {/* Dynamic materials list */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-widest text-slate-900 block">Materials</label>
            {materialsUploadData.materials.map((mat, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative space-y-3">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(idx)}
                    className="absolute right-3 top-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Material #{idx + 1} Title</label>
                  <Input
                    placeholder="e.g. Excel Formula Reference Sheet"
                    value={mat.title}
                    onChange={(e) => handleMaterialRowChange(idx, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Type</label>
                  <select
                    value={mat.type}
                    onChange={(e) => handleMaterialRowChange(idx, "type", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="document">📄 Document File</option>
                    <option value="video">🎥 Video Link</option>
                    <option value="link">🔗 General Link</option>
                  </select>
                </div>
                {mat.type === "document" ? (
                  <FileUpload
                    label="Upload Document"
                    value={mat.url}
                    onChange={(url) => handleMaterialRowChange(idx, "url", url)}
                    folder="academy-materials"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                    type="document"
                  />
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {mat.type === "video" ? "Video URL" : "Link URL"}
                    </label>
                    <Input
                      placeholder={mat.type === "video" ? "https://youtube.com/..." : "https://..."}
                      value={mat.url}
                      onChange={(e) => handleMaterialRowChange(idx, "url", e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterialRow}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
            >
              + Add Another Material
            </button>
          </div>

          <button
            onClick={() => {
              const validMaterials = materialsUploadData.materials.filter(m => m.title && m.url);
              const payload = {
                courseId: selectedCourseId,
                folderId: materialsUploadData.folderId === "new" || !materialsUploadData.folderId ? null : parseInt(materialsUploadData.folderId),
                newFolderName: materialsUploadData.folderId === "new" ? materialsUploadData.newFolderName : null,
                className: materialsUploadData.className,
                classDescription: materialsUploadData.classDescription || null,
                lessons: [],
                assignment: null,
                materials: validMaterials,
                cohort: materialsUploadData.cohort
              };
              uploadMutation.mutate(payload);
            }}
            disabled={
              uploadMutation.isPending ||
              !materialsUploadData.className.trim() ||
              (materialsUploadData.folderId === "new" && !materialsUploadData.newFolderName.trim()) ||
              materialsUploadData.materials.filter(m => m.title && m.url).length === 0
            }
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm tracking-widest hover:opacity-90 transition-all mt-6 uppercase"
          >
            {uploadMutation.isPending ? "Uploading..." : "Publish Materials"}
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
