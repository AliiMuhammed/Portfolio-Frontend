const fs = require('node:fs/promises');
const path = require('node:path');
const {metadataQuery, validSlug, origin, articleUrl, eligible, imageAssetUrl, text} = require('../src/Pages/Writing/writingContract');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const baseTags = /<title\b[^>]*>[\s\S]*?<\/title>|<meta\b(?=[^>]*(?:name\s*=\s*["'](?:description|twitter:[^"']*)["']|property\s*=\s*["'](?:og:[^"']*|article:[^"']*)["']))[^>]*>|<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi;
function renderShell(shell, entry, configuredOrigin, fallbackImage) {
  const url=articleUrl(configuredOrigin,entry.slug), title=`${text(entry.seoTitle)||entry.title} — Ali Muhammed`,description=text(entry.seoDescription)||text(entry.excerpt);
  const image=[entry.socialImage,entry.coverImage].find(value=>imageAssetUrl(value?.asset?.url));
  let fallback;
  try {const parsed=new URL(fallbackImage);if(parsed.protocol==='https:'&&!parsed.username&&!parsed.password&&!parsed.hash&&/\.(png|jpe?g|webp|avif|gif)$/i.test(parsed.pathname)&&(parsed.origin===origin(configuredOrigin)||imageAssetUrl(parsed.href)))fallback=parsed.href;}catch{}
  const imageUrl=image?.asset.url||fallback;
  const meta=(key,value,property=false)=>`<meta ${property?'property':'name'}="${key}" content="${escape(value)}" data-writing-meta="true">`;
  const tags=[`<title data-writing-meta="true">${escape(title)}</title>`,meta('description',description),`<link rel="canonical" href="${escape(url)}" data-writing-meta="true">`,meta('og:type','article',true),meta('og:title',title,true),meta('og:description',description,true),meta('og:url',url,true),meta('og:site_name','Ali Muhammed',true),meta('article:published_time',entry.publishedAt,true),meta('twitter:card',imageUrl?'summary_large_image':'summary'),meta('twitter:title',title),meta('twitter:description',description)];
  if(Number.isFinite(Date.parse(entry._updatedAt)))tags.push(meta('article:modified_time',entry._updatedAt,true));
  if(imageUrl){tags.push(meta('og:image',imageUrl,true),meta('twitter:image',imageUrl));if(text(image?.alt))tags.push(meta('og:image:alt',image.alt,true));const dimensions=image?.asset.metadata?.dimensions;if(dimensions?.width>0&&dimensions?.height>0)tags.push(meta('og:image:width',dimensions.width,true),meta('og:image:height',dimensions.height,true));}
  const original=(shell.match(baseTags)||[]).join('');
  return shell.replace(baseTags,'').replace('</head>',`${tags.join('\n')}<template id="writing-base-metadata" data-head="${Buffer.from(original).toString('base64')}"></template></head>`);
}
async function handler(req,res) {
  res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return res.status(405).send('Method not allowed.');}
  const slug=req.query?.slug;
  if(!validSlug(slug))return res.status(404).send('<h1>Writing entry not found.</h1><p>This entry is not published or has been removed.</p><a href="/writing">Back to all writing</a>');
  const canonical=origin(process.env.REACT_APP_CANONICAL_ORIGIN);
  if(!canonical)return res.status(503).send('Writing permalink configuration is not ready.');
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
  try {
    const query=new URLSearchParams({query:metadataQuery,'$slug':JSON.stringify(slug),perspective:'published'});
    const response=await fetch(`https://yv2hgb0y.api.sanity.io/v2024-01-01/data/query/production?${query}`,{signal:controller.signal});
    if(!response.ok)throw new Error('CMS unavailable');
    const {result}=await response.json();
    if(!eligible(result)||result.slug!==slug)return res.status(404).send('<h1>Writing entry not found.</h1><p>This entry is not published or has been removed.</p><a href="/writing">Back to all writing</a>');
    // Explicit Vercel includeFiles packages this generated shell; never assume it is traced.
    const shell=await fs.readFile(path.join(process.cwd(),'build','index.html'),'utf8');
    if(!shell.includes('</head>')||!shell.includes('/static/js/'))throw new Error('Build shell unavailable');
    const html=renderShell(shell,result,canonical,process.env.REACT_APP_WRITING_SOCIAL_IMAGE);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=60');
    return res.status(200).send(req.method==='HEAD'?'':html);
  } catch {return res.status(503).send('Writing is temporarily unavailable. Please try again later.');}
  finally {clearTimeout(timeout);}
}
module.exports=handler;
module.exports.renderShell=renderShell;
