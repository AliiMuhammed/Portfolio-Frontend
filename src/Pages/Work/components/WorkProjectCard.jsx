import React, { useState } from "react";
import { FiArrowUpRight, FiGithub, FiPlay, FiImage } from "react-icons/fi";
import { imageUrl } from "../../../Client";

export const text = value => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
export const webLink = value => {
  try {
    const url = new URL(text(value));
    return ["https:", "http:"].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
};
export const technologies = value => Array.isArray(value)
  ? [...new Map(value.map(text).filter(Boolean).map(label => [label.toLowerCase(), label])).values()] : [];

const WorkProjectCard = ({ project, index, onVideo }) => {
  const [failedImage, setFailedImage] = useState(false);
  const source = imageUrl(project.imageurl);
  const title = text(project.title) || "Untitled project";
  const demo = webLink(project.link), github = webLink(project.github), video = webLink(project.video);
  const tags = technologies(project.techStack);
  return (
    <article className="work-project-card">
      <div className="work-project-media">
        {source && !failedImage
          ? <img src={source} alt={`${title} interface screenshot`} loading="lazy" width="800" height="440" onError={() => setFailedImage(true)} />
          : <p><FiImage aria-hidden="true" /> Project image unavailable.</p>}
        <span className="work-project-number">PROJECT / {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="work-project-body">
        <h3>{title}</h3>
        <p className="work-project-description">{text(project.description) || "Project description not provided."}</p>
        {tags.length > 0 && <ul className="work-project-tags" aria-label={`${title} technologies`}>{tags.map(tag => <li key={tag.toLowerCase()}>{tag}</li>)}</ul>}
        <div className="work-project-actions">
          {demo && <a href={demo} target="_blank" rel="noopener noreferrer" aria-label={`Live demo of ${title}`}>Live demo <FiArrowUpRight aria-hidden="true" /></a>}
          {github && <a href={github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub repository for ${title}`}><FiGithub aria-hidden="true" /> GitHub</a>}
          {video && <button type="button" onClick={() => onVideo(video)} aria-label={`Play video of ${title}`}><FiPlay aria-hidden="true" /> Video</button>}
          {!demo && !github && !video && <span className="work-project-unavailable">Project links unavailable.</span>}
        </div>
      </div>
    </article>
  );
};
export default WorkProjectCard;
