import { Request, Response, NextFunction } from "express";
import { AcademyService } from "../services/academyService.js";
import { pool } from "../database/pool.js";
import { sendRecordingNotificationEmail, sendAssignmentNotificationEmail } from "../services/emailService.js";

export class AcademyController {
  // --- COURSE MANAGEMENT (Admin/Tutor) ---
  
  static async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { all } = req.query;
      const queryStr = all === "true" 
        ? "SELECT * FROM courses ORDER BY created_at DESC" 
        : "SELECT * FROM courses WHERE COALESCE(is_hidden, false) = false ORDER BY created_at DESC";
      
      const result = await pool.query(queryStr);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, price, thumbnail_url } = req.body;
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const result = await pool.query(
        `INSERT INTO courses (title, slug, description, price, thumbnail_url) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [title, slug, description, price, thumbnail_url]
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
      
      let slug = undefined;
      if (title) {
        slug = title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      const result = await pool.query(
        `UPDATE courses 
         SET title = $1, slug = COALESCE($2, slug), description = $3, price = $4, thumbnail_url = $5, timetable_url = $6, updated_at = NOW()
         WHERE id = $7 RETURNING *`,
        [title, slug, description, price, thumbnail_url, timetable_url, id]
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
      const { courseId, title, videoUrl, cohort } = req.body;
      const tutorId = req.user?.id;

      const result = await pool.query(
        `INSERT INTO class_recordings (course_id, tutor_id, title, video_url, cohort) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [courseId, tutorId, title, videoUrl, cohort || null]
      );

      const recording = result.rows[0];

      // Get course info for email
      const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [courseId]);
      const courseTitle = courseRes.rows[0]?.title;

      // Notify enrolled students (filter by cohort if provided)
      const cohortVal = (cohort && cohort !== "null" && cohort !== "undefined" && cohort !== "") ? cohort : null;
      const studentsQuery = cohortVal
        ? `SELECT u.email, u.first_name 
           FROM enrollments e 
           JOIN users u ON e.student_id = u.id 
           WHERE e.course_id = $1 AND e.cohort = $2`
        : `SELECT u.email, u.first_name 
           FROM enrollments e 
           JOIN users u ON e.student_id = u.id 
           WHERE e.course_id = $1`;
      const studentsParams = cohortVal ? [courseId, cohortVal] : [courseId];

      const studentsRes = await pool.query(studentsQuery, studentsParams);

      // Notify all enrolled students (Non-blocking)
      const notifyStudents = async () => {
        for (const student of studentsRes.rows) {
          try {
            await sendRecordingNotificationEmail(student.email, student.first_name, courseTitle, title, videoUrl);
          } catch (err) {
            console.error(`Failed to send recording email to ${student.email}:`, err);
          }
        }
      };
      notifyStudents();

      res.status(201).json(recording);
    } catch (error) {
      next(error);
    }
  }

  // --- ASSIGNMENTS ---

  static async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, title, description, fileUrl, dueDate, cohort } = req.body;
      const tutorId = req.user?.id;

      const result = await pool.query(
        `INSERT INTO assignments (course_id, tutor_id, title, description, file_url, due_date, cohort) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [courseId, tutorId, title, description, fileUrl, dueDate, cohort || null]
      );
      const assignment = result.rows[0];

      // Notify all enrolled students
      try {
        const courseRes = await pool.query("SELECT title FROM courses WHERE id = $1", [courseId]);
        const courseTitle = courseRes.rows[0]?.title || "Course";

        const cohortVal = (cohort && cohort !== "null" && cohort !== "undefined" && cohort !== "") ? cohort : null;
        const studentsQuery = cohortVal
          ? `SELECT u.email, u.first_name 
             FROM enrollments e 
             JOIN users u ON e.student_id = u.id 
             WHERE e.course_id = $1 AND e.cohort = $2`
          : `SELECT u.email, u.first_name 
             FROM enrollments e 
             JOIN users u ON e.student_id = u.id 
             WHERE e.course_id = $1`;
        const studentsParams = cohortVal ? [courseId, cohortVal] : [courseId];

        const studentsRes = await pool.query(studentsQuery, studentsParams);

        // Notify all enrolled students (Non-blocking)
        const notifyStudents = async () => {
          for (const student of studentsRes.rows) {
            try {
              await sendAssignmentNotificationEmail(student.email, student.first_name, courseTitle, title, dueDate);
            } catch (err) {
              console.error(`Failed to send assignment email to ${student.email}:`, err);
            }
          }
        };
        notifyStudents();
      } catch (err) {
        console.error(`Failed to send assignment notifications: ${err}`);
      }

      res.status(201).json(assignment);
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

      if (role === 'student' || role === 'user') {
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

      let cohortFilter: any = req.query.cohort || undefined;
      if (cohortFilter === "null" || cohortFilter === "undefined" || cohortFilter === "") {
        cohortFilter = undefined;
      }
      if (!cohortFilter && (role === 'student' || role === 'user')) {
        cohortFilter = enrollment?.cohort || undefined;
      }

      const recordings = await AcademyService.getCourseRecordings(parseInt(courseId), cohortFilter);
      const assignments = await AcademyService.getCourseAssignments(parseInt(courseId), cohortFilter);

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
        `SELECT e.id as enrollment_id, e.course_id, c.title as course_title, e.cohort,
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
        `WITH tutor_course_cohorts AS (
           SELECT DISTINCT 
             e.course_id, 
             e.cohort
           FROM enrollments e
           WHERE e.tutor_id = $1
           
           UNION
           
           SELECT 
             tc.course_id, 
             NULL as cohort
           FROM tutor_courses tc
           WHERE tc.tutor_id = $1
         )
         SELECT 
           c.id,
           c.title,
           c.description,
           c.price,
           c.thumbnail_url,
           c.timetable_url,
           tcc.cohort,
           (
             SELECT COUNT(*) 
             FROM enrollments e 
             WHERE e.course_id = c.id 
               AND e.tutor_id = $1 
               AND (
                 (tcc.cohort IS NULL AND e.cohort IS NULL) 
                 OR (tcc.cohort IS NOT NULL AND e.cohort = tcc.cohort)
               )
           ) as student_count,
           (
             SELECT COUNT(*) 
             FROM class_recordings r 
             WHERE r.course_id = c.id 
               AND (
                 (r.tutor_id = $1 AND (r.cohort IS NULL OR r.cohort = tcc.cohort))
               )
           ) as recording_count,
           (
             SELECT COUNT(*) 
             FROM curriculum 
             WHERE course_id = c.id
           ) as total_topics,
           (
             SELECT COUNT(*) 
             FROM curriculum_progress cp 
             JOIN curriculum curr ON cp.curriculum_id = curr.id
             WHERE curr.course_id = c.id 
               AND cp.tutor_id = $1 
               AND cp.is_completed = true
           ) as completed_topics
         FROM tutor_course_cohorts tcc
         JOIN courses c ON tcc.course_id = c.id
         ORDER BY c.title ASC, tcc.cohort ASC`,
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
                e.next_payment_due, e.created_at, e.total_paid,
                e.custom_price, c.price as base_price, e.portal_locked, e.cohort,
                u.email as student_email
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

  // --- FINANCE & TRANSACTIONS ---

  static async getAdminFinanceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await pool.query(`
        SELECT 
          COALESCE(SUM(total_paid), 0) as total_revenue,
          COUNT(DISTINCT student_id) as total_students,
          COUNT(*) as total_enrollments
        FROM enrollments
      `);
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }

  static async getAdminTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, enrollmentId } = req.query;
      let query = `
        SELECT t.*, u.first_name, u.last_name, u.email, c.title as course_title
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN enrollments e ON t.enrollment_id = e.id
        LEFT JOIN courses c ON e.course_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (studentId) {
        params.push(studentId);
        query += ` AND t.user_id = $${params.length}`;
      }
      if (enrollmentId) {
        params.push(enrollmentId);
        query += ` AND t.enrollment_id = $${params.length}`;
      }

      query += " ORDER BY t.created_at DESC";
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }

  static async adminEnrollUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        userId, 
        courseId, 
        cohort, 
        paymentPlan, 
        customPrice, 
        amountPaid, 
        nextPaymentDue,
        installmentsTotal = 3
      } = req.body;
      
      if (!userId || !courseId) {
        return res.status(400).json({ message: "userId and courseId are required" });
      }

      // Check if user exists
      const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if course exists
      const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [courseId]);
      if (courseRes.rows.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      const course = courseRes.rows[0];

      // Final price override
      const finalPrice = customPrice !== undefined ? Number(customPrice) : Number(course.price);

      // Log manual transaction
      const providerPaymentId = `manual-admin-${userId}-${Date.now()}`;
      const txResult = await pool.query(
        `INSERT INTO transactions (user_id, amount, currency, status, type, provider, provider_payment_id, provider_checkout_id)
         VALUES ($1, $2, 'NGN', 'succeeded', $3, 'manual', $4, $4) RETURNING id`,
        [userId, Number(amountPaid) || 0, paymentPlan || 'one-time', providerPaymentId]
      );
      const transactionId = txResult.rows[0].id;

      // Enroll student
      const enrollmentId = await AcademyService.enrollStudent({
        studentId: userId,
        courseId,
        paymentPlan: paymentPlan || 'one-time',
        amountPaid: Number(amountPaid) || 0,
        customPrice: finalPrice,
        cohort: cohort || null,
        nextPaymentDue: nextPaymentDue || null,
        installmentsTotal
      });

      // Link enrollment_id to transaction
      await pool.query(
        `UPDATE transactions SET enrollment_id = $1 WHERE id = $2`,
        [enrollmentId, transactionId]
      );

      // If installment plan, set up installments
      if (paymentPlan === "installment") {
        // Mark first installment as paid
        await pool.query(
          `INSERT INTO installments (transaction_id, installment_number, total_installments, amount, due_date, status, provider_payment_id)
           VALUES ($1, 1, $2, $3, NOW(), 'paid', $4)`,
          [transactionId, installmentsTotal, Number(amountPaid) || 0, providerPaymentId]
        );

        // Create remaining pending installments
        const remainingInstallments = installmentsTotal - 1;
        if (remainingInstallments > 0) {
          let remainingAmount = finalPrice - (Number(amountPaid) || 0);
          if (remainingAmount < 0) remainingAmount = 0;
          const perInstallmentAmount = remainingAmount / remainingInstallments;
          const daysPerInstallment = Math.floor(90 / installmentsTotal);

          for (let i = 2; i <= installmentsTotal; i++) {
            const dueDate = new Date();
            if (i === 2 && nextPaymentDue) {
              dueDate.setTime(Date.parse(nextPaymentDue));
            } else {
              dueDate.setDate(dueDate.getDate() + (daysPerInstallment * (i - 1)));
            }

            await pool.query(
              `INSERT INTO installments (transaction_id, installment_number, total_installments, amount, due_date, status)
               VALUES ($1, $2, $3, $4, $5, 'pending')`,
              [transactionId, i, installmentsTotal, perInstallmentAmount, dueDate]
            );
          }
        }
      }

      res.status(200).json({ message: "User enrolled successfully", enrollmentId });
    } catch (error) {
      next(error);
    }
  }
}
