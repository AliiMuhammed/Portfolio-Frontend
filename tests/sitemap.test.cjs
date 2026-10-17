const {test, beforeEach, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const handler = require('../api/sitemap');
const writing = require('../src/Pages/Writing/writingContract');
const work = require('../src/Pages/Work/caseStudyContract');

const canonical = 'https://portfolio.example';
const article = {
  _id: 'article', title: 'Published article', slug: 'first-article', entryType: 'article',
  publishedAt: '2025-01-01T00:00:00Z', _updatedAt: '2025-02-01T12:00:00Z',
};
const project = {
  _id: 'project', title: 'Published case study', slug: 'first-project',
  caseStudyPublished: true, caseStudyReady: true, _updatedAt: '2025-03-01T12:00:00Z',
};
let previousFetch, previousOrigin;
const respond = result => {global.fetch = async () => ({ok: true, json: async () => ({result})});};
const call = async (method = 'GET') => {
  const res = {
    headers: {}, setHeader(key, value) {this.headers[key] = value;},
    status(value) {this.code = value; return this;}, send(value) {this.body = value; return this;},
  };
  await handler({method, headers: {host: 'untrusted.example'}}, res);
  return res;
};
const locations = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
beforeEach(() => {
  previousFetch = global.fetch;
  previousOrigin = process.env.REACT_APP_CANONICAL_ORIGIN;
  process.env.REACT_APP_CANONICAL_ORIGIN = canonical;
  respond({writing: [article], work: [project]});
});
afterEach(() => {
  global.fetch = previousFetch;
  if (previousOrigin === undefined) delete process.env.REACT_APP_CANONICAL_ORIGIN;
  else process.env.REACT_APP_CANONICAL_ORIGIN = previousOrigin;
});

test('sitemap contains the five main routes and eligible article, note and case-study permalinks', async () => {
  respond({writing: [article, {...article, _id: 'note', slug: 'field-note', entryType: 'note'}], work: [project]});
  const res = await call();
  assert.equal(res.code, 200);
  assert.equal(res.headers['Content-Type'], 'application/xml; charset=utf-8');
  assert.equal(res.headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(res.headers['Cache-Control'], 'public, max-age=0, s-maxage=60');
  assert.ok(res.body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(res.body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.deepEqual(locations(res.body), [
    '/', '/resume', '/work', '/writing', '/contact',
    '/work/first-project', '/writing/field-note', '/writing/first-article',
  ].map(path => `${canonical}${path}`));
  assert.ok(!res.body.includes('untrusted.example'));
});

test('one anonymous published query reuses the same visibility contracts without fetching full content', async () => {
  let requests = 0;
  global.fetch = async (url, {signal}) => {
    requests++;
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://yv2hgb0y.api.sanity.io');
    assert.equal(parsed.pathname, '/v2024-01-01/data/query/production');
    assert.equal(parsed.searchParams.get('perspective'), 'published');
    assert.equal(parsed.searchParams.get('query'), `{"writing": ${writing.sitemapQuery}, "work": ${work.sitemapQuery}}`);
    assert.ok(signal instanceof AbortSignal);
    assert.ok(!parsed.searchParams.get('query').includes('body[]{'));
    assert.ok(!parsed.searchParams.get('query').includes('imageurl'));
    return {ok: true, json: async () => ({result: {writing: [], work: []}})};
  };
  assert.equal((await call()).code, 200);
  assert.equal(requests, 1);
});

test('drafts, scheduled or invalid Writing records never become sitemap URLs', async () => {
  const invalid = [null, {}, ...[
    {_id: 'drafts.article'}, {_id: 'versions.release.article'}, {slug: 'Bad Slug'},
    {slug: '../escape'}, {slug: 'x'.repeat(97)}, {title: ' '}, {entryType: 'unknown'},
    {publishedAt: '2099-01-01T00:00:00Z'}, {publishedAt: 'bad'},
  ].map(patch => ({...article, ...patch}))];
  respond({writing: invalid, work: []});
  assert.equal(locations((await call()).body).length, 5);
});

test('legacy, disabled, incomplete and invalid Work records never get case-study URLs', async () => {
  const invalid = [null, {}, ...[
    {_id: 'drafts.project'}, {_id: 'versions.release.project'}, {caseStudyPublished: false},
    {caseStudyPublished: undefined}, {caseStudyPublished: 'true'}, {caseStudyReady: false},
    {caseStudyReady: undefined}, {title: '\n '}, {slug: null}, {slug: 'Bad-Slug'},
  ].map(patch => ({...project, ...patch}))];
  respond({writing: [], work: invalid});
  assert.equal(locations((await call()).body).length, 5);
});

test('empty published collections still produce the five main routes', async () => {
  respond({writing: [], work: []});
  assert.equal(locations((await call()).body).length, 5);
});

test('duplicate slugs are emitted once and CMS titles cannot inject XML', async () => {
  respond({writing: [article, {...article, title: '<script>unsafe & text</script>'}], work: [project, project]});
  const {body} = await call();
  assert.equal(locations(body).length, 7);
  assert.ok(!body.includes('<script>'));
  assert.ok(!body.includes('unsafe'));
});

test('lastmod uses real valid CMS timestamps, with no invented dates for static pages', async () => {
  const {body} = await call();
  assert.ok(body.includes('<lastmod>2025-02-01T12:00:00.000Z</lastmod>'));
  assert.ok(body.includes('<lastmod>2025-03-01T12:00:00.000Z</lastmod>'));
  assert.equal((body.match(/<lastmod>/g) || []).length, 2);
  respond({writing: [{...article, _updatedAt: 'invalid'}], work: [{...project, _updatedAt: '2099-01-01T00:00:00Z'}]});
  assert.ok(!(await call()).body.includes('<lastmod>'));
});

test('missing or invalid configured origins fail safely without trusting Host or querying CMS', async () => {
  global.fetch = () => {throw Error('Must not fetch');};
  for (const value of [undefined, '', 'http://portfolio.example', 'https://portfolio.example/path', 'https://user:pass@portfolio.example', 'https://localhost']) {
    if (value === undefined) delete process.env.REACT_APP_CANONICAL_ORIGIN;
    else process.env.REACT_APP_CANONICAL_ORIGIN = value;
    const res = await call();
    assert.equal(res.code, 503);
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.ok(!res.body.includes('untrusted.example'));
  }
});

test('CMS network, HTTP, JSON and response-shape failures return an uncached 503', async () => {
  for (const fetcher of [
    async () => {throw Error('offline');},
    async () => ({ok: false}),
    async () => ({ok: true, json: async () => {throw Error('invalid JSON');}}),
  ]) {
    global.fetch = fetcher;
    assert.equal((await call()).code, 503);
  }
  for (const result of [null, {}, {writing: [], work: null}, {writing: {}, work: []}]) {
    respond(result);
    const res = await call();
    assert.equal(res.code, 503);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});

test('a stalled CMS request is aborted after eight seconds', async t => {
  t.mock.timers.enable({apis: ['setTimeout']});
  global.fetch = (url, {signal}) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(Error('aborted'))));
  const pending = call();
  t.mock.timers.tick(8000);
  assert.equal((await pending).code, 503);
  t.mock.timers.reset();
});

test('HEAD has the same status and headers without a body, and other methods are rejected', async () => {
  const res = await call('HEAD');
  assert.equal(res.code, 200);
  assert.equal(res.body, '');
  assert.equal(res.headers['Content-Type'], 'application/xml; charset=utf-8');
  const rejected = await call('POST');
  assert.equal(rejected.code, 405);
  assert.equal(rejected.headers.Allow, 'GET, HEAD');
  delete process.env.REACT_APP_CANONICAL_ORIGIN;
  assert.equal((await call('HEAD')).body, '');
});

test('sitemap has a narrow public rewrite and robots.txt advertises the approved canonical URL', async () => {
  const {rewrites} = require('../vercel.json');
  assert.deepEqual(rewrites.filter(rule => rule.source === '/sitemap.xml'), [{source: '/sitemap.xml', destination: '/api/sitemap'}]);
  assert.deepEqual(rewrites.slice(0, 2), [
    {source: '/writing/:slug', destination: '/api/writing-article?slug=:slug'},
    {source: '/work/:slug', destination: '/api/work-case-study?slug=:slug'},
  ]);
  const robots = await fs.readFile('public/robots.txt', 'utf8');
  assert.ok(robots.includes('Sitemap: https://www.ali-muhammed.tech/sitemap.xml'));
  assert.ok(!rewrites.some(rule => rule.source.includes('(.*)')));
});
