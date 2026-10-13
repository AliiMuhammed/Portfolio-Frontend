const fs = require('node:fs/promises');
const path = require('node:path');
const {metadataQuery, validSlug, origin, articleUrl, eligible, imageAssetUrl, text} = require('../src/Pages/Writing/writingContract');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const baseTags = /<title\b[^>]*>[\s\S]*?<\/title>|<meta\b(?=[^>]*(?:name\s*=\s*["'](?:description|twitter:[^"']*)["']|property\s*=\s*["'](?:og:[^"']*|article:[^"']*)["']))[^>]*>|<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi;
function renderShell(shell, entry, configuredOrigin, fallbackImage, section = 'writing') {
  const url=section === 'writing' ? articleUrl(configuredOrigin,entry.slug) : `${origin(configuredOrigin)}/work/${entry.slug}`, title=`${text(entry.seoTitle)||entry.title} — Ali Muhammed`,description=text(entry.seoDescription)||text(entry.excerpt);
  const image=[entry.socialImage,entry.coverImage].find(value=>imageAssetUrl(value?.asset?.url));
  let fallback;
  try {const parsed=new URL(fallbackImage);if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password&&!parsed.hash&&/\.(png|jpe?g|webp|avif|gif)$/i.test(parsed.pathname)&&(parsed.origin===origin(configuredOrigin)||imageAssetUrl(parsed.href)))fallback=parsed.href;}catch{}
  const imageUrl=image?.asset.url||fallback;
  const meta=(key,value,property=false)=>`<meta ${property?'property':'name'}="${key}" content="${escape(value)}" data-writing-meta="true">`;
  const tags=[`<title data-writing-meta="true">${escape(title)}</title>`,meta('description',description),`<link rel="canonical" href="${escape(url)}" data-writing-meta="true">`,meta('og:type',section === 'writing' ? 'article' : 'website',true),meta('og:title',title,true),meta('og:description',description,true),meta('og:url',url,true),meta('og:site_name','Ali Muhammed',true),meta('twitter:card',imageUrl?'summary_large_image':'summary'),meta('twitter:title',title),meta('twitter:description',description)];
  if(section === 'writing') tags.push(meta('article:published_time',entry.publishedAt,true));
  if(section === 'writing' && Number.isFinite(Date.parse(entry._updatedAt)))tags.push(meta('article:modified_time',entry._updatedAt,true));
  if(imageUrl){tags.push(meta('og:image',imageUrl,true),meta('twitter:image',imageUrl));if(text(image?.alt))tags.push(meta('og:image:alt',image.alt,true));const dimensions=image?.asset.metadata?.dimensions;if(dimensions?.width>0&&dimensions?.height>0)tags.push(meta('og:image:width',dimensions.width,true),meta('og:image:height',dimensions.height,true));}
  const original=(shell.match(baseTags)||[]).join('');
  return shell.replace(baseTags,'').replace('</head>',`${tags.join('\n')}<template id="writing-base-metadata" data-head="${Buffer.from(original).toString('base64')}"></template></head>`);
}
function errorDocument(title, message, section) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escape(title)} — Ali Muhammed</title><style>body{margin:0;background:#0A0C15;color:#F6F7FB;font-family:Inter,system-ui,sans-serif;line-height:1.7}main{max-width:42rem;margin:12vh auto;padding:24px}h1{font-family:"Space Grotesk",system-ui,sans-serif;line-height:1.2}p{color:#A7B0C3}a{display:inline-flex;align-items:center;min-height:44px;color:#2CE6AF;text-underline-offset:4px}a:focus-visible{outline:3px solid #2CE6AF;outline-offset:4px}</style></head><body><main><h1>${escape(title)}</h1><p>${escape(message)}</p><a href="/${section}">Back to ${section}</a></main></body></html>`;
}
function createHandler({query = metadataQuery, isEligible = eligible, section = 'writing', prepare = entry => entry} = {}) {
return async function handler(req,res) {
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const fail = (code, title, message) => res.status(code).send(req.method === 'HEAD' ? '' : errorDocument(title, message, section));
  if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return fail(405,'Method not allowed.','Use a normal browser link to open this page.');}
  const slug=req.query?.slug;
  if(!validSlug(slug))return fail(404,`${section === 'work' ? 'Case study' : 'Writing entry'} not found.`,'This entry is not published or has been removed.');
  const canonical=origin(process.env.REACT_APP_CANONICAL_ORIGIN);
  if(!canonical)return fail(503,`${section === 'work' ? 'Case study' : 'Writing'} permalink configuration is not ready.`,'Public permalink configuration is not available yet.');
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
  try {
    const params=new URLSearchParams({query,'$slug':JSON.stringify(slug),perspective:'published'});
    const response=await fetch(`https://yv2hgb0y.api.sanity.io/v2024-01-01/data/query/production?${params}`,{signal:controller.signal});
    if(!response.ok)throw new Error('CMS unavailable');
    const {result}=await response.json();
    if(!isEligible(result)||result.slug!==slug)return fail(404,`${section === 'work' ? 'Case study' : 'Writing entry'} not found.`,'This entry is not published or has been removed.');
    // Explicit Vercel includeFiles packages this generated shell; never assume it is traced.
    const shell=await fs.readFile(path.join(process.cwd(),'build','index.html'),'utf8');
    if(!shell.includes('</head>')||!shell.includes('/static/js/'))throw new Error('Build shell unavailable');
    const html=renderShell(shell,prepare(result),canonical,section === 'writing' ? process.env.REACT_APP_WRITING_SOCIAL_IMAGE : undefined,section);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=60');
    return res.status(200).send(req.method==='HEAD'?'':html);
  } catch {return fail(503,`${section === 'work' ? 'Case study' : 'Writing'} is temporarily unavailable.`,'Please try again later.');}
  finally {clearTimeout(timeout);}
}
}
module.exports = {createHandler, renderShell};
