const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const filePath = path.join(process.cwd(), 'public', 'templates', 'gym', 'index.html');
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);
const clavesUsadas = new Set();
const CLAVES_RESERVADAS = new Set([
  'businessName','tagline','logo','heroImage','aboutImage','description','ctaText','aboutText','heroTitle','bannerTitle','bannerSubtitle','bannerButtonText','chooseUsTitle','chooseUsSubtitle','classesTitle','classesSubtitle','pricingTitle','pricingSubtitle','teamTitle','teamSubtitle','teamButtonText','address','phone','email'
]);
const TAGS_PERMITIDOS = new Set(['a','p','li','h1','h2','h3','h4','h5','h6','span','label','button','strong','em','small']);
function normalizarTexto(texto) { return texto.replace(/\s+/g, ' ').trim(); }
function generarClaveDesdeTexto(texto, tag) {
  const base = `${tag}-${texto}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base || `${tag}-text`;
}

$(' * ').each((_index, element) => {
  if (element.type !== 'tag') return;
  const tagName = element.tagName.toLowerCase();
  const $el = $(element);
  if ($el.attr('data-editable') || $el.attr('data-editable-bg')) return;
  const tieneAncestroMarcado = $el.parents().toArray().some((parent) => {
    const $parent = $(parent);
    return $parent.attr('data-editable') || $parent.attr('data-editable-bg');
  });
  if (tieneAncestroMarcado) return;
  if (!TAGS_PERMITIDOS.has(tagName)) return;
  if (['script','style','svg','img','input','textarea','select','option','noscript'].includes(tagName)) return;
  const texto = normalizarTexto($el.text());
  if (!texto || texto.length < 2) return;
  const claveBase = generarClaveDesdeTexto(texto, tagName);
  let clave = claveBase;
  let contador = 2;
  while (clavesUsadas.has(clave) || CLAVES_RESERVADAS.has(clave)) {
    clave = `${claveBase}-${contador}`;
    contador += 1;
  }
  clavesUsadas.add(clave);
  $el.attr('data-editable', clave);
});

$('input, textarea, img').each((_index, element) => {
  const $el = $(element);
  if ($el.attr('data-editable') || $el.attr('data-editable-bg')) return;
  const placeholder = $el.attr('placeholder');
  if (placeholder && placeholder.trim()) {
    const claveBase = 'placeholder-' + $el[0].tagName.toLowerCase();
    let clave = claveBase; let contador = 2; while (clavesUsadas.has(clave) || CLAVES_RESERVADAS.has(clave)) { clave = `${claveBase}-${contador}`; contador += 1; }
    clavesUsadas.add(clave); $el.attr('data-editable-attr', clave); $el.attr('data-editable-attr-name', 'placeholder');
  }
  const alt = $el.attr('alt');
  if (alt && alt.trim()) {
    const claveBase = 'alt-' + $el[0].tagName.toLowerCase();
    let clave = claveBase; let contador = 2; while (clavesUsadas.has(clave) || CLAVES_RESERVADAS.has(clave)) { clave = `${claveBase}-${contador}`; contador += 1; }
    clavesUsadas.add(clave); $el.attr('data-editable-attr', clave); $el.attr('data-editable-attr-name', 'alt');
  }
  const title = $el.attr('title');
  if (title && title.trim()) {
    const claveBase = 'title-' + $el[0].tagName.toLowerCase();
    let clave = claveBase; let contador = 2; while (clavesUsadas.has(clave) || CLAVES_RESERVADAS.has(clave)) { clave = `${claveBase}-${contador}`; contador += 1; }
    clavesUsadas.add(clave); $el.attr('data-editable-attr', clave); $el.attr('data-editable-attr-name', 'title');
  }
});

fs.writeFileSync(filePath, $.html());
console.log('Escaneo aplicado a ' + filePath);
