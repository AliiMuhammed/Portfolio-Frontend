import React from "react";
import "../style/about.css";

const AboutMe = () => (
  <div className="resume-about">
    <header className="resume-section-head">
      <div><p className="resume-eyebrow">05 / A LITTLE MORE</p><h2 id="about-title">Beyond the <em>screen.</em></h2></div>
      <p>A few details about me and ways to connect.</p>
    </header>
    <div className="resume-about-grid">
      <div className="resume-about-story"><span aria-hidden="true">“</span><h3>Driven by curiosity and a passion for growth.</h3><p>I strive to bring dedication and creativity to everything I do. I'm interested in frontend development, design and learning new technologies.</p></div>
      <dl className="resume-facts">
        <div><dt>Full name</dt><dd>Ali Muhammed Ahmed</dd></div>
        <div><dt>Languages</dt><dd>Arabic, English</dd></div>
        <div><dt>Nationality</dt><dd>Egyptian</dd></div>
        <div><dt>Phone</dt><dd><a href="tel:+201066567630">(+20) 01066567630</a></dd></div>
        <div className="resume-fact-contact"><dt>Email</dt><dd><a href="mailto:ali.muhammed.dev@gmail.com">ali.muhammed.dev@gmail.com</a></dd></div>
        <div className="resume-fact-contact"><dt>LinkedIn</dt><dd><a href="https://www.linkedin.com/in/ali-muhammed-dev" target="_blank" rel="noopener noreferrer">Ali Muhammed <span aria-hidden="true">↗</span></a></dd></div>
      </dl>
    </div>
  </div>
);
export default AboutMe;
