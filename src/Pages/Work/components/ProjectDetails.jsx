import React, { useId } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { FiX, FiArrowUpRight, FiGithub } from "react-icons/fi";
import ProjectMedia from "./ProjectMedia";
import { text, technologies, webLink } from "./WorkProjectCard";

const ProjectDetails = ({ project, onClose }) => {
  const id = useId();
  const title = text(project.title) || "Untitled project";
  const description = [project.longDescription, project.description]
    .find(value => typeof value === "string" && value.trim());
  const demo = webLink(project.link), github = webLink(project.github);
  return <Dialog className="work-dialog" open onClose={onClose} fullWidth maxWidth="md" aria-labelledby={id}>
    <header className="work-dialog-header"><div><p className="work-eyebrow">PROJECT / A CLOSER LOOK</p><h2 id={id}>{title}</h2></div><button type="button" className="work-dialog-close" aria-label="Close project details" autoFocus onClick={onClose}><FiX aria-hidden="true" /></button></header>
    <DialogContent className="work-dialog-content"><ProjectMedia project={project} /><p className="work-detail-description">{description?.trim() || "Project description not provided."}</p>
      {technologies(project.techStack).length > 0 && <ul className="work-project-tags" aria-label={`${title} technologies`}>{technologies(project.techStack).map(tag => <li key={tag.toLowerCase()}>{tag}</li>)}</ul>}
      <div className="work-project-actions">{demo && <a href={demo} target="_blank" rel="noopener noreferrer" aria-label={`Live demo of ${title}`}>Live demo <FiArrowUpRight aria-hidden="true" /></a>}{github && <a href={github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub repository for ${title}`}><FiGithub aria-hidden="true" /> GitHub</a>}{!demo && !github && <p>External project links unavailable.</p>}</div>
    </DialogContent>
  </Dialog>;
};
export default ProjectDetails;
