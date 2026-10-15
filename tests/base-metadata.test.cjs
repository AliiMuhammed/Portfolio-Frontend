const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const shell = fs.readFileSync(require.resolve('../public/index.html'), 'utf8');
const configureBaseMetadata = (...args) => require('../scripts/configure-base-metadata.cjs').configureBaseMetadata(...args);

test('the base template does not advertise the former hosting domain', () => {
  assert.doesNotMatch(shell, /netlify\.app/);
});

test('base HTML uses the approved origin for social identity and its existing image', () => {
  const html = configureBaseMetadata(shell, 'https://preview.example.org');
  assert.match(html, /property="og:url" content="https:\/\/preview\.example\.org\/"/);
  assert.match(html, /property="og:image" content="https:\/\/preview\.example\.org\/og-image\.png"/);
  assert.match(html, /name="twitter:image" content="https:\/\/preview\.example\.org\/og-image\.png"/);
  assert.doesNotMatch(html, /netlify\.app/);
  assert.match(html, /<title>Ali Muhammed/);
  assert.match(html, /<div id="root"><\/div>/);
});

test('image dimension tags never misrepresent the bundled social image', () => {
  const html = configureBaseMetadata(shell, 'https://preview.example.org');
  const png = fs.readFileSync(require.resolve('../public/og-image.png'));
  for (const [name, offset] of [['width', 16], ['height', 20]]) {
    const tag = html.match(new RegExp(`property="og:image:${name}" content="(\\d+)"`));
    if (tag) assert.equal(Number(tag[1]), png.readUInt32BE(offset));
  }
});

test('missing or rejected origins never publish a fabricated URL or image', () => {
  for (const value of [undefined, '', 'http://preview.example.org', 'https://preview.example.org/writing', 'https://user:pass@preview.example.org', '"https://preview.example.org"', 'https://preview.example.org/?x=1']) {
    const html = configureBaseMetadata(shell, value);
    assert.doesNotMatch(html, /(?:og:url|og:image|twitter:image|netlify\.app)/);
    assert.match(html, /name="twitter:card" content="summary"/);
  }
});

test('base metadata configuration can safely run again without duplicate tags', () => {
  const first = configureBaseMetadata(shell, 'https://preview.example.org');
  const html = configureBaseMetadata(first, 'https://portfolio.example.org');
  assert.equal((html.match(/property="og:url"/g) || []).length, 1);
  assert.doesNotMatch(html, /preview\.example\.org/);
  assert.match(html, /https:\/\/portfolio\.example\.org\/og-image\.png/);
});
