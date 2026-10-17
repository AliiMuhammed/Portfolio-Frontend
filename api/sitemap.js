const writing = require('../src/Pages/Writing/writingContract');
const work = require('../src/Pages/Work/caseStudyContract');
const escape = value => value.replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[char]));

module.exports = async function sitemap(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const fail = code => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(code).send(req.method === 'HEAD' ? '' : 'Sitemap is temporarily unavailable.');
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return fail(405);
  }
  const canonical = writing.origin(process.env.REACT_APP_CANONICAL_ORIGIN);
  if (!canonical) return fail(503);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const query = `{"writing": ${writing.sitemapQuery}, "work": ${work.sitemapQuery}}`;
    const params = new URLSearchParams({query, perspective: 'published'});
    const response = await fetch(`https://yv2hgb0y.api.sanity.io/v2024-01-01/data/query/production?${params}`, {signal: controller.signal});
    if (!response.ok) throw new Error('CMS unavailable');
    const {result} = await response.json();
    if (!Array.isArray(result?.writing) || !Array.isArray(result?.work)) throw new Error('Invalid CMS response');

    const now = Date.now();
    const pages = ['/', '/resume', '/work', '/writing', '/contact'].map(path => ({url: `${canonical}${path}`}));
    const entries = [
      ...result.writing.filter(entry => writing.eligible(entry, now)).map(entry => ({...entry, url: writing.articleUrl(canonical, entry.slug)})),
      ...result.work.filter(entry => work.eligible(entry)).map(entry => ({...entry, url: work.caseStudyUrl(canonical, entry.slug)})),
    ].sort((a, b) => a.url.localeCompare(b.url));
    const seen = new Set();
    const urls = [...pages, ...entries].filter(entry => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    }).map(entry => {
      const updated = typeof entry._updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(entry._updatedAt) ? Date.parse(entry._updatedAt) : NaN;
      const lastmod = Number.isFinite(updated) && updated <= now ? `<lastmod>${new Date(updated).toISOString()}</lastmod>` : '';
      return `  <url><loc>${escape(entry.url)}</loc>${lastmod}</url>`;
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    return res.status(200).send(req.method === 'HEAD' ? '' : xml);
  } catch {
    return fail(503);
  } finally {
    clearTimeout(timeout);
  }
};
