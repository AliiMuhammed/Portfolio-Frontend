import React, { useEffect, useRef, useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiArrowUpRight } from "react-icons/fi";
import emailjs from "emailjs-com";
import { validateForm, fieldRules } from "./components/validation";
import "./style/contact.css";

const emptyDraft = { firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" };
const topics = ["Project inquiry", "Collaboration", "Say hello"];
const profiles = { GitHub: "https://github.com/AliiMuhammed", LinkedIn: "https://www.linkedin.com/in/ali-muhammed-dev/" };

export default function ContactMe() {
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});
  const [topic, setTopic] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const update = (name, value) => {
    if (pending.current) return;
    const next = { ...draft, [name]: value };
    setDraft(next);
    if (name === "subject") setTopic(topics.includes(value) ? value : "");
    if (errors[name]) {
      const error = validateForm(next)[name];
      setErrors(previous => { const updated = { ...previous }; if (error) updated[name] = error; else delete updated[name]; return updated; });
    }
    setFeedback(null);
  };
  const chooseTopic = value => {
    if (pending.current) return;
    if (topic === value) { setTopic(""); return; }
    update("subject", value);
  };
  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    const invalid = validateForm(draft);
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setFeedback({ kind: "error", text: "Please correct the highlighted fields before sending." });
      form.elements.namedItem(Object.keys(invalid)[0]).focus();
      return;
    }
    // Keep controlled values and the DOM serialized by sendForm identical.
    const normalized = Object.fromEntries(Object.entries(draft).map(([name, value]) => [name, value.trim()]));
    Object.entries(normalized).forEach(([name, value]) => { form.elements.namedItem(name).value = value; });
    setDraft(normalized);
    pending.current = true;
    setSending(true);
    setFeedback({ kind: "sending", text: "Sending your message…" });
    try {
      await emailjs.sendForm('service_o2o2h4p', 'template_cahhqro', form, 'DwMax_6jhXFwlDPp5');
      if (!mounted.current) return;
      setDraft(emptyDraft);
      setTopic("");
      setErrors({});
      setFeedback({ kind: "success", text: "Your message was sent successfully. Thank you for getting in touch!" });
    } catch {
      if (!mounted.current) return;
      setFeedback({ kind: "error", text: "Your message could not be sent. Your draft is preserved; please try again or email me directly." });
    } finally {
      pending.current = false;
      if (mounted.current) setSending(false);
    }
  };

  return <main className="contact-concept" id="contact-main" tabIndex={-1}>
    <div className="page-container">
      <section className="contact-hero" aria-labelledby="contact-heading">
        <div>
          <p className="contact-kicker">04 / CONTACT · LET’S CONNECT</p>
          <h1 id="contact-heading">Have an <span>idea?</span><br />Let’s make it <em>real.</em></h1>
          <p className="contact-lead">I’m Ali Muhammed, a software engineer focused on React and frontend development. Have a project in mind or a question? Let’s start a conversation.</p>
          <p className="contact-location"><FiMapPin aria-hidden="true" /> Cairo, Egypt</p>
        </div>
        <div className="contact-art" aria-hidden="true">
          <div className="contact-orbit"><FiMail /></div>
          <div className="contact-note">A conversation starts<br /><strong>with a hello.</strong></div>
          <div className="contact-code">const next = <span>"hello";</span></div>
        </div>
      </section>
      <div className="contact-layout">
        <section className="contact-methods" aria-labelledby="contact-method-heading">
          <p className="contact-kicker">01 / GET IN TOUCH</p>
          <h2 id="contact-method-heading">Good conversations.<br />Thoughtful interfaces.</h2>
          <p>Choose the way that works for you. You can also send a message using the form.</p>
          <a className="contact-card" href="mailto:ali.muhammed.dev@gmail.com"><FiMail aria-hidden="true" /><span><small>EMAIL</small><strong>ali.muhammed.dev@gmail.com</strong></span><FiArrowUpRight aria-hidden="true" /></a>
          <a className="contact-card" href="tel:+201066567630"><FiPhone aria-hidden="true" /><span><small>PHONE</small><strong>(+20) 01066567630</strong></span><FiArrowUpRight aria-hidden="true" /></a>
          <div className="contact-card"><FiMapPin aria-hidden="true" /><span><small>LOCATION</small><strong>Cairo, Egypt</strong></span></div>
          <div className="contact-profiles">{Object.entries(profiles).map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label} <FiArrowUpRight aria-hidden="true" /></a>)}</div>
        </section>
        <section className="contact-panel" aria-labelledby="contact-form-heading">
          <div className="contact-panel-head"><p className="contact-kicker">02 / YOUR MESSAGE</p><h2 id="contact-form-heading">Tell me what you<br />have in mind.</h2><p>Fields marked required are needed to send your message. Last name and phone are optional.</p></div>
          <form onSubmit={submit} noValidate aria-labelledby="contact-form-heading" aria-busy={sending}>
            <div className="contact-topic-label" id="contact-topic-label">What’s it about?</div>
            <div className="contact-topics" role="group" aria-labelledby="contact-topic-label">{topics.map(value => <button key={value} type="button" disabled={sending} aria-pressed={topic === value} onClick={() => chooseTopic(value)}>{value}</button>)}</div>
            <div className="contact-fields">{Object.entries(fieldRules).map(([name, rule]) => {
              const id = `contact-${name}`;
              const props = { id, name, value: draft[name], maxLength: rule.max, required: rule.required, readOnly: sending, onChange: event => update(name, event.target.value), "aria-invalid": Boolean(errors[name]), "aria-describedby": [errors[name] ? `${id}-error` : "", name === "message" ? "contact-counter" : ""].filter(Boolean).join(" ") || undefined };
              return <div key={name} className={`contact-field ${name === "subject" || name === "message" ? "contact-field-wide" : ""}`}>
                <label htmlFor={id}>{rule.label} <span>{rule.required ? "Required" : "Optional"}</span></label>
                {name === "message" ? <textarea {...props} rows={6} /> : <input {...props} type={name === "email" ? "email" : name === "phone" ? "tel" : "text"} autoComplete={rule.autocomplete || "off"} />}
                {errors[name] && <p className="contact-error" id={`${id}-error`}>{errors[name]}</p>}
                {name === "message" && <p className="contact-counter" id="contact-counter">{draft.message.length} / 1200 characters</p>}
              </div>;
            })}</div>
            <div className="contact-send-row"><button className="contact-send" type="submit" disabled={sending}>{sending ? "Sending…" : "Send Message"}<FiArrowUpRight aria-hidden="true" /></button><span>Your message is sent using EmailJS.</span></div>
            <div className={`contact-feedback ${feedback?.kind || ""}`} role="status" aria-live="polite" aria-atomic="true">{feedback?.text}</div>
          </form>
        </section>
      </div>
      <section className="contact-direct"><div><p className="contact-kicker">PREFER EMAIL?</p><h2>Keep it simple. <em>Say hello.</em></h2><p>You can reach me directly without filling in the form.</p></div><a href="mailto:ali.muhammed.dev@gmail.com">Write an email <FiArrowUpRight aria-hidden="true" /></a></section>
      <footer className="contact-footer"><p>© {new Date().getFullYear()} Ali Muhammed · Software Engineer</p><div><a href="#contact-main">Back to top ↑</a>{Object.entries(profiles).map(([label, href]) => <a key={label} href={href}>{label} ↗</a>)}</div></footer>
    </div>
  </main>;
}
