import React, {useEffect, useId, useRef, useState} from 'react';
import {FiShare2} from 'react-icons/fi';
import {articleUrl} from '../writingContract';

export default function ShareActions({entry}) {
  const [open, setOpen] = useState(false), [feedback, setFeedback] = useState('');
  const trigger = useRef(null), box = useRef(null), id = useId();
  const url = articleUrl(process.env.REACT_APP_CANONICAL_ORIGIN, entry.slug);
  useEffect(() => {
    if (!open) return;
    const outside = event => {if (!box.current?.contains(event.target)) setOpen(false);};
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const copy = async () => {
    try {await navigator.clipboard.writeText(url); setFeedback('Link copied.');}
    catch {setFeedback('Copy unavailable. Select and copy the URL below.');}
  };
  return <div className="writing-share" ref={box} onKeyDown={event => {
    if (event.key === 'Escape' && open) {event.stopPropagation(); setOpen(false); trigger.current.focus();}
  }}>
    <button type="button" ref={trigger} className="reader-icon" aria-label={`Share ${entry.title}`} aria-expanded={open} aria-controls={id} onClick={() => {setOpen(!open); setFeedback('');}}><FiShare2 aria-hidden="true" /> Share</button>
    {open && <div className="writing-share-panel" id={id} role="group" aria-label="Share this entry">
      {url ? <>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({url})}`} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({u:url})}`} target="_blank" rel="noopener noreferrer">Facebook ↗</a>
        <a href={`https://wa.me/?${new URLSearchParams({text:`${entry.title}\n${url}`})}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
        <button type="button" onClick={copy}>Copy article URL</button>
        {feedback.startsWith('Copy unavailable') && <input aria-label="Permanent article URL" value={url} readOnly onFocus={event => event.target.select()} />}
      </> : <p>Public sharing is not configured yet. You can still read this entry.</p>}
      <p role="status">{feedback}</p>
    </div>}
  </div>;
}
