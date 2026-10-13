import {useEffect} from 'react';
import {articleUrl, origin, imageAssetUrl, text} from '../writingContract';
const selector='title, meta[name="description"], meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"], link[rel="canonical"]';
export default function WritingMetadata({entry,slug}) {
  useEffect(()=>{
    // Server responses retain the trusted build's original tags for SPA navigation cleanup.
    const template=document.getElementById('writing-base-metadata');
    const baseline=template?.dataset.head ? new DOMParser().parseFromString(new TextDecoder().decode(Uint8Array.from(atob(template.dataset.head),char=>char.charCodeAt(0))),'text/html').head : document.head;
    const base=[...baseline.querySelectorAll(selector)].map(node=>node.cloneNode(true));
    return ()=>{document.head.querySelectorAll(selector).forEach(node=>node.remove());base.forEach(node=>document.head.appendChild(node));};
  },[]);
  useEffect(()=>{
    if(slug&&!entry)return;
    const url=articleUrl(process.env.REACT_APP_CANONICAL_ORIGIN,entry?.slug);
    document.head.querySelectorAll(selector).forEach(node=>node.remove());
    const title=document.createElement('title');title.textContent=entry?`${text(entry.seoTitle)||entry.title} — Ali Muhammed`:'Writing & Engineering Notes — Ali Muhammed';document.head.appendChild(title);
    const meta=document.createElement('meta');meta.name='description';meta.content=entry?text(entry.seoDescription)||text(entry.excerpt):'Engineering articles and practical field notes by Ali Muhammed.';document.head.appendChild(meta);
    const currentOrigin=origin(process.env.REACT_APP_CANONICAL_ORIGIN);
    const pageUrl=url||(currentOrigin?`${currentOrigin}/writing`:null);
    const values={'og:type':entry?'article':'website','og:title':title.textContent,'og:description':meta.content,'og:site_name':'Ali Muhammed','twitter:card':'summary','twitter:title':title.textContent,'twitter:description':meta.content};
    if(pageUrl)values['og:url']=pageUrl;
    const image=[entry?.socialImage,entry?.coverImage].find(value=>imageAssetUrl(value?.asset?.url));
    if(image){values['og:image']=image.asset.url;values['twitter:image']=image.asset.url;values['twitter:card']='summary_large_image';}
    if(entry)values['article:published_time']=entry.publishedAt;
    Object.entries(values).forEach(([key,value])=>{const tag=document.createElement('meta');tag.setAttribute(key.startsWith('twitter:')?'name':'property',key);tag.content=value;document.head.appendChild(tag);});
    if(pageUrl){const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=pageUrl;document.head.appendChild(canonical);}
  },[entry,slug]);
  return null;
}
