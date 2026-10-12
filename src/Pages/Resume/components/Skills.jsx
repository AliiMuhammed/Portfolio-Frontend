import React, { useEffect, useState } from "react";
import { client, imageUrl } from "../../../Client";
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

const SkillIcon = ({ skill }) => {
  const [failed, setFailed] = useState(false);
  const source = imageUrl(skill.icon);
  const Icon = skill.legacyIcon;
  return <span className="resume-skill-icon" aria-hidden="true">
    {Icon ? <Icon aria-hidden="true" focusable="false" /> : source && !failed
      ? <img src={`${source}${source.includes("?") ? "&" : "?"}w=64&h=64&fit=max&auto=format`} alt="" loading="lazy" width="30" height="30" onError={() => setFailed(true)} />
      : <span>◇</span>}
  </span>;
};

const Skills = () => {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    client.fetch('{"settings": *[_id == "resumeSettings" && _type == "resumeSettings"][0]{skillsManaged}, "skills": *[_type == "skill"] | order(coalesce(order, 2147483647) asc, name asc, _id asc){_id, name, category, icon, order}}', {}, { signal: controller.signal })
      .then(result => {
        if (controller.signal.aborted) return;
        if (result?.settings?.skillsManaged === true) {
          setRecords(Array.isArray(result.skills) ? result.skills.filter(skill => skill && typeof skill.name === "string" && skill.name.trim()).sort((a, b) => {
            const order = value => Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
            return order(a.order) - order(b.order) || a.name.localeCompare(b.name) || String(a._id || "").localeCompare(String(b._id || ""));
          }) : []);
        } else setRecords(skills.map(({icon, ...skill}) => ({...skill, legacyIcon: icon})));
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
