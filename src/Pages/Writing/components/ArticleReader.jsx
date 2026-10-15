import React, {useEffect, useRef, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import {FiX} from 'react-icons/fi';
import {client} from '../../../Client';
import {detailQuery, eligible, validSlug, text} from '../writingContract';
import ArticleBody, {headings, ArticleImage} from './ArticleBody';
import ShareActions from './ShareActions';

export default function ArticleReader({slug, onClose, onEntry}) {
  const [entry,setEntry] = useState(null), [status,setStatus] = useState('loading'), [attempt,setAttempt] = useState(0), [progress,setProgress] = useState(0);
  const scroll = useRef(null);
  useEffect(() => {
    const controller = new AbortController(); setEntry(null); setStatus('loading'); onEntry(null);
    if (!validSlug(slug)) {setStatus('missing'); return () => controller.abort();}
    client.fetch(detailQuery, {slug}, {signal:controller.signal,perspective:'published'})
      .then(value=>{if(controller.signal.aborted)return;if(!eligible(value) || value.slug !== slug){setStatus('missing');return;}setEntry(value);setStatus('ready');onEntry(value);})
      .catch(()=>{if(!controller.signal.aborted)setStatus('error');});
    return ()=>controller.abort();
  }, [slug,attempt,onEntry]);
  useEffect(() => {
    const el = scroll.current; if(!el)return;
    let frame;
    const update = () => {if(status!=='ready'){setProgress(0);frame=null;return;}const max=el.scrollHeight-el.clientHeight;setProgress(max<=0?100:Math.max(0,Math.min(100,el.scrollTop/max*100)));frame=null;};
    const schedule = ()=>{if(frame==null)frame=requestAnimationFrame(update);};
    el.scrollTop=0; schedule(); el.addEventListener('scroll',schedule,{passive:true});el.addEventListener('load',schedule,true);window.addEventListener('resize',schedule);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    observer?.observe(el);if(el.firstElementChild)observer?.observe(el.firstElementChild);
    return ()=>{cancelAnimationFrame(frame);observer?.disconnect();el.removeEventListener('scroll',schedule);el.removeEventListener('load',schedule,true);window.removeEventListener('resize',schedule);};
  }, [entry,status]);
  const toc=headings(entry?.body);
  const jump = (event,id) => {event.preventDefault();const target=scroll.current?.querySelector(`[id="${id}"]`);target?.scrollIntoView({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
  return <Dialog className="writing-reader" open fullWidth maxWidth={false} onClose={onClose} aria-labelledby="writing-reader-title" PaperProps={{className:'reader-dialog'}}>
    <div className="reader-progress" aria-hidden="true"><span style={{width:`${progress}%`}} /></div>
    <div className="reader-topbar"><span className="reader-name"><b>Ali.</b> / {entry?.entryType==='note'?'Field note':'Reading room'}</span><div className="reader-actions">{entry && <ShareActions entry={entry}/>}<button className="reader-icon reader-close" type="button" onClick={onClose} aria-label="Close reader" autoFocus><FiX aria-hidden="true" /></button></div></div>
    <div className="reader-scroll" ref={scroll}>
      {status !== 'ready' ? <div className="writing-reader-state"><h1 id="writing-reader-title">{status==='missing'?'Entry not found.':status==='error'?'Unable to load this entry.':'Opening the reading room…'}</h1><p role="status">{status==='missing'?'This entry may have been removed or is not published.':status==='error'?'Please try again.':'Loading published content…'}</p>{status==='error'&&<button type="button" onClick={()=>setAttempt(attempt+1)}>Retry</button>}<button type="button" onClick={onClose}>Back to all writing</button></div> : <div className="reader-layout">
        <article className="reader-content"><p className="reader-kicker">{entry.entryType==='note'?'Quick engineering note':'Engineering article'} / {text(entry.topic)||'Writing'}</p><h1 id="writing-reader-title">{entry.title}</h1><p className="reader-lead">{text(entry.excerpt)}</p><div className="reader-metadata"><time dateTime={entry.publishedAt}>{new Date(entry.publishedAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'})}</time><span>{Array.isArray(entry.tags)?entry.tags.filter(tag=>typeof tag==='string').join(' / '):''}</span></div>{entry.coverImage && <ArticleImage value={entry.coverImage} className="writing-reader-cover" />}<hr/><ArticleBody body={entry.body}/></article>
        <aside className="reader-toc" aria-label="On this page"><h2>On this page</h2>{toc.length?toc.map(item=><a key={item.id} href={`#${item.id}`} onClick={event=>jump(event,item.id)}>{item.title||'Section'}</a>):<p>No section headings.</p>}<p className="toc-note">SCROLL TO READ<br/>OR SELECT A SECTION</p></aside>
      </div>}
    </div>
  </Dialog>;
}
