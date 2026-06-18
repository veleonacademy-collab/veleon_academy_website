import { pool } from "../database/pool.js";

async function runDataMigration() {
  try {
    console.log("Starting data migration for Excel classes and assignments...");

    // 1. Get all cohorts present in the unassigned recordings/assignments for Excel (course 6)
    const cohortsRes = await pool.query(
      `SELECT DISTINCT cohort FROM (
         SELECT cohort FROM class_recordings WHERE course_id = 6 AND cohort IS NOT NULL
         UNION
         SELECT cohort FROM assignments WHERE course_id = 6 AND cohort IS NOT NULL
       ) as temp`
    );

    const cohorts = cohortsRes.rows.map(r => r.cohort);
    console.log(`Found cohorts: ${JSON.stringify(cohorts)}`);

    for (const cohort of cohorts) {
      console.log(`\n--- Processing cohort: "${cohort}" ---`);

      // 2. Find or create the folder "Excel Classes" for this cohort and course_id = 6
      let folderRes = await pool.query(
        "SELECT id FROM folders WHERE course_id = 6 AND cohort = $1 AND name = 'Excel Classes'",
        [cohort]
      );
      let folderId;

      if (folderRes.rows.length > 0) {
        folderId = folderRes.rows[0].id;
        console.log(`Resolved existing folder "Excel Classes" (ID: ${folderId})`);
      } else {
        folderRes = await pool.query(
          "INSERT INTO folders (course_id, cohort, name) VALUES (6, $1, 'Excel Classes') RETURNING id",
          [cohort]
        );
        folderId = folderRes.rows[0].id;
        console.log(`Created new folder "Excel Classes" (ID: ${folderId})`);
      }

      // 3. Define classes from Class 1 to Class 7
      for (let num = 1; num <= 7; num++) {
        const className = `Excel Class ${num}`;
        
        // Find or create class
        let classRes = await pool.query(
          "SELECT id FROM classes WHERE folder_id = $1 AND name = $2",
          [folderId, className]
        );
        let classId;

        if (classRes.rows.length > 0) {
          classId = classRes.rows[0].id;
          console.log(`  Resolved existing class "${className}" (ID: ${classId})`);
        } else {
          classRes = await pool.query(
            "INSERT INTO classes (folder_id, name, description) VALUES ($1, $2, $3) RETURNING id",
            [folderId, className, `Materials and resources for ${className}`]
          );
          classId = classRes.rows[0].id;
          console.log(`  Created class "${className}" (ID: ${classId})`);
        }

        // 4. Find and update class_recordings for this cohort
        // Match titles like "Excel Class X", "Excel class X", "Excel Class Xa", "Excel Class Xb"
        const recPattern = `^Excel [Cc]lass ${num}([a-z])?$`;
        const recordingsRes = await pool.query(
          `SELECT id, title FROM class_recordings 
           WHERE course_id = 6 AND cohort = $1 AND title ~* $2`,
          [cohort, recPattern]
        );

        if (recordingsRes.rows.length > 0) {
          const recIds = recordingsRes.rows.map(r => r.id);
          await pool.query(
            "UPDATE class_recordings SET class_id = $1 WHERE id = ANY($2)",
            [classId, recIds]
          );
          console.log(`    Updated recordings: ${JSON.stringify(recordingsRes.rows.map(r => r.title))}`);
        }

        // 5. Find and update assignments for this cohort
        // We match:
        // - "Class X Assignment"
        // - For Class 1: titles containing "Complete" and description containing "1u7DKq8UR8nDxxSgxCvcsjRSSLbrqyUgJ"
        // - For Class 2: titles containing "Complete" and description containing "1xQTUWMuY_HYRlRt4-B16tf3PyuF7hgbf2F1aNvX7yh8"
        let assignmentsRes;
        if (num === 1) {
          assignmentsRes = await pool.query(
            `SELECT id, title FROM assignments 
             WHERE course_id = 6 AND cohort = $1 AND (
               title ~* '^Class 1 Assignment$' OR 
               (title ~* 'Complete' AND description LIKE '%1u7DKq8UR8nDxxSgxCvcsjRSSLbrqyUgJ%')
             )`,
            [cohort]
          );
        } else if (num === 2) {
          assignmentsRes = await pool.query(
            `SELECT id, title FROM assignments 
             WHERE course_id = 6 AND cohort = $1 AND (
               title ~* '^Class 2 Assignment$' OR 
               (title ~* 'Complete' AND description LIKE '%1xQTUWMuY_HYRlRt4-B16tf3PyuF7hgbf2F1aNvX7yh8%')
             )`,
            [cohort]
          );
        } else {
          assignmentsRes = await pool.query(
            `SELECT id, title FROM assignments 
             WHERE course_id = 6 AND cohort = $1 AND title ~* $2`,
            [cohort, `^Class ${num} Assignment$`]
          );
        }

        if (assignmentsRes.rows.length > 0) {
          const assignIds = assignmentsRes.rows.map(a => a.id);
          await pool.query(
            "UPDATE assignments SET class_id = $1 WHERE id = ANY($2)",
            [classId, assignIds]
          );
          console.log(`    Updated assignments: ${JSON.stringify(assignmentsRes.rows.map(a => a.title))}`);
        }
      }
    }

    console.log("\n✓ Data migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Data migration failed:", error);
    process.exit(1);
  }
}

runDataMigration();
