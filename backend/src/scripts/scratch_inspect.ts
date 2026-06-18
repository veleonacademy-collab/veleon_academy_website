import { pool } from "../database/pool.js";

async function inspectDb() {
  try {
    console.log("=== COURSES ===");
    const courses = await pool.query("SELECT id, title, slug FROM courses");
    console.table(courses.rows);

    console.log("=== FOLDERS ===");
    const folders = await pool.query("SELECT id, course_id, name FROM folders");
    console.table(folders.rows);

    console.log("=== CLASSES ===");
    const classes = await pool.query("SELECT id, folder_id, name FROM classes");
    console.table(classes.rows);

    console.log("=== RECORDINGS FOR COURSE 6 ===");
    const recordings = await pool.query("SELECT id, title, cohort, video_url FROM class_recordings WHERE course_id = 6 ORDER BY cohort, title");
    console.table(recordings.rows);

    console.log("=== ASSIGNMENTS FOR COURSE 6 ===");
    const assignments = await pool.query("SELECT id, title, description, cohort FROM assignments WHERE course_id = 6 ORDER BY cohort, title");
    console.table(assignments.rows);

    process.exit(0);
  } catch (error) {
    console.error("Failed to inspect DB:", error);
    process.exit(1);
  }
}

inspectDb();
