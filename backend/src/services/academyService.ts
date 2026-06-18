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
    customPrice?: number;
    cohort?: string;
    nextPaymentDue?: string;
  }) {
    const { 
      studentId, 
      courseId, 
      paymentPlan, 
      amountPaid, 
      installmentsTotal = 1,
      customPrice,
      cohort,
      nextPaymentDue: passedNextPaymentDue
    } = payload;

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
      let nextPaymentDue = passedNextPaymentDue || enrollment.next_payment_due;
      if (!passedNextPaymentDue && paymentPlan === "installment") {
        const totalInstallments = Number(enrollment.installments_total) || 3;
        const daysPerInstallment = Math.floor(90 / totalInstallments);
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysPerInstallment);
        nextPaymentDue = nextDate.toISOString();
      }

      await pool.query(
        `UPDATE enrollments 
         SET total_paid = $1, next_payment_due = $2, portal_locked = false, updated_at = NOW(),
             installments_paid = installments_paid + 1,
             custom_price = COALESCE($4, custom_price),
             cohort = COALESCE($5, cohort)
         WHERE id = $3`,
        [newTotalPaid, nextPaymentDue, enrollment.id, customPrice, cohort]
      );
      
      return enrollment.id;
    } else {
      // Create new enrollment
      let nextPaymentDue: string | null = passedNextPaymentDue || null;
      if (!passedNextPaymentDue && paymentPlan === "installment") {
        const totalInstallments = Number(installmentsTotal) || 3;
        const daysPerInstallment = Math.floor(90 / totalInstallments);
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysPerInstallment);
        nextPaymentDue = nextDate.toISOString();
      }

      const result = await pool.query(
        `INSERT INTO enrollments (student_id, course_id, payment_plan, total_paid, next_payment_due, installments_total, installments_paid, custom_price, cohort)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [studentId, courseId, paymentPlan, amountPaid, nextPaymentDue, installmentsTotal, paymentPlan === "installment" ? 1 : 1, customPrice, cohort]
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

  /**
   * Processes payment reminders for users who signed up but haven't enrolled
   */
  static async processPaymentReminders() {
    logger.info("Processing payment reminders...");
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 3 days (24h + 48h)

    const { sendPaymentReminderEmail } = await import("./emailService.js");

    // 1. Check for 72h reminders (Latest stage, highest priority)
    const due72h = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.metadata FROM users u
       LEFT JOIN enrollments e ON u.id = e.student_id
       WHERE e.id IS NULL 
         AND u.role = 'student'
         AND u.created_at <= $1 
         AND (u.metadata->>'reminder_72h_sent' IS NULL OR u.metadata->>'reminder_72h_sent' = 'false')`,
      [seventyTwoHoursAgo.toISOString()]
    );

    for (const user of due72h.rows) {
      try {
        await sendPaymentReminderEmail(user.email, user.first_name, "72h");
        const newMetadata = { 
          ...(user.metadata || {}), 
          reminder_72h_sent: true, 
          reminder_24h_sent: true, 
          reminder_1h_sent: true 
        };
        await pool.query("UPDATE users SET metadata = $1 WHERE id = $2", [JSON.stringify(newMetadata), user.id]);
        logger.info(`Sent 72h ultra-urgent reminder to ${user.email}`);
      } catch (err) {
        logger.error(`Failed to send 72h reminder to ${user.email}`, err);
      }
    }

    // 2. Check for 24h reminders
    const due24h = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.metadata FROM users u
       LEFT JOIN enrollments e ON u.id = e.student_id
       WHERE e.id IS NULL 
         AND u.role = 'student'
         AND u.created_at <= $1 
         AND (u.metadata->>'reminder_24h_sent' IS NULL OR u.metadata->>'reminder_24h_sent' = 'false')
         AND (u.metadata->>'reminder_72h_sent' IS NULL OR u.metadata->>'reminder_72h_sent' = 'false')`,
      [twentyFourHoursAgo.toISOString()]
    );

    for (const user of due24h.rows) {
      try {
        await sendPaymentReminderEmail(user.email, user.first_name, "24h");
        const newMetadata = { ...(user.metadata || {}), reminder_24h_sent: true, reminder_1h_sent: true };
        await pool.query("UPDATE users SET metadata = $1 WHERE id = $2", [JSON.stringify(newMetadata), user.id]);
        logger.info(`Sent 24h reminder to ${user.email}`);
      } catch (err) {
        logger.error(`Failed to send 24h reminder to ${user.email}`, err);
      }
    }

    // 3. Check for 1h reminders
    const due1h = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.metadata FROM users u
       LEFT JOIN enrollments e ON u.id = e.student_id
       WHERE e.id IS NULL
         AND u.role = 'student'
         AND u.created_at <= $1 
         AND (u.metadata->>'reminder_1h_sent' IS NULL OR u.metadata->>'reminder_1h_sent' = 'false')
         AND (u.metadata->>'reminder_24h_sent' IS NULL OR u.metadata->>'reminder_24h_sent' = 'false')`,
      [oneHourAgo.toISOString()]
    );

    for (const user of due1h.rows) {
      try {
        await sendPaymentReminderEmail(user.email, user.first_name, "1h");
        const newMetadata = { ...(user.metadata || {}), reminder_1h_sent: true };
        await pool.query("UPDATE users SET metadata = $1 WHERE id = $2", [JSON.stringify(newMetadata), user.id]);
        logger.info(`Sent 1h reminder to ${user.email}`);
      } catch (err) {
        logger.error(`Failed to send 1h reminder to ${user.email}`, err);
      }
    }
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
        e.cohort as "cohort",
        c.title as course_title, 
        c.thumbnail_url,
        COALESCE(e.custom_price, c.price) as course_price,
        c.price as base_price,
        e.custom_price as custom_price,
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
  static async getCourseRecordings(courseId: number, cohort?: string) {
    const query = cohort
      ? "SELECT * FROM class_recordings WHERE course_id = $1 AND (cohort IS NULL OR cohort = $2) ORDER BY recording_date DESC"
      : "SELECT * FROM class_recordings WHERE course_id = $1 ORDER BY recording_date DESC";
    const params = cohort ? [courseId, cohort] : [courseId];

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get assignments for a course
   */
  static async getCourseAssignments(courseId: number, cohort?: string) {
    const query = cohort
      ? "SELECT * FROM assignments WHERE course_id = $1 AND (cohort IS NULL OR cohort = $2) ORDER BY created_at DESC"
      : "SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at DESC";
    const params = cohort ? [courseId, cohort] : [courseId];

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get nested course folders, classes, recordings, and assignments
   */
  static async getCourseFoldersAndClasses(courseId: number, cohort?: string) {
    // 1. Get all folders for the course (filtered by cohort if provided)
    const foldersQuery = cohort
      ? "SELECT * FROM folders WHERE course_id = $1 AND (cohort = '' OR cohort = $2) ORDER BY name ASC"
      : "SELECT * FROM folders WHERE course_id = $1 ORDER BY name ASC";
    const foldersParams = cohort ? [courseId, cohort] : [courseId];
    
    const foldersRes = await pool.query(foldersQuery, foldersParams);
    const folders = foldersRes.rows;

    // 2. Get all classes for these folders
    let classes: any[] = [];
    if (folders.length > 0) {
      const folderIds = folders.map((f: any) => f.id);
      const classesRes = await pool.query(
        "SELECT * FROM classes WHERE folder_id = ANY($1) ORDER BY name ASC",
        [folderIds]
      );
      classes = classesRes.rows;
    }

    // 3. Get all recordings and assignments for the course (filtered by cohort)
    const recordings = await this.getCourseRecordings(courseId, cohort);
    const assignments = await this.getCourseAssignments(courseId, cohort);

    // 4. Map recordings and assignments to classes
    const classMap = new Map<number, any>();
    for (const cls of classes) {
      cls.recordings = [];
      cls.assignments = [];
      classMap.set(cls.id, cls);
    }

    const unassignedRecordings: any[] = [];
    const unassignedAssignments: any[] = [];

    for (const rec of recordings) {
      if (rec.class_id && classMap.has(rec.class_id)) {
        classMap.get(rec.class_id).recordings.push(rec);
      } else {
        unassignedRecordings.push(rec);
      }
    }

    for (const assign of assignments) {
      if (assign.class_id && classMap.has(assign.class_id)) {
        classMap.get(assign.class_id).assignments.push(assign);
      } else {
        unassignedAssignments.push(assign);
      }
    }

    // 5. Map classes to folders
    const folderMap = new Map<number, any>();
    for (const f of folders) {
      f.classes = [];
      folderMap.set(f.id, f);
    }

    for (const cls of classes) {
      if (folderMap.has(cls.folder_id)) {
        folderMap.get(cls.folder_id).classes.push(cls);
      }
    }

    const structuredFolders = [...folders];

    // 6. Handle unassigned resources as a virtual folder/class for backward compatibility
    if (unassignedRecordings.length > 0 || unassignedAssignments.length > 0) {
      structuredFolders.push({
        id: -1,
        course_id: courseId,
        name: "General Materials",
        classes: [
          {
            id: -1,
            folder_id: -1,
            name: "General Class Resources",
            description: "General course materials and recordings",
            recordings: unassignedRecordings,
            assignments: unassignedAssignments
          }
        ]
      });
    }

    return structuredFolders;
  }
}

