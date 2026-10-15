import {useEffect} from 'react';
import {origin, validSlug, imageAssetUrl, text, writingAuthor, articleStructuredData} from '../writingContract';
const selector='title, meta[name="author"], meta[name="description"], meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"], link[rel="canonical"], script[type="application/ld+json"][data-writing-meta="true"]';
export default function WritingMetadata({entry:selectedEntry,slug,section='writing'}) {
  const entry=slug===selectedEntry?.slug?selectedEntry:null;
  useEffect(()=>{
    // Server responses retain the trusted build's original tags for SPA navigation cleanup.
    const template=document.getElementById('writing-base-metadata');
    const baseline=template?.dataset.head ? new DOMParser().parseFromString(new TextDecoder().decode(Uint8Array.from(atob(template.dataset.head),char=>char.charCodeAt(0))),'text/html').head : document.head;
    const base=[...baseline.querySelectorAll(selector)].map(node=>node.cloneNode(true));
    return ()=>{document.head.querySelectorAll(selector).forEach(node=>node.remove());base.forEach(node=>document.head.appendChild(node));};
  },[]);
  useEffect(()=>{
    if(slug&&!entry)return;
    const currentOrigin=origin(process.env.REACT_APP_CANONICAL_ORIGIN);
    const url=currentOrigin && validSlug(entry?.slug) ? `${currentOrigin}/${section}/${entry.slug}` : null;
    document.head.querySelectorAll(selector).forEach(node=>node.remove());
    const title=document.createElement('title');title.textContent=entry?`${text(entry.seoTitle)||entry.title} — Ali Muhammed`:'Writing & Engineering Notes — Ali Muhammed';document.head.appendChild(title);
    const meta=document.createElement('meta');meta.name='description';meta.content=entry?text(entry.seoDescription)||text(entry.excerpt):'Engineering articles and practical field notes by Ali Muhammed.';document.head.appendChild(meta);
    const pageUrl=url||(currentOrigin?`${currentOrigin}/${section}`:null);
    const values={'og:type':entry && section === 'writing'?'article':'website','og:title':title.textContent,'og:description':meta.content,'og:site_name':'Ali Muhammed','twitter:card':'summary','twitter:title':title.textContent,'twitter:description':meta.content};
    if(pageUrl)values['og:url']=pageUrl;
    const image=[entry?.socialImage,entry?.coverImage].find(value=>imageAssetUrl(value?.asset?.url));
    if(image){
      values['og:image']=image.asset.url;values['twitter:image']=image.asset.url;values['twitter:card']='summary_large_image';
      if(text(image.alt))values['og:image:alt']=image.alt;
      const dimensions=image.asset.metadata?.dimensions;
      if(dimensions?.width>0&&dimensions?.height>0){values['og:image:width']=dimensions.width;values['og:image:height']=dimensions.height;}
    }
    if(entry && section === 'writing'){
      values.author=writingAuthor.name;values['article:author']=writingAuthor.url;values['article:published_time']=entry.publishedAt;
      if(Number.isFinite(Date.parse(entry._updatedAt)))values['article:modified_time']=entry._updatedAt;
      const structured=articleStructuredData(entry,currentOrigin,image?.asset.url);
      if(structured){const script=document.createElement('script');script.type='application/ld+json';script.dataset.writingMeta='true';script.textContent=JSON.stringify(structured).replace(/</g,'\\u003c');document.head.appendChild(script);}
    }
    Object.entries(values).forEach(([key,value])=>{const tag=document.createElement('meta');tag.setAttribute(key==='author'||key.startsWith('twitter:')?'name':'property',key);tag.content=value;document.head.appendChild(tag);});
    if(pageUrl){const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=pageUrl;document.head.appendChild(canonical);}
  },[entry,slug,section]);
  return null;
}
