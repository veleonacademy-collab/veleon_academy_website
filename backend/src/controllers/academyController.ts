import { Request, Response, NextFunction } from "express";
import { AcademyService } from "../services/academyService.js";
import { pool } from "../database/pool.js";
import { sendRecordingNotificationEmail } from "../services/emailService.js";

export class AcademyController {
  // --- COURSE MANAGEMENT (Admin/Tutor) ---
  
  static async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pool.query("SELECT * FROM courses ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, price, thumbnail_url } = req.body;
      const result = await pool.query(
        `INSERT INTO courses (title, description, price, thumbnail_url) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, description, price, thumbnail_url]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, description, price, thumbnail_url, timetable_url } = req.body;
      const result = await pool.query(
        `UPDATE courses 
         SET title = $1, description = $2, price = $3, thumbnail_url = $4, timetable_url = $5, updated_at = NOW()
         WHERE id = $6 RETURNING *`,
        [title, description, price, thumbnail_url, timetable_url, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // --- RECORDINGS ---

  static async addRecording(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, title, videoUrl } = req.body;
      const tutorId = req.user?.id;

      const result = await pool.query(
        `INSERT INTO class_recordings (course_id, tutor_id, title, video_url) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [courseId, tutorId, title, videoUrl]
      );

      const recording = result.rows[0];

      // Get course info for email
      const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [courseId]);
      const courseTitle = courseRes.rows[0]?.title;

      // Notify all enrolled students
      const studentsRes = await pool.query(
        "SELECT u.email FROM enrollments e JOIN users u ON e.student_id = u.id WHERE e.course_id = $1",
        [courseId]
      );

      for (const student of studentsRes.rows) {
        await sendRecordingNotificationEmail(student.email, courseTitle, title, videoUrl);
      }

