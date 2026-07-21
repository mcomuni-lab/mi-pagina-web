const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const filePath = path.join(process.cwd(), 'public', 'templates', 'gym', 'index.html');
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);
let count = 0;
let attrs = 0;
$('[data-editable]').each(function () { count += 1; });
$('[data-editable-attr]').each(function () { attrs += 1; });
console.log('data-editable count=' + count);
console.log('data-editable-attr count=' + attrs);
if (attrs > 0) {
  const first = $('[data-editable-attr]').first();
  console.log(first.attr('data-editable-attr') + ' -> ' + first.attr('data-editable-attr-name'));
}
