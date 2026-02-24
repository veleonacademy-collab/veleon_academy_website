import { pool } from "../database/pool.js";

async function checkUsers() {
  const usersRes = await pool.query("SELECT id, email, first_name, role FROM users ORDER BY created_at DESC LIMIT 5");
  console.log("Recent users:", usersRes.rows);

  // If there's a user, enroll them as a student for demo
  if (usersRes.rows.length > 0) {
    const u = usersRes.rows[0];
    
    // update role just in case
    await pool.query("UPDATE users SET role = 'student' WHERE id = $1", [u.id]);
    
    const checkRes = await pool.query("SELECT * FROM enrollments WHERE student_id = $1", [u.id]);
    if (checkRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO enrollments (student_id, course_id, payment_plan, total_paid)
         VALUES ($1, 1, 'one-time', 150000)`,
        [u.id]
      );
      console.log(`✅ User ${u.email} enrolled as a Student in Course 1.`);
    } else {
      console.log(`User ${u.email} already has enrollments.`);
    }
  }

  await pool.end();
}

checkUsers().catch(console.error);
