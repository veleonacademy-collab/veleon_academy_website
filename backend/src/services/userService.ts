import { pool } from "../database/pool.js";
import { PublicUser, User } from "../models/user.js";
import { toPublicUser } from "../models/user.js";
import { randomBytes } from "crypto";
import { hashPassword } from "../utils/password.js";
import { sendStudentWelcomeEmail } from "./emailService.js";

export async function getAllUsers(): Promise<PublicUser[]> {
  const result = await pool.query<User>(`
    SELECT 
      u.*,
      e.cohort as cohort,
      COUNT(t.id) as tasks_assigned,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed
    FROM users u
    LEFT JOIN tasks t ON u.id = t.assigned_to
    LEFT JOIN enrollments e ON u.id = e.student_id
    GROUP BY u.id, e.cohort
    ORDER BY u.created_at DESC
  `);
  return result.rows.map(toPublicUser);
}

export async function updateUserRole(id: number, role: string): Promise<PublicUser> {
  const allowedRoles = ["admin", "tutor", "student"];
  if (!allowedRoles.includes(role)) {
    const error = new Error("Invalid role.");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await pool.query<User>(
    `
      UPDATE users
      SET role = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [role, id]
  );

  const user = result.rows[0];
  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function updateUserStatus(id: number, status: string): Promise<PublicUser> {
  const allowedStatuses = ["active", "disabled"];
  if (!allowedStatuses.includes(status)) {
    const error = new Error("Invalid status.");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await pool.query<User>(
    `
      UPDATE users
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
    [status, id]
  );

  const user = result.rows[0];
  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function getUserTransactions(userId: number) {
  const result = await pool.query(
    `
    SELECT 
      id, amount, currency, status, type, provider, created_at
    FROM transactions
    WHERE user_id = $1 AND status = 'succeeded'
    ORDER BY created_at DESC
    `,
    [userId]
  );
  return result.rows;
}

export async function getUserTasks(userId: number) {
  // Link User -> Customer (via email) -> Tasks
  const result = await pool.query(
    `
    SELECT 
      t.*, 
      c.name as customer_name,
      (
        SELECT json_agg(
          json_build_object(
            'installment_number', i.installment_number,
            'amount', i.amount,
            'due_date', i.due_date,
            'status', i.status
          ) ORDER BY i.installment_number
        )
        FROM installments i
        WHERE i.transaction_id = t.transaction_id
      ) as installments
    FROM tasks t
    JOIN customers c ON t.customer_id = c.id
    JOIN users u ON c.email = u.email
    WHERE u.id = $1
    ORDER BY t.created_at DESC
    `,
    [userId]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    category: row.category,
    status: row.status,
    totalAmount: row.total_amount,
    amountPaid: row.amount_paid,
    startDate: row.start_date,
    deadline: row.deadline,
    dueDate: row.due_date,
    notes: row.notes,
    productionNotes: row.production_notes,
    quantity: row.quantity,
    deliveryDestination: row.delivery_destination,
    createdAt: row.created_at,
    transactionId: row.transaction_id,
    installments: row.installments || []
  }));
}

export async function deleteUser(id: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get user details to see if customer_id exists
    const userRes = await client.query("SELECT customer_id FROM users WHERE id = $1", [id]);
    const user = userRes.rows[0];
    if (!user) {
      const error = new Error("User not found.");
      (error as any).statusCode = 404;
      throw error;
    }

    // 2. Delete user (cascades automatically to enrollments, tutor_courses, etc.)
    await client.query("DELETE FROM users WHERE id = $1", [id]);

    // 3. Delete customer if exists (cascades to tasks)
    if (user.customer_id) {
      await client.query("DELETE FROM customers WHERE id = $1", [user.customer_id]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateUserEmail(id: number, email: string): Promise<PublicUser> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = new Error("Invalid email address.");
    (error as any).statusCode = 400;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if email already in use by another user
    const existing = await client.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, id]);
    if (existing.rows.length > 0) {
      const error = new Error("Email is already in use by another account.");
      (error as any).statusCode = 400;
      throw error;
    }

    // Update user's email
    const userRes = await client.query<User>(
      `
      UPDATE users
      SET email = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [email, id]
    );

    const user = userRes.rows[0];
    if (!user) {
      const error = new Error("User not found.");
      (error as any).statusCode = 404;
      throw error;
    }

    // Update customer's email if linked
    if (user.customer_id) {
      await client.query(
        `
        UPDATE customers
        SET email = $1, updated_at = NOW()
        WHERE id = $2
        `,
        [email, user.customer_id]
      );
    }

    await client.query("COMMIT");

    // Fetch the updated user with full details
    const finalResult = await pool.query<User & { phone: string | null; dob: Date | null }>(
      `
      SELECT u.*, c.phone, c.dob
      FROM users u
      LEFT JOIN customers c ON u.customer_id = c.id
      WHERE u.id = $1
      `,
      [id]
    );

    return toPublicUser(finalResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function resendUserCredentials(id: number): Promise<void> {
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  const user = result.rows[0];

  if (!user) {
    const error = new Error("User not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  // Generate new random 8-character temporary password
  const tempPassword = randomBytes(4).toString("hex");
  const passwordHash = await hashPassword(tempPassword);

  // Update password in DB
  await pool.query(
    `
    UPDATE users
    SET password_hash = $1, updated_at = NOW()
    WHERE id = $2
    `,
    [passwordHash, id]
  );

  // Send the credentials welcome email
  await sendStudentWelcomeEmail(user.email, tempPassword, user.first_name);
}
