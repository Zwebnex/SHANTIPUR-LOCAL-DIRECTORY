const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// 1. Ensure routes/index.html
const routesDir = path.join(publicDir, 'routes');
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}
fs.copyFileSync(
  path.join(publicDir, 'index.html'),
  path.join(routesDir, 'index.html')
);
console.log('✓ Created public/routes/index.html');

// 2. Ensure raas-utsav/index.html
const raasDir = path.join(publicDir, 'raas-utsav');
if (!fs.existsSync(raasDir)) {
  fs.mkdirSync(raasDir, { recursive: true });
}
if (fs.existsSync(path.join(publicDir, 'raas-utsav.html'))) {
  fs.copyFileSync(
    path.join(publicDir, 'raas-utsav.html'),
    path.join(raasDir, 'index.html')
  );
  console.log('✓ Created public/raas-utsav/index.html');
}

// 3. Ensure stay/index.html, stay.html, and hotels/index.html
const stayIndexPath = path.join(publicDir, 'stay', 'index.html');
if (fs.existsSync(stayIndexPath)) {
  fs.copyFileSync(stayIndexPath, path.join(publicDir, 'stay.html'));
  
  const hotelsDir = path.join(publicDir, 'hotels');
  if (!fs.existsSync(hotelsDir)) {
    fs.mkdirSync(hotelsDir, { recursive: true });
  }
  fs.copyFileSync(stayIndexPath, path.join(hotelsDir, 'index.html'));
  fs.copyFileSync(stayIndexPath, path.join(publicDir, 'hotels.html'));
  console.log('✓ Created public/stay.html, public/hotels/index.html, and public/hotels.html');
}

// 4. Sync vercel.json to public/vercel.json
if (fs.existsSync(path.join(rootDir, 'vercel.json'))) {
  fs.copyFileSync(
    path.join(rootDir, 'vercel.json'),
    path.join(publicDir, 'vercel.json')
  );
  console.log('✓ Synced vercel.json to public/vercel.json');
}

console.log('Static routing and build generation completed successfully.');

