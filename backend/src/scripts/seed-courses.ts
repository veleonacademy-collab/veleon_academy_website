import { pool } from "../database/pool.js";

const courses = [
  {
    title: "Frontend Development",
    description:
      "Master React, Next.js, TypeScript, and modern CSS. Build real-world UIs that employers love. Learn component architecture, state management, API integration, and deployment.",
    price: 150000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop",
  },
  {
    title: "Backend Development",
    description:
      "Node.js, Express, PostgreSQL, REST APIs, and System Design — from fundamentals to production-grade applications. Learn authentication, databases, and cloud deployment.",
    price: 150000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
  },
  {
    title: "Data Analysis",
    description:
      "Python, SQL, Excel, and Power BI. Turn raw data into insights that drive business decisions. Learn data cleaning, visualization, and storytelling with data.",
    price: 120000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
  },
  {
    title: "Data Science & Machine Learning",
    description:
      "Machine Learning, Deep Learning, and AI fundamentals using Python, Scikit-learn, and TensorFlow. Build and deploy real ML models from scratch.",
    price: 180000,
    thumbnail_url:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2065&auto=format&fit=crop",
  },
];

async function seedCourses() {
  console.log("🌱 Seeding courses...");

  // Check if courses already exist
  const existing = await pool.query("SELECT COUNT(*) FROM courses");
  const count = parseInt(existing.rows[0].count);

  if (count > 0) {
    console.log(`ℹ️  ${count} course(s) already exist. Skipping seed.`);
    console.log("   Run with --force to overwrite.\n");
    const rows = await pool.query("SELECT id, title, price FROM courses ORDER BY id");
    console.table(rows.rows);
    await pool.end();
    return;
  }

  for (const course of courses) {
    const result = await pool.query(
      `INSERT INTO courses (title, description, price, thumbnail_url)
       VALUES ($1, $2, $3, $4) RETURNING id, title, price`,
      [course.title, course.description, course.price, course.thumbnail_url]
    );
    console.log(`✅ Created: [${result.rows[0].id}] ${result.rows[0].title} — ₦${Number(result.rows[0].price).toLocaleString()}`);
  }

  console.log("\n🎉 Done! All 4 courses seeded successfully.");
  await pool.end();
}

seedCourses().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
