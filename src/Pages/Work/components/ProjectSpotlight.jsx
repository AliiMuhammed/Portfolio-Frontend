import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import ProjectMedia from "./ProjectMedia";
import { text, technologies } from "./WorkProjectCard";

const ProjectSpotlight = ({ projects, onExplore }) => {
  const [index, setIndex] = useState(0);
  const project = projects[index];
  const title = text(project.title) || "Untitled project";
  return <section className="work-showcase" aria-label="Featured projects">
    <div className="work-showcase-window">
      <div className="work-browser-bar"><span className="work-browser-dots" aria-hidden="true"><i /><i /><i /></span><span>project preview</span><span>LIVE INDEX</span></div>
      <div className="work-showcase-stage">
        <ProjectMedia key={index} project={project} />
        <div className="work-showcase-info" aria-live="polite" aria-atomic="true"><p className="work-eyebrow">Featured / {String(index + 1).padStart(2, "0")} of {projects.length}</p><h2>{title}</h2></div>
        <div className="work-showcase-arrows work-showcase-controls"><button type="button" aria-label="Previous featured project" disabled={projects.length < 2} onClick={() => setIndex((index + projects.length - 1) % projects.length)}><FiArrowLeft aria-hidden="true" /></button><button type="button" aria-label="Next featured project" disabled={projects.length < 2} onClick={() => setIndex((index + 1) % projects.length)}><FiArrowRight aria-hidden="true" /></button></div>
      </div>
      <div className="work-showcase-footer work-showcase-controls"><ul className="work-project-tags" aria-label={`${title} featured technologies`}>{technologies(project.techStack).map(tag => <li key={tag.toLowerCase()}>{tag}</li>)}</ul><button className="work-explore" type="button" onClick={() => onExplore(project)}>Explore project <FiArrowUpRight aria-hidden="true" /></button></div>
    </div>
    <span className="work-project-badge" aria-hidden="true"><strong>{String(index + 1).padStart(2, "0")}</strong><span>OF {projects.length}</span></span>
    <span className="work-showcase-note" aria-hidden="true">INTERFACES / IN FOCUS</span>
  </section>;
};
export default ProjectSpotlight;
