import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

export class AcademyService {
  /**
   * Enrolls a student in a course or updates existing enrollment
   */
  static async enrollStudent(payload: {
    studentId: number;
    courseId: number;
    paymentPlan: "one-time" | "installment";
    amountPaid: number;
    installmentsTotal?: number;
  }) {
    const { studentId, courseId, paymentPlan, amountPaid, installmentsTotal = 1 } = payload;

    // Upgrade role to student if they are currently just a base 'user'
    await pool.query(
        "UPDATE users SET role = 'student' WHERE id = $1 AND role = 'user'",
        [studentId]
    );

    // Check if enrollment exists
    const existing = await pool.query(
      "SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2",
      [studentId, courseId]
    );

    if (existing.rows.length > 0) {
      const enrollment = existing.rows[0];
      const newTotalPaid = Number(enrollment.total_paid) + amountPaid;
      
      // Calculate next payment due based on 3-month (90 day) cap
      let nextPaymentDue = enrollment.next_payment_due;
      if (paymentPlan === "installment") {
        const totalInstallments = Number(enrollment.installments_total) || 3;
        const daysPerInstallment = Math.floor(90 / totalInstallments);
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysPerInstallment);
        nextPaymentDue = nextDate.toISOString();
      }

      await pool.query(
        `UPDATE enrollments 
         SET total_paid = $1, next_payment_due = $2, portal_locked = false, updated_at = NOW(),
             installments_paid = installments_paid + 1 
         WHERE id = $3`,
        [newTotalPaid, nextPaymentDue, enrollment.id]
      );
      
      return enrollment.id;
    } else {
      // Create new enrollment
      let nextPaymentDue: string | null = null;
      if (paymentPlan === "installment") {
        const totalInstallments = Number(installmentsTotal) || 3;
        const daysPerInstallment = Math.floor(90 / totalInstallments);
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysPerInstallment);
        nextPaymentDue = nextDate.toISOString();
      }

      const result = await pool.query(
        `INSERT INTO enrollments (student_id, course_id, payment_plan, total_paid, next_payment_due, installments_total, installments_paid)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [studentId, courseId, paymentPlan, amountPaid, nextPaymentDue, installmentsTotal, paymentPlan === "installment" ? 1 : 1]
      );
      
      return result.rows[0].id;
    }
  }

  /**
   * Checks for overdue installments and locks portals
   */
  static async processOverdueInstallments() {
    logger.info("Processing overdue installments...");
    
    // One week grace period
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 7);

    const result = await pool.query(
      `UPDATE enrollments 
       SET portal_locked = true 
       WHERE payment_plan = 'installment' 
         AND next_payment_due < $1 
         AND portal_locked = false
       RETURNING student_id`,
      [gracePeriodEnd.toISOString()]
    );

    logger.info(`Locked portals for ${result.rowCount} students.`);
  }

  static async getStudentDashboard(studentId: number) {
    // 1. Get Enrollments with progress stats + installment info
    const enrollmentsRes = await pool.query(
      `SELECT 
        e.id,
        e.student_id as "studentId",
        e.course_id as "courseId",
        e.payment_plan as "paymentPlan",
        e.total_paid as "totalPaid",
        e.next_payment_due as "nextPaymentDue",
        e.portal_locked as "portalLocked",
        e.created_at as "createdAt",
        e.tutor_id as "tutorId",
        e.installments_total as "installmentsTotal",
        e.installments_paid as "installmentsPaid",
        c.title as course_title, 
        c.thumbnail_url,
        c.price as course_price,
        c.timetable_url,
        (SELECT COUNT(*) FROM curriculum WHERE course_id = c.id) as total_topics,
        (SELECT COUNT(*) FROM curriculum_progress cp 
         JOIN curriculum curr ON cp.curriculum_id = curr.id
         WHERE curr.course_id = c.id AND cp.tutor_id = e.tutor_id AND cp.is_completed = true) as completed_topics,
        (SELECT t.id FROM transactions t
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC LIMIT 1) as "latestTransactionId"
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1`,
      [studentId]
    );

    // 2. Get Recent Transactions
    const transactionsRes = await pool.query(
      `SELECT t.*, c.title as course_title
       FROM transactions t
       LEFT JOIN enrollments e ON t.enrollment_id = e.id
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [studentId]
    );

    // 3. Calculate Stats
    const stats = {
      totalPaid: enrollmentsRes.rows.reduce((sum: number, e: any) => sum + Number(e.totalPaid), 0),
      nextPaymentDate: enrollmentsRes.rows
        .filter((e: any) => e.nextPaymentDue)
        .sort((a: any, b: any) => new Date(a.nextPaymentDue).getTime() - new Date(b.nextPaymentDue).getTime())[0]?.nextPaymentDue || null,
      totalRemaining: enrollmentsRes.rows.reduce((sum: number, e: any) => sum + Math.max(0, Number(e.course_price) - Number(e.totalPaid)), 0),
      nextPaymentAmount: enrollmentsRes.rows
        .filter((e: any) => e.nextPaymentDue && Number(e.installmentsTotal) > Number(e.installmentsPaid))
        .map((e: any) => (Number(e.course_price) - Number(e.totalPaid)) / Math.max(1, (Number(e.installmentsTotal) - Number(e.installmentsPaid))))
        .reduce((sum: number, amt: number) => sum + amt, 0)
    };

    return {
      enrollments: enrollmentsRes.rows,
      transactions: transactionsRes.rows,
      stats
    };
  }

  /**
   * Get recordings for a course
   */
  static async getCourseRecordings(courseId: number) {
    const result = await pool.query(
      "SELECT * FROM class_recordings WHERE course_id = $1 ORDER BY recording_date DESC",
      [courseId]
    );
    return result.rows;
  }

  /**
   * Get assignments for a course
   */
  static async getCourseAssignments(courseId: number) {
    const result = await pool.query(
      "SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at DESC",
      [courseId]
    );
    return result.rows;
  }
}
