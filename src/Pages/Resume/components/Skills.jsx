import React, { useEffect, useState } from "react";
import { client } from "../../../Client";
import "../style/skills.css";
import SkillIcon from "./SkillIcon";

const skills = [
  { name: "HTML5", category: "Frontend", iconId: "local:html5" },
  { name: "CSS3", category: "Frontend", iconId: "local:css3" },
  { name: "JavaScript", category: "Frontend", iconId: "local:javascript" },
  { name: "React", category: "Frontend", iconId: "local:react" },
  { name: "Figma", category: "Design & UI", iconId: "local:figma" },
  { name: "Material UI", category: "Design & UI", iconId: "local:mui" },
  { name: "Git", category: "Tools & state", iconId: "local:git" },
  { name: "Redux", category: "Tools & state", iconId: "local:redux" },
];

const Skills = () => {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    client.fetch('{"settings": *[_id == "resumeSettings" && _type == "resumeSettings"][0]{skillsManaged}, "skills": *[_type == "skill"] | order(coalesce(order, 2147483647) asc, name asc, _id asc){_id, name, category, iconId, iconPackage, iconPath, order}}', {}, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (result?.settings?.skillsManaged === true) {
          setRecords(Array.isArray(result.skills) ? result.skills.filter(skill => skill && typeof skill.name === "string" && skill.name.trim()).sort((a, b) => {
            const order = value => Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
            return order(a.order) - order(b.order) || a.name.localeCompare(b.name) || String(a._id || "").localeCompare(String(b._id || ""));
          }) : []);
        } else setRecords(skills);
        setStatus("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, []);
  return (
  <div className="skills-container">
    <div className="resume-section-head">
      <div><p className="resume-eyebrow">03 / TOOLKIT</p><h2 id="skills-title">Tools of the <em>trade.</em></h2></div>
      <p>The technologies and tools I use for frontend development, interface design and version control.</p>
    </div>
    {status === "loading" && <p role="status">Loading skills…</p>}
    {status === "error" && <p role="status">Unable to load skills right now. Please try again later.</p>}
    {status === "ready" && records.length === 0 && <p role="status">No skills published yet.</p>}
    <ul className="cards resume-skill-grid" aria-label="Technologies and tools">
      {records.map((skill, index) => (
        <li className="card resume-skill-card" key={skill._id || skill.name || index}>
          <SkillIcon skill={skill} />
          <div><span className="resume-skill-name">{skill.name}</span><span className="resume-skill-category">{typeof skill.category === "string" && skill.category.trim() ? skill.category : "Category not listed"}</span></div>
        </li>
      ))}
    </ul>
  </div>
);
};

export default Skills;
