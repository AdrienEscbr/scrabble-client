// Post-build adjustments for GitHub Pages (deploy from main/docs)
// - Copy CRA build (client/build) to repo-level docs/
// - Create SPA fallback 404.html
// - Add .nojekyll to bypass Jekyll processing
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const buildDir = path.resolve(__dirname, '..', 'build');
const docsDir = path.join(root, 'docs');

function rimraf(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const cur = path.join(p, entry);
    const stat = fs.lstatSync(cur);
    if (stat.isDirectory()) rimraf(cur);
    else fs.unlinkSync(cur);
  }
  fs.rmdirSync(p);
}

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

// Clean docs and copy fresh build
if (fs.existsSync(docsDir)) rimraf(docsDir);
fs.mkdirSync(docsDir, { recursive: true });
copyDir(buildDir, docsDir);

// Create SPA fallback and .nojekyll
const indexHtml = path.join(docsDir, 'index.html');
const notFound = path.join(docsDir, '404.html');
const nojekyll = path.join(docsDir, '.nojekyll');

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
