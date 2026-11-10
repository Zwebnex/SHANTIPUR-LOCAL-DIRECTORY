const fs = require('fs');
const path = require('path');

const root = __dirname;

// Directories to ensure exist
const dirs = ['scripts', 'docs', 'supabase'];
dirs.forEach(d => {
  const dirPath = path.join(root, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${d}`);
  }
});

// Files to move to scripts/
const scriptFiles = [
  'audit_full_website.js',
  'audit_images.js',
  'build_manifest.js',
  'capture_desktop_nav.js',
  'capture_hero_preview.js',
  'collect_assets.js',
  'convert_to_webp.js',
  'resolve_map_link.js',
  'seed_db.js',
  'test_index_integrity.js',
  'test_navbar_system.js',
  'test_routes_system.js',
  'test_security.js',
  'verify_all_text_contrast.js',
  'verify_page.js',
  'verify_raas_page.js'
];

scriptFiles.forEach(file => {
  const src = path.join(root, file);
  const dest = path.join(root, 'scripts', file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved to scripts/: ${file}`);
  }
});

// Files to move to docs/
const docFiles = [
  'IMAGE_ASSIGNMENT_AUDIT.md',
  'SANTIPUR_IMAGE_RESEARCH_REPORT.md',
  'SECURITY_PERMISSION_MATRIX.md',
  'SHANTIPUR_HERITAGE_IMAGE_VERIFICATION_REPORT.md',
  'SHANTIPUR_ROUTE_MAP_IMPLEMENTATION_REPORT.md',
  'SUPABASE_CONNECTION_VERIFICATION.md',
  'SUPABASE_SECURITY_AUDIT.md',
  'SUPABASE_SETUP.md'
];

docFiles.forEach(file => {
  const src = path.join(root, file);
  const dest = path.join(root, 'docs', file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved to docs/: ${file}`);
  }
});

// SQL file to supabase/
const sqlFile = 'RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql';
const sqlSrc = path.join(root, sqlFile);
const sqlDest = path.join(root, 'supabase', sqlFile);
if (fs.existsSync(sqlSrc)) {
  fs.renameSync(sqlSrc, sqlDest);
  console.log(`Moved to supabase/: ${sqlFile}`);
}

// Preview PNGs to delete (they are already preserved in artifacts)
const previewPngs = [
  'verification_preview.png',
  'routes_verification_preview.png',
  'desktop_nav_preview.png',
  'mobile_nav_preview.png',
  path.join('public', 'hero_contrast_fix_preview.png'),
  path.join('public', 'raas_utsav_desktop_preview.png'),
  path.join('public', 'raas_utsav_mobile_preview.png')
];

previewPngs.forEach(p => {
  const full = path.join(root, p);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log(`Removed preview file: ${p}`);
  }
});

console.log('Album organization completed!');
