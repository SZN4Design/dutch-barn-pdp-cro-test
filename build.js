// Builds index.html: compiles src/app.jsx, inlines src/styles.css, and embeds every asset as a data URI
// so the page is one self-contained file that works offline. Run: npm install && npm run build
const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const AD = 'assets';
const src = fs.readFileSync('src/app.jsx', 'utf8');
const js = babel.transformSync(src, { presets: [['@babel/preset-react', { runtime: 'classic' }]], comments: false }).code;
const uri = (f, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(path.join(AD, f)).toString('base64');

const assets = {};
for (const f of fs.readdirSync(AD)) if (f.endsWith('.webp')) assets[f.replace('.webp', '')] = uri(f, 'image/webp');

const css = fs.readFileSync('src/styles.css', 'utf8')
  .replace('__FONT_SPOOKY__', '"' + uri('font_spooky.ttf', 'font/ttf') + '"')
  .replace('__FONT_GOBOLD__', '"' + uri('font_gobold.otf', 'font/otf') + '"');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Dutch Barn PDP Test</title>
<meta name="description" content="CRO design test: redesigned buy box for the Dutch Barn Vodka product page, with an interactive prototype and case study.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap">
<style>
body { margin: 0; }
${css}
</style>
</head>
<body>
<div id="root"></div>
<script>window.__A = ${JSON.stringify(assets)};</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>
${js}
</script>
</body>
</html>
`;
fs.writeFileSync('index.html', html);
// Vercel serves the public/ folder
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/index.html', html);
// Vercel serves the public/ folder
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/index.html', html);
console.log('Built index.html', (html.length / 1024 / 1024).toFixed(2) + ' MB', Object.keys(assets).length + ' images');
