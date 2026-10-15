import React, {useEffect, useRef, useState} from 'react';
import {PortableText} from '@portabletext/react';
import {FiCheck, FiCopy} from 'react-icons/fi';
import {safeLink, imageAssetUrl, text} from '../writingContract';
import './ArticleBody.css';

const normalizeBody = body => {
  const used = new Set();
  return (Array.isArray(body) ? body : []).filter(block => block && typeof block === 'object').map((block,index) => {
    let key = typeof block._key === 'string' ? block._key : `block-${index}`;
    if (used.has(key)) key = `${key}-${index}`;
    used.add(key);
    if (block._type !== 'block') return {...block, _key:key, _type:['articleCode','articleImage','articleCallout'].includes(block._type) ? block._type : 'writingUnknown'};
    const markDefs = (Array.isArray(block.markDefs) ? block.markDefs : []).filter(mark => mark?._type === 'link' && typeof mark._key === 'string' && !['__proto__','constructor','prototype'].includes(mark._key));
    const allowed = new Set(['strong','em','code', ...markDefs.map(mark=>mark._key)]);
    const children = (Array.isArray(block.children) ? block.children : []).filter(child => child && typeof child.text === 'string').map((child,i)=>({...child,_type:'span',_key:child._key || `span-${i}`,marks:(Array.isArray(child.marks)?child.marks:[]).filter(mark=>allowed.has(mark))}));
    return {...block,_key:key,style:['h2','h3'].includes(block.style)?block.style:'normal',children,markDefs,listItem:['bullet','number'].includes(block.listItem)?block.listItem:undefined,level:Number.isInteger(block.level)?Math.max(1,Math.min(6,block.level)):1};
  });
};
export const headings = body => normalizeBody(body).map((block,index)=>({block,index})).filter(({block})=>['h2','h3'].includes(block.style)).map(({block,index})=>({id:`section-${index}-${block._key.replace(/[^\w-]/g,'')}`,title:block.children.map(child=>child.text).join(''),block}));
export function ArticleImage({value, className}) {
  const [failed, setFailed] = useState(false);
  const url = imageAssetUrl(value?.asset?.url), alt = text(value?.alt);
  if (!url || !alt || failed) return <p className="writing-media-fallback">Image unavailable.</p>;
  return <figure className={className}><img src={`${url}?w=1200&auto=format`} alt={alt} loading="lazy" width={value.asset.metadata?.dimensions?.width} height={value.asset.metadata?.dimensions?.height} onError={()=>setFailed(true)} />{text(value.caption) && <figcaption>{value.caption}</figcaption>}</figure>;
}
function CodeBlock({value}) {
  const [feedback,setFeedback] = useState('');
  const [copied,setCopied] = useState(false);
  const timer = useRef(null), request = useRef(0);
  const code = typeof value.code === 'string' ? value.code : '';
  useEffect(() => {
    setCopied(false); setFeedback('');
    return () => {request.current += 1; clearTimeout(timer.current);};
  }, [code]);
  if (!code.trim()) return <p>Code example unavailable.</p>;
  const copy = async () => {
    const current = ++request.current;
    setFeedback('');
    try {
      await navigator.clipboard.writeText(code);
      if (current !== request.current) return;
      clearTimeout(timer.current);
      setCopied(true); setFeedback('Code copied.');
      timer.current = setTimeout(() => {setCopied(false); setFeedback('');}, 5000);
    } catch {
      if (current !== request.current) return;
      clearTimeout(timer.current);
      setCopied(false); setFeedback('Copy unavailable. Select the code below to copy manually.');
    }
  };
  const failed = feedback.startsWith('Copy unavailable');
  return <div className="code-panel"><div className="code-head"><span>{text(value.caption) || text(value.language) || 'Code'}</span><button className={`code-copy${copied ? ' is-copied' : ''}`} type="button" onClick={copy}>{copied ? <FiCheck className="code-copy-check" aria-hidden="true" /> : <FiCopy aria-hidden="true" />}<span>{copied ? 'Copied!' : 'Copy'}</span></button></div><pre role="region" tabIndex={0} aria-label="Code example"><code>{code}</code></pre><p className={`writing-copy-status${failed ? ' is-error' : ''}`} role="status" aria-atomic="true">{feedback}</p></div>;
}
export default function ArticleBody({body}) {
  if (!Array.isArray(body) || !body.length) return <p>Article content is unavailable.</p>;
  const blocks=normalizeBody(body);
  const toc = headings(blocks);
  const heading = Tag => ({value,children}) => <Tag id={toc.find(item=>item.block === value || item.block._key === value._key)?.id}>{children}</Tag>;
  return <PortableText value={blocks} onMissingComponent={false} components={{
    block:{h2:heading('h2'),h3:heading('h3')},
    marks:{code:({children})=><code className="inline">{children}</code>,link:({value,children})=>{const href=safeLink(value?.href);return href ? <a href={href}>{children}</a> : <span>{children}</span>;}},
    types:{articleCode:CodeBlock,articleImage:({value})=><ArticleImage value={value} />,articleCallout:({value})=><div className="callout" role="note">{text(value.text) || 'Note unavailable.'}</div>},
    unknownType:()=> <p>Content block unavailable.</p>,
  }} />;
}
