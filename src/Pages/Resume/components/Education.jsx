import React from "react";
import "../style/experience-education.css";

const Education = () => (
  <div className="resume-education">
    <header className="resume-section-head">
      <div><p className="resume-eyebrow">02 / EDUCATION</p><h2 id="education-title">Built on <em>curiosity.</em></h2></div>
      <p>My academic background in computer science.</p>
    </header>
    <div className="resume-education-grid">
      <article className="resume-degree">
        <p className="resume-role-date">Sep 2020 — Jun 2024</p>
        <h3>Bachelor of Computer Science — CS Department</h3>
        <p>Helwan University</p>
      </article>
      <div className="resume-degree-aside"><span aria-hidden="true">✧</span><p className="resume-eyebrow">ACADEMIC FOUNDATION</p><strong>Computer Science</strong><p>Studied at Helwan University from September 2020 to June 2024.</p></div>
    </div>
  </div>
);
export default Education;
