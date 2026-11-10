const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, 'public');
const filesToCheck = [
  'public/index.html',
  'public/raas-utsav.html',
  'public/assetsManifest.js',
  'public/listingImageRegistry.js',
  'public/shantipurData.js'
];

let missingImages = [];
let checkedImages = 0;
const uniqueImages = new Set();

filesToCheck.forEach(relPath => {
  const filePath = path.resolve(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/\/images\/[a-zA-Z0-9_\-\.\/]+/g) || [];
  matches.forEach(img => {
    const cleanImg = img.split('?')[0].replace(/['\)\"]/g, '');
    uniqueImages.add(cleanImg);
    const fullPath = path.join(publicDir, cleanImg.replace(/^\/images\//, 'images/'));
    checkedImages++;
    if (!fs.existsSync(fullPath)) {
      missingImages.push({ file: relPath, img: cleanImg, path: fullPath });
    }
  });
});

console.log('Total image references scanned:', checkedImages);
console.log('Unique images found:', uniqueImages.size);
console.log('Missing images count:', missingImages.length);
if (missingImages.length > 0) {
  console.log('Missing details:', JSON.stringify(missingImages, null, 2));
} else {
  console.log('SUCCESS: ALL referenced images physically exist on disk!');
}
