import React from "react";
import "../style/skills.css";
import { FaHtml5, FaCss3, FaReact, FaFigma, FaGitAlt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { SiMui, SiRedux } from "react-icons/si";

const skills = [
  { name: "HTML5", category: "Frontend", icon: FaHtml5 },
  { name: "CSS3", category: "Frontend", icon: FaCss3 },
  { name: "JavaScript", category: "Frontend", icon: IoLogoJavascript },
  { name: "React", category: "Frontend", icon: FaReact },
  { name: "Figma", category: "Design & UI", icon: FaFigma },
  { name: "Material UI", category: "Design & UI", icon: SiMui },
  { name: "Git", category: "Tools & state", icon: FaGitAlt },
  { name: "Redux", category: "Tools & state", icon: SiRedux },
];

const Skills = () => (
  <div className="skills-container">
    <div className="resume-section-head">
      <div><p className="resume-eyebrow">03 / TOOLKIT</p><h2 id="skills-title">Tools of the <em>trade.</em></h2></div>
      <p>The technologies and tools I use for frontend development, interface design and version control.</p>
    </div>
    <ul className="cards resume-skill-grid" aria-label="Technologies and tools">
      {skills.map(({ name, category, icon: Icon }) => (
        <li className="card resume-skill-card" key={name}>
          <span className="resume-skill-icon"><Icon aria-hidden="true" focusable="false" /></span>
          <div><span className="resume-skill-name">{name}</span><span className="resume-skill-category">{category}</span></div>
        </li>
      ))}
    </ul>
  </div>
);

export default Skills;
