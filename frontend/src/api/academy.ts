import { http } from "./http";
import { Course, Enrollment, ClassRecording, Assignment } from "../types/academy";

export const academyApi = {
  // Courses
  getCourses: () => http.get<Course[]>("/academy/courses").then(r => r.data),
  
  createCourse: (data: Partial<Course>) => http.post<Course>("/academy/admin/courses", data).then(r => r.data),
  
  updateCourse: (id: number, data: Partial<Course>) => http.put<Course>(`/academy/admin/courses/${id}`, data).then(r => r.data),

  // Student
  getStudentDashboard: () => http.get<any>("/academy/student/dashboard").then(r => r.data),

  payInstallment: (data: { courseId: number; installmentsTotal: number; amount: number }) =>
    http.post<{ url: string }>("/payments/create-checkout-session", {
      amount: data.amount,
      currency: "NGN",
      type: "installment",
      provider: "paystack",
      metadata: {
        courseId: data.courseId.toString(),
        paymentPlan: "installment",
        installmentsTotal: data.installmentsTotal.toString(),
        isSubsequentInstallment: "true", // tells backend NOT to divide amount by periods again
      },
    }).then(r => r.data),
  
  createComplaint: (data: { courseId?: number; subject: string; message: string }) => 
    http.post("/academy/student/complaints", data).then(r => r.data),

  getCourseDetails: (courseId: number) => http.get<{
    enrollment: Enrollment;
    course: Course;
    recordings: ClassRecording[];
    assignments: Assignment[];
    curriculum: any[];
  }>(`/academy/student/course/${courseId}`).then(r => r.data),

  // Tutor
  addRecording: (data: { courseId: number; title: string; videoUrl: string }) => 
    http.post<ClassRecording>("/academy/tutor/recordings", data).then(r => r.data),

  createAssignment: (data: { courseId: number; title: string; description: string; fileUrl?: string; dueDate?: string }) => 
    http.post<Assignment>("/academy/tutor/assignments", data).then(r => r.data),

  getTutorStudents: () => http.get<any[]>("/academy/tutor/students").then(r => r.data),

  createRemark: (data: { studentId: number; courseId: number; remarkText: string }) => 
    http.post("/academy/tutor/remarks", data).then(r => r.data),

  // Admin
  getAdminStudents: (courseId?: number) => 
    http.get<any[]>("/academy/admin/students", { params: { courseId } }).then(r => r.data),
  
  getAdminTutors: (courseId?: number) => 
    http.get<any[]>("/academy/admin/tutors", { params: { courseId } }).then(r => r.data),
    
  getAdminTutorDetails: (tutorId: number) =>
    http.get<{ tutor: any; students: any[] }>(`/academy/admin/tutor/${tutorId}`).then(r => r.data),

  assignTutor: (data: { enrollmentId: number; tutorId: number }) => 
    http.post("/academy/admin/assign-tutor", data).then(r => r.data),

  getTutorCourses: () => http.get<Course[]>("/academy/tutor/my-courses").then(r => r.data),
  
  selectTutorCourse: (courseId: number) => 
    http.post("/academy/tutor/select-course", { courseId }).then(r => r.data),

  adminAssignTutorCourse: (data: { tutorId: number; courseId: number }) =>
    http.post("/academy/admin/assign-tutor-course", data).then(r => r.data),

  adminGetTutorCourses: (tutorId: number) => 
    http.get<Course[]>(`/academy/admin/tutor-courses/${tutorId}`).then(r => r.data),

  adminRemoveTutorCourse: (tutorId: number, courseId: number) =>
    http.delete(`/academy/admin/tutor-course/${tutorId}/${courseId}`).then(r => r.data),

  getAdminComplaints: () => http.get<any[]>("/academy/admin/complaints").then(r => r.data),
  
  getAdminRemarks: () => http.get<any[]>("/academy/admin/remarks").then(r => r.data),

  // Curriculum
  getCurriculum: (courseId: number) => 
    http.get<any[]>(`/academy/curriculum/${courseId}`).then(r => r.data),

  toggleCurriculumProgress: (data: { curriculumId: number; isCompleted: boolean }) =>
    http.post("/academy/tutor/curriculum/toggle", data).then(r => r.data),

  addCurriculumItem: (data: { courseId: number; title: string; content?: string; orderIndex?: number }) => 
    http.post("/academy/admin/curriculum", data).then(r => r.data),

  updateCurriculumItem: (id: number, data: { title: string; content?: string; orderIndex?: number }) => 
    http.put(`/academy/admin/curriculum/${id}`, data).then(r => r.data),

  deleteCurriculumItem: (id: number) => 
    http.delete(`/academy/admin/curriculum/${id}`).then(r => r.data),

  getAdminFinance: () => http.get<any>("/academy/admin/finance").then(r => r.data),

  getAdminTransactions: (params?: { studentId?: number; enrollmentId?: number }) =>
    http.get<any[]>("/academy/admin/transactions", { params }).then(r => r.data),
};
