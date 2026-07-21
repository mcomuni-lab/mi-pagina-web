const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const filePath = path.join(process.cwd(), 'public', 'templates', 'gym', 'index.html');
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);
const markers = [...new Set($('[data-editable]').map(function () {
  return $(this).attr('data-editable');
}).get())];
console.log('data-editable count=' + markers.length);
console.log(markers.slice(0, 60).join('\n'));
console.log('---');
const attrMarkers = [...new Set($('[data-editable-attr]').map(function () {
  return $(this).attr('data-editable-attr') + '::' + $(this).attr('data-editable-attr-name');
}).get())];
console.log('data-editable-attr count=' + attrMarkers.length);
console.log(attrMarkers.slice(0, 20).join('\n'));
