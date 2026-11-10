const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const checks = [
  ['Inter Font', html.includes('Inter')],
  ['Santipur Local Directory Title', html.includes('Santipur Local Directory')],
  ['Nadia West Bengal PIN 741404', html.includes('Nadia, West Bengal | PIN - 741404')],
  ['Routes Section', html.includes('id="routes-section"')],
  ['Civic Section', html.includes('id="civic-section"')],
  ['Register Business Section', html.includes('id="register-business"')],
  ['SiteNavigationElement Schema', html.includes('SiteNavigationElement')],
  ['BreadcrumbList Schema', html.includes('BreadcrumbList')],
  ['TouristInformationCenter Schema', html.includes('TouristInformationCenter')],
  ['Search Clear Button', html.includes('id="search-clear-btn"')],
  ['Search Live Dropdown', html.includes('id="search-live-dropdown"')]
];

console.log(checks);
const allPassed = checks.every(c => c[1]);
console.log('ALL PASSED:', allPassed);
process.exit(allPassed ? 0 : 1);
