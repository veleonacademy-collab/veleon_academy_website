const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'https://veleonacademy.veleonex.com';
// Use local API for build-time generation if needed, or production API
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

const staticRoutes = [
  { url: '/', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 1.0 },
  { url: '/courses', lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.9 },
  { url: '/pricing', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.8 },
  { url: '/privacy', lastmod: '2026-03-17', changefreq: 'yearly', priority: 0.3 },
  { url: '/terms', lastmod: '2026-03-17', changefreq: 'yearly', priority: 0.3 },
  { url: '/login', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.5 },
  { url: '/register', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.5 },
  { url: '/trending', lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.7 },
  { url: '/categories', lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.6 },
];

async function generateSitemap() {
  console.log('--- Generating dynamic sitemap ---');
  console.log(`API URL: ${API_BASE_URL}`);

  try {
    // 1. Fetch Courses from Backend
    let courseRoutes = [];
    try {
      const coursesRes = await axios.get(`${API_BASE_URL}/academy/courses`);
      const courses = coursesRes.data || [];
      courseRoutes = courses.map(course => ({
        url: `/enroll/${course.slug}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      }));
      console.log(`Found ${courses.length} courses.`);
    } catch (e) {
      console.warn('Failed to fetch courses, skipping dynamic course routes.');
    }

    // 2. Fetch Trending Items from Backend
    let itemRoutes = [];
    try {
      const itemsRes = await axios.get(`${API_BASE_URL}/trending?limit=50`);
      // Based on trending API structure found in fetchTrendingNews
      const items = itemsRes.data || [];
      itemRoutes = items.filter(i => i.id).map(item => ({
        url: `/item/${item.id}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.7
      }));
      console.log(`Found ${itemRoutes.length} trending items.`);
    } catch (e) {
      console.warn('Failed to fetch trending items, skipping dynamic item routes.');
    }

    const allRoutes = [...staticRoutes, ...courseRoutes, ...itemRoutes];

    // Build the XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml);

    console.log(`Successfully generated sitemap with ${allRoutes.length} total URLs!`);
    console.log(`Path: ${sitemapPath}`);
  } catch (error) {
    console.error('Fatal error during sitemap generation:', error.message);
    process.exit(1);
  }
}

generateSitemap();
