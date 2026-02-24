import { Router } from "express";
import { AcademyController } from "../controllers/academyController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

export const academyRouter = Router();

// Public routes (maybe list courses)
academyRouter.get("/courses", AcademyController.getCourses);

// Student routes
academyRouter.get(
  "/student/dashboard",
  authenticate,
  requireRole(["student"]),
  AcademyController.getStudentDashboard
);

academyRouter.get(
  "/student/course/:courseId",
  authenticate,
  requireRole(["student", "tutor", "admin"]),
  AcademyController.getCourseDetails
);

academyRouter.post(
  "/student/complaints",
  authenticate,
  requireRole(["student"]),
  AcademyController.createComplaint
);

// Tutor routes
academyRouter.post(
  "/tutor/recordings",
  authenticate,
  requireRole(["tutor", "admin"]),
  AcademyController.addRecording
);

academyRouter.post(
  "/tutor/assignments",
  authenticate,
  requireRole(["tutor", "admin"]),
  AcademyController.createAssignment
);

academyRouter.get(
  "/tutor/students",
  authenticate,
  requireRole(["tutor"]),
  AcademyController.getTutorStudents
);

academyRouter.post(
  "/tutor/remarks",
  authenticate,
  requireRole(["tutor"]),
  AcademyController.createRemark
);

academyRouter.get(
  "/tutor/my-courses",
  authenticate,
  requireRole(["tutor"]),
  AcademyController.getTutorCourses
);

academyRouter.post(
  "/tutor/select-course",
  authenticate,
  requireRole(["tutor"]),
  AcademyController.setTutorCourse
);

// Admin routes
academyRouter.post(
  "/admin/courses",
  authenticate,
  requireRole(["admin"]),
  AcademyController.createCourse
);

academyRouter.put(
  "/admin/courses/:id",
  authenticate,
  requireRole(["admin"]),
  AcademyController.updateCourse
);

academyRouter.get(
  "/admin/students",
  authenticate,
  requireRole(["admin"]),
  AcademyController.getAdminStudents
);

academyRouter.get(
  "/admin/tutors",
  authenticate,
  requireRole(["admin"]),
  AcademyController.getAdminTutors
);

academyRouter.post(
  "/admin/assign-tutor",
  authenticate,
  requireRole(["admin"]),
  AcademyController.assignTutor
);

academyRouter.post(
  "/admin/assign-tutor-course",
  authenticate,
  requireRole(["admin"]),
  AcademyController.adminAssignTutorCourse
);

academyRouter.get(
  "/admin/tutor-courses/:tutorId",
  authenticate,
  requireRole(["admin"]),
  AcademyController.adminGetTutorCourses
);

academyRouter.get(
  "/admin/tutor/:tutorId",
  authenticate,
  requireRole(["admin"]),
  AcademyController.getAdminTutorDetails
);

academyRouter.delete(
  "/admin/tutor-course/:tutorId/:courseId",
  authenticate,
  requireRole(["admin"]),
  AcademyController.adminRemoveTutorCourse
);

academyRouter.get(
  "/admin/complaints",
  authenticate,
  requireRole(["admin"]),
  AcademyController.getAdminComplaints
);

academyRouter.get(
  "/admin/remarks",
  authenticate,
  requireRole(["admin"]),
  AcademyController.getAdminRemarks
);

// Curriculum routes
academyRouter.get(
  "/curriculum/:courseId",
  authenticate,
  AcademyController.getCurriculum
);

academyRouter.post(
  "/tutor/curriculum/toggle",
  authenticate,
  requireRole(["tutor"]),
  AcademyController.toggleCurriculumProgress
);

academyRouter.post(
  "/admin/curriculum",
  authenticate,
  requireRole(["admin"]),
  AcademyController.addCurriculumItem
);

academyRouter.put(
  "/admin/curriculum/:id",
  authenticate,
  requireRole(["admin"]),
  AcademyController.updateCurriculumItem
);

academyRouter.delete(
  "/admin/curriculum/:id",
  authenticate,
  requireRole(["admin"]),
  AcademyController.deleteCurriculumItem
);
