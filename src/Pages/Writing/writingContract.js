// Shared by the browser and the read-only article metadata function.
const text = value => typeof value === 'string' ? value.trim() : '';
const validSlug = value => typeof value === 'string' && value.length <= 96 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const origin = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash && !url.port && /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(url.hostname) && !/^\d+(?:\.\d+){3}$/.test(url.hostname) && !/\.(local|localhost|internal)$/.test(url.hostname) ? url.origin : null;
  } catch { return null; }
};
const articleUrl = (configuredOrigin, slug) => origin(configuredOrigin) && validSlug(slug) ? `${origin(configuredOrigin)}/writing/${slug}` : null;
const eligible = (entry, now = Date.now()) => entry && !/^(drafts\.|versions\.)/.test(entry._id || '') && validSlug(entry.slug) && ['article', 'note'].includes(entry.entryType) && text(entry.title) && typeof entry.publishedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(entry.publishedAt) && Number.isFinite(Date.parse(entry.publishedAt)) && Date.parse(entry.publishedAt) <= now;
const safeLink = value => {
  const href = text(value);
  if (/^\/(?!\/)/.test(href) && !/[\\\s]/.test(href)) return href;
  try {const url = new URL(href); return ['http:', 'https:', 'mailto:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;} catch {return undefined;}
};
const imageAssetUrl = value => typeof value === 'string' && /^https:\/\/cdn\.sanity\.io\/images\/yv2hgb0y\/production\/[a-f0-9]{40}-\d+x\d+\.(png|jpg|jpeg|webp|avif|gif)$/.test(value) ? value : null;
const guard = '_type == "article" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && defined(slug.current) && dateTime(publishedAt) <= dateTime(now())';
const asset = '{..., "asset": asset->{url, mimeType, metadata{dimensions}}}';
const listingQuery = `*[${guard}] | order(publishedAt desc, _id asc){_id, title, "slug": slug.current, entryType, excerpt, topic, tags, publishedAt, featured, "searchText": pt::text(body), coverImage${asset}}`;
const detailQuery = `*[${guard} && slug.current == $slug][0]{_id, title, "slug": slug.current, entryType, excerpt, topic, tags, publishedAt, _updatedAt, body[]{..., _type == "articleImage" => {"asset": asset->{url, mimeType, metadata{dimensions}}}}, coverImage${asset}, socialImage${asset}, seoTitle, seoDescription}`;
const metadataQuery = `*[${guard} && slug.current == $slug][0]{_id, title, "slug": slug.current, entryType, excerpt, publishedAt, _updatedAt, seoTitle, seoDescription, coverImage${asset}, socialImage${asset}}`;
module.exports = {text, validSlug, origin, articleUrl, eligible, safeLink, imageAssetUrl, listingQuery, detailQuery, metadataQuery};
