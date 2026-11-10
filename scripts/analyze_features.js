const fs = require('fs');

const index = fs.readFileSync('public/index.html', 'utf8');
const app = fs.readFileSync('public/app.js', 'utf8');
const data = fs.readFileSync('public/shantipurData.js', 'utf8');
const routes = fs.readFileSync('public/routesExplorer.js', 'utf8');
const physics = fs.readFileSync('public/physicsEngine.js', 'utf8');
const raas = fs.readFileSync('public/raas-utsav.html', 'utf8');

console.log('--- SECTIONS FOUND IN INDEX.HTML ---');
const sections = [...index.matchAll(/<section[^>]*id="([^"]+)"/g)].map(m => m[1]);
console.log(sections);

console.log('\n--- CORE MODULES & FEATURES ---');
console.log('Data categories:', data.match(/categories:\s*\[([\s\S]*?)\]/)?.[0].slice(0, 300));
console.log('Routes count:', [...routes.matchAll(/id:\s*'dest-/g)].length);
console.log('Physics enabled:', physics.includes('initPhysics') || physics.includes('Matter') || physics.includes('Canvas'));

