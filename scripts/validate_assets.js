const fetch = require('node-fetch');
const urls = [
  'https://cheppuai.netlify.app/manifest.json',
  'https://cheppuai.netlify.app/icon-192.png',
  'https://cheppuai.netlify.app/icon-512.png',
  'https://cheppuai.netlify.app/apple-icon-180.png',
  'https://cheppuai.netlify.app/sw.js',
  'https://cheppuai.netlify.app/.well-known/assetlinks.json'
];

const maxRetries = 3;
const retryDelay = (attempt) => 500 * Math.pow(2, attempt);

async function fetchWithRetry(url, attempt = 0) {
  try {
    const res = await fetch(url, { timeout: 10000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    const size = res.headers.get('content-length') || 'unknown';
    return { ok: true, status: res.status, contentType, size };
  } catch (err) {
    if (attempt < maxRetries - 1) {
      console.log(`[retry] ${url} failed (${err.message}). Retrying in ${retryDelay(attempt)}ms...`);
      await new Promise((r) => setTimeout(r, retryDelay(attempt)));
      return fetchWithRetry(url, attempt + 1);
    }
    return { ok: false, message: err.message };
  }
}

(async () => {
  console.log('Validating PWA assets for https://cheppuai.netlify.app ...');
  let allOk = true;
  for (const url of urls) {
    process.stdout.write(`Checking ${url} ... `);
    const result = await fetchWithRetry(url);
    if (result.ok) {
      console.log(`OK [${result.status}] (${result.contentType}; ${result.size} bytes)`);
    } else {
      allOk = false;
      console.error(`FAIL - ${result.message}`);
    }
  }

  if (!allOk) {
    console.error('\nOne or more assets failed to validate.');
    console.error('Common causes: transient network outage, server blocking or rate limiting, SSL issues, or file missing.');
    console.error('Try:');
    console.error('  - Re-run this script (retries are automatic)');
    console.error('  - Check Netlify deployments and access logs for blocked requests');
    console.error('  - Ensure assets exist at the exact paths and are served over HTTPS');
    console.error('  - Add caching headers and avoid large file sizes for icons');
    console.error('  - Disable blockers (firewalls, corporate proxies) during packaging');
    process.exit(1);
  }

  console.log('\nAll assets validated successfully. Safe to build an AAB or run PWABuilder packaging.');
  process.exit(0);
})();
