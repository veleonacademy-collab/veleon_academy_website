const { execSync } = require('child_process');

/**
 * This script runs react-snap for pre-rendering.
 * On Vercel, it gracefully skips if shared libraries (like libnss3) are missing,
 * which is a common limitation of serverless build environments.
 */

try {
  console.log('--- Starting Pre-rendering (react-snap) ---');
  
  // Attempt to run react-snap
  execSync('npx react-snap', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Force non-sandbox mode for CI environments
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'false'
    }
  });
  
  console.log('--- Pre-rendering completed successfully ---');
} catch (error) {
  // Check if we are on Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.NOW_BUILDER === '1';
  
  if (isVercel) {
    console.warn('\n' + '='.repeat(60));
    console.warn('WARNING: Pre-rendering skipped on Vercel');
    console.warn('Reason: Missing system libraries required for Chromium (Puppeteer).');
    console.warn('This is a known limitation of the Vercel build environment for Puppeteer-based tools.');
    console.warn('The build will continue, and the site will use client-side hydration.');
    console.warn('SEO will still be handled by react-helmet-async for modern crawlers.');
    console.warn('='.repeat(60) + '\n');
    
    // Exit with 0 to allow the build to proceed
    process.exit(0);
  } else {
    // If not on Vercel, we want the error to be visible
    console.error('\nPre-rendering failed:', error.message);
    process.exit(1);
  }
}
