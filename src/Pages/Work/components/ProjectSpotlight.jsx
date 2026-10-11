import React, { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import ProjectMedia from "./ProjectMedia";
import { text, technologies } from "./WorkProjectCard";

const ProjectSpotlight = ({ projects, onExplore }) => {
  const preferred = projects.findIndex(project => text(project.title).toLowerCase().replace(/\s/g, "") === "brandstore");
  const [index, setIndex] = useState(preferred < 0 ? 0 : preferred);
  const project = projects[index];
  const title = text(project.title) || "Untitled project";
  return <section className="work-showcase" aria-label="Featured projects">
    <div className="work-browser-bar"><span className="work-browser-dots" aria-hidden="true"><i /><i /><i /></span><span>project preview</span><span>LIVE INDEX</span></div>
    <ProjectMedia key={index} project={project} />
    <div className="work-showcase-info">
      <div aria-live="polite" aria-atomic="true"><p className="work-eyebrow">Featured / {String(index + 1).padStart(2, "0")} of {projects.length}</p><h2>{title}</h2><ul className="work-project-tags" aria-label={`${title} featured technologies`}>{technologies(project.techStack).map(tag => <li key={tag.toLowerCase()}>{tag}</li>)}</ul></div>
      <div className="work-showcase-controls"><button className="work-explore" type="button" onClick={() => onExplore(project)}>Explore project <FiArrowUpRight aria-hidden="true" /></button><div className="work-showcase-arrows"><button type="button" aria-label="Previous featured project" disabled={projects.length < 2} onClick={() => setIndex((index + projects.length - 1) % projects.length)}><FiArrowLeft aria-hidden="true" /></button><button type="button" aria-label="Next featured project" disabled={projects.length < 2} onClick={() => setIndex((index + 1) % projects.length)}><FiArrowRight aria-hidden="true" /></button></div></div>
    </div>
  </section>;
};
export default ProjectSpotlight;
