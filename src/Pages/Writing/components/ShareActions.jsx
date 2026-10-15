import React, {useEffect, useId, useRef, useState} from 'react';
import {FiCheck, FiCopy, FiShare2} from 'react-icons/fi';
import {FaLinkedinIn, FaFacebookF, FaWhatsapp} from 'react-icons/fa';
import {articleUrl} from '../writingContract';

export default function ShareActions({entry}) {
  const [open, setOpen] = useState(false), [feedback, setFeedback] = useState('');
  const [copied, setCopied] = useState(false);
  const timer = useRef(null), request = useRef(0);
  const trigger = useRef(null), box = useRef(null), id = useId();
  const url = articleUrl(process.env.REACT_APP_CANONICAL_ORIGIN, entry.slug);
  useEffect(() => {
    setCopied(false); setFeedback('');
    if (!open) return;
    const outside = event => {if (!box.current?.contains(event.target)) setOpen(false);};
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      request.current += 1; clearTimeout(timer.current);
    };
  }, [open, url]);
  const copy = async () => {
    const current = ++request.current;
    setFeedback('');
    try {
      await navigator.clipboard.writeText(url);
      if (current !== request.current) return;
      clearTimeout(timer.current);
      setCopied(true); setFeedback('Link copied.');
      timer.current = setTimeout(() => {setCopied(false); setFeedback('');}, 5000);
    } catch {
      if (current !== request.current) return;
      clearTimeout(timer.current);
      setCopied(false); setFeedback('Copy unavailable. Select and copy the URL below.');
    }
  };
  const failed = feedback.startsWith('Copy unavailable');
  return <div className="writing-share" ref={box} onKeyDown={event => {
    if (event.key === 'Escape' && open) {event.stopPropagation(); setOpen(false); trigger.current.focus();}
  }}>
    <button type="button" ref={trigger} className="reader-icon" aria-label={`Share ${entry.title}`} aria-expanded={open} aria-controls={id} onClick={() => {setOpen(!open); setFeedback('');}}><FiShare2 aria-hidden="true" /> Share</button>
    {open && <div className="writing-share-panel" id={id} role="group" aria-label="Share this entry">
      {url ? <>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({url})}`} target="_blank" rel="noopener noreferrer"><FaLinkedinIn aria-hidden="true" />LinkedIn</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({u:url})}`} target="_blank" rel="noopener noreferrer"><FaFacebookF aria-hidden="true" />Facebook</a>
        <a href={`https://wa.me/?${new URLSearchParams({text:`${entry.title}\n${url}`})}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" />WhatsApp</a>
        <button className={`writing-share-copy${copied ? ' is-copied' : ''}`} type="button" onClick={copy}>{copied ? <FiCheck className="writing-share-check" aria-hidden="true" /> : <FiCopy aria-hidden="true" />}<span>{copied ? 'Copied!' : 'Copy article URL'}</span></button>
        {failed && <input aria-label="Permanent article URL" value={url} readOnly onFocus={event => event.target.select()} />}
      </> : <p>Public sharing is not configured yet. You can still read this entry.</p>}
      <p className={`writing-share-status${failed ? ' is-error' : ''}`} role="status" aria-atomic="true">{feedback}</p>
    </div>}
  </div>;
}
