const fs = require('node:fs');
const path = require('node:path');
const {origin} = require('../src/Pages/Writing/writingContract');

function configureBaseMetadata(html, value) {
  const canonical = origin(value);
  const clean = html.replace(/<meta\b[^>]*data-base-meta="true"[^>]*>/g, '')
    .replace(/(<meta name="twitter:card" content=")[^"]*(")/, '$1summary$2');
  if (!canonical) return clean;
  const image = `${canonical}/og-image.png`;
  const tags = [
    `<meta property="og:url" content="${canonical}/" data-base-meta="true">`,
    `<meta property="og:image" content="${image}" data-base-meta="true">`,
    `<meta name="twitter:image" content="${image}" data-base-meta="true">`,
  ];
  return clean.replace('content="summary"', 'content="summary_large_image"')
    .replace('</head>', `${tags.join('\n')}</head>`);
}

if (require.main === module) {
  // Match CRA's production .env precedence without rewriting source templates.
  process.env.NODE_ENV = 'production';
  require('react-scripts/config/env');
  const file = path.join(__dirname, '..', 'build', 'index.html');
  fs.writeFileSync(file, configureBaseMetadata(fs.readFileSync(file, 'utf8'), process.env.REACT_APP_CANONICAL_ORIGIN));
}
module.exports = {configureBaseMetadata};
