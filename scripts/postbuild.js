// Post-build adjustments for GitHub Pages (deploy from main root)
// - Copy CRA build (client/build) to repo root
// - Create SPA fallback 404.html at root
// - Add .nojekyll to bypass Jekyll processing
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const buildDir = path.resolve(__dirname, '..', 'build');
const targetDir = root; // deploy to repository root

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(buildDir)) {
  console.error(`[postbuild] CRA build folder not found: ${buildDir}`);
  process.exit(1);
}

// Clean existing CRA artifacts at root (static/ only to be safe), then copy
const staticDir = path.join(targetDir, 'static');
if (fs.existsSync(staticDir)) {
  fs.rmSync(staticDir, { recursive: true, force: true });
}
copyDir(buildDir, targetDir);

// Create SPA fallback and .nojekyll
const indexHtml = path.join(targetDir, 'index.html');
const notFound = path.join(targetDir, '404.html');
const nojekyll = path.join(targetDir, '.nojekyll');

try {
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, notFound);
    console.log('[postbuild] 404.html created for SPA fallback');
  }
  fs.writeFileSync(nojekyll, '');
  console.log('[postbuild] .nojekyll created');
} catch (e) {
  console.warn('[postbuild] Post-process warnings:', e?.message || e);
}