      res.status(201).json(recording);
    } catch (error) {
      next(error);
    }
  }

  // --- ASSIGNMENTS ---

  static async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, title, description, fileUrl, dueDate } = req.body;
      const tutorId = req.user?.id;

      const result = await pool.query(
        `INSERT INTO assignments (course_id, tutor_id, title, description, file_url, due_date) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [courseId, tutorId, title, description, fileUrl, dueDate]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // --- STUDENT PORTAL ---

  static async getStudentDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.id;
      if (!studentId) return res.status(401).json({ message: "Unauthorized" });

      const enrollments = await AcademyService.getStudentDashboard(studentId);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  }

  static async getCourseDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;
      const role = req.user?.role;

      let enrollment: any = null;

      if (role === 'student') {
        // Check enrollment and lock status
        const enrollmentRes = await pool.query(
          "SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2",
          [userId, courseId]
        );

        if (enrollmentRes.rows.length === 0) {
          return res.status(403).json({ message: "Not enrolled in this course" });
        }

        enrollment = enrollmentRes.rows[0];
        if (enrollment.portal_locked) {
          return res.status(403).json({ 
            message: "Portal locked due to unpaid installments. Please make a payment.",
            locked: true 
          });
        }
      } else {
        // Tutors and Admins can see course details without enrollment
        // Provide a mock enrollment object for frontend compatibility
        enrollment = {
          status: 'enrolled',
          portal_locked: false,
          payment_plan: 'managed'
        };
      }

      const recordings = await AcademyService.getCourseRecordings(parseInt(courseId));
      const assignments = await AcademyService.getCourseAssignments(parseInt(courseId));

      // Get curriculum with progress
      let curriculum: any[] = [];
      let progressTutorId = null;

      if (role === 'student' && enrollment.tutor_id) {
        progressTutorId = enrollment.tutor_id;
      } else if (role === 'tutor') {
        progressTutorId = userId;
      }

      if (progressTutorId) {
        const curriculumRes = await pool.query(
          `SELECT c.*, COALESCE(cp.is_completed, false) as is_completed
           FROM curriculum c
           LEFT JOIN curriculum_progress cp ON c.id = cp.curriculum_id AND cp.tutor_id = $1
           WHERE c.course_id = $2
           ORDER BY c.order_index ASC`,
          [progressTutorId, courseId]
        );
        curriculum = curriculumRes.rows;
      } else {
        const curriculumRes = await pool.query(
          "SELECT *, false as is_completed FROM curriculum WHERE course_id = $1 ORDER BY order_index ASC",
          [courseId]
        );
        curriculum = curriculumRes.rows;
      }

      // Get course info (for timetable)
      const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [courseId]);

      res.json({
        enrollment,
        course: courseRes.rows[0],
        recordings,
        assignments,
        curriculum
      });
    } catch (error) {
      next(error);
    }
  }

  static async createComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.id;
      const { courseId, subject, message } = req.body;
      const result = await pool.query(
        `INSERT INTO complains (user_id, course_id, subject, message) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [studentId, courseId || null, subject, message]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // --- TUTOR PORTAL ---

  static async getTutorStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = req.user?.id;
      const result = await pool.query(
        `SELECT e.id as enrollment_id, e.course_id, c.title as course_title,
                u.id as student_id, u.first_name, u.last_name, u.email
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN users u ON e.student_id = u.id
         WHERE e.tutor_id = $1`,
        [tutorId]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async getTutorCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = req.user?.id;
      const result = await pool.query(
        `SELECT c.*,
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.tutor_id = $1) as student_count,
                (SELECT COUNT(*) FROM class_recordings r WHERE r.course_id = c.id AND r.tutor_id = $1) as recording_count,
                (SELECT COUNT(*) FROM curriculum WHERE course_id = c.id) as total_topics,
                (SELECT COUNT(*) FROM curriculum_progress cp 
                 JOIN curriculum curr ON cp.curriculum_id = curr.id
                 WHERE curr.course_id = c.id AND cp.tutor_id = $1 AND cp.is_completed = true) as completed_topics
         FROM courses c
         JOIN tutor_courses tc ON c.id = tc.course_id
         WHERE tc.tutor_id = $1`,
        [tutorId]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async setTutorCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = req.user?.id;
      const { courseId } = req.body;

      // Check if tutor already has any course
      const existing = await pool.query("SELECT * FROM tutor_courses WHERE tutor_id = $1", [tutorId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: "You can only manage one course at a time. Please contact admin to change your course." });
      }

      const result = await pool.query(
        `INSERT INTO tutor_courses (tutor_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (tutor_id, course_id) DO NOTHING
         RETURNING *`,
        [tutorId, courseId]
      );
      res.status(201).json(result.rows[0] || { message: "Already assigned" });
    } catch (error) {
      next(error);
    }
  }

  static async createRemark(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = req.user?.id;
      const { studentId, courseId, remarkText } = req.body;
      const result = await pool.query(
        `INSERT INTO remarks (tutor_id, student_id, course_id, remark_text)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [tutorId, studentId, courseId, remarkText]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // --- ADMIN PORTAL ---

  static async getAdminStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      const result = await pool.query(
        `SELECT e.id as enrollment_id, u.id as student_id, u.first_name as student_first_name, u.last_name as student_last_name, 
                c.id as course_id, c.title as course_title, e.status, e.payment_plan, 
                t.id as tutor_id, t.first_name as tutor_first_name, t.last_name as tutor_last_name,
                e.next_payment_due, e.created_at, e.total_paid
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         JOIN courses c ON e.course_id = c.id
         LEFT JOIN users t ON e.tutor_id = t.id
         WHERE ($1::int IS NULL OR e.course_id = $1)
         ORDER BY e.created_at DESC`,
        [courseId || null]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pool.query(
        `SELECT cp.*, u.first_name, u.last_name, u.email, c.title as course_title
         FROM complains cp
         JOIN users u ON cp.user_id = u.id
         LEFT JOIN courses c ON cp.course_id = c.id
         ORDER BY cp.created_at DESC`
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminRemarks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pool.query(
        `SELECT r.*, 
                t.first_name as tutor_first_name, t.last_name as tutor_last_name,
                s.first_name as student_first_name, s.last_name as student_last_name,
                c.title as course_title
         FROM remarks r
         JOIN users t ON r.tutor_id = t.id
         JOIN users s ON r.student_id = s.id
         JOIN courses c ON r.course_id = c.id
         ORDER BY r.created_at DESC`
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminTutors(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      const result = await pool.query(
        `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email 
         FROM users u
         LEFT JOIN tutor_courses tc ON u.id = tc.tutor_id
         WHERE u.role = 'tutor'
         AND ($1::int IS NULL OR tc.course_id = $1)`,
        [courseId || null]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminTutorDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { tutorId } = req.params;
      const tutorRes = await pool.query(
        "SELECT id, first_name, last_name, email FROM users WHERE id = $1 AND role = 'tutor'",
        [tutorId]
      );
      
      if (tutorRes.rows.length === 0) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      
      const studentsRes = await pool.query(
        `SELECT e.id as enrollment_id, u.id as student_id, u.first_name, u.last_name, u.email,
                c.title as course_title, e.status
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         JOIN courses c ON e.course_id = c.id
         WHERE e.tutor_id = $1`,
        [tutorId]
      );
      
      res.json({
        tutor: tutorRes.rows[0],
        students: studentsRes.rows
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignTutor(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId, tutorId } = req.body;
      const result = await pool.query(
        `UPDATE enrollments SET tutor_id = $1 WHERE id = $2 RETURNING *`,
        [tutorId, enrollmentId]
      );
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async adminAssignTutorCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { tutorId, courseId } = req.body;
      const result = await pool.query(
        `INSERT INTO tutor_courses (tutor_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (tutor_id, course_id) DO NOTHING
         RETURNING *`,
        [tutorId, courseId]
      );
      res.status(201).json(result.rows[0] || { message: "Already assigned" });
    } catch (error) {
      next(error);
    }
  }

  static async adminGetTutorCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { tutorId } = req.params;
      const result = await pool.query(
        `SELECT c.* FROM courses c
         JOIN tutor_courses tc ON c.id = tc.course_id
         WHERE tc.tutor_id = $1`,
        [tutorId]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async adminRemoveTutorCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { tutorId, courseId } = req.params;
      await pool.query(
        `DELETE FROM tutor_courses WHERE tutor_id = $1 AND course_id = $2`,
        [tutorId, courseId]
      );
      res.json({ message: "Course unassigned successfully" });
    } catch (error) {
      next(error);
    }
  }

  // --- CURRICULUM ---

  static async toggleCurriculumProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const tutorId = req.user?.id;
      const { curriculumId, isCompleted } = req.body;
      
      const result = await pool.query(
        `INSERT INTO curriculum_progress (tutor_id, curriculum_id, is_completed, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (tutor_id, curriculum_id) 
         DO UPDATE SET is_completed = $3, updated_at = NOW()
         RETURNING *`,
        [tutorId, curriculumId, isCompleted]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async getCurriculum(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const tutorId = req.user?.id; // If signed in as tutor, we can show their progress
      
      let query;
      let params;

      if (req.user?.role === 'tutor') {
        query = `SELECT c.*, COALESCE(cp.is_completed, false) as is_completed
                 FROM curriculum c
                 LEFT JOIN curriculum_progress cp ON c.id = cp.curriculum_id AND cp.tutor_id = $1
                 WHERE c.course_id = $2
                 ORDER BY c.order_index ASC`;
        params = [tutorId, courseId];
      } else {
        query = "SELECT *, false as is_completed FROM curriculum WHERE course_id = $1 ORDER BY order_index ASC";
        params = [courseId];
      }

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async addCurriculumItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, title, content, orderIndex } = req.body;
      const result = await pool.query(
        `INSERT INTO curriculum (course_id, title, content, order_index) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [courseId, title, content, orderIndex || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async updateCurriculumItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content, orderIndex } = req.body;
      const result = await pool.query(
        `UPDATE curriculum 
         SET title = $1, content = $2, order_index = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [title, content, orderIndex, id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCurriculumItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM curriculum WHERE id = $1", [id]);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
