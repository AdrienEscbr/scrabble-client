// Post-build adjustments for GitHub Pages (deploy from main/docs)
// - Create SPA fallback 404.html next to index.html
const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
const indexHtml = path.join(docsDir, 'index.html');
const notFound = path.join(docsDir, '404.html');

try {
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, notFound);
    console.log('[postbuild] 404.html created for SPA fallback');
  } else {
    console.warn('[postbuild] index.html not found in docs; skip 404.html');
  }
} catch (e) {
  console.warn('[postbuild] Failed to create 404.html:', e?.message || e);
}

