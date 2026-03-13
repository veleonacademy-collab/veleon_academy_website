
import { pool } from "../database/pool.js";

async function migrateRoles() {
  console.log("Starting migration: user -> student");
  
  try {
    const result = await pool.query(
      "UPDATE users SET role = 'student' WHERE role = 'user' RETURNING id, email"
    );
    
    console.log(`Successfully updated ${result.rowCount} users from 'user' to 'student'.`);
    if (result.rows.length > 0) {
      console.log("Updated users:", result.rows.map(u => u.email).join(", "));
    }
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrateRoles();
