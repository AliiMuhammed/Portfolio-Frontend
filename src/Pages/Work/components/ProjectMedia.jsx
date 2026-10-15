import React, { useState } from "react";
import { FiImage } from "react-icons/fi";
import { imageUrl } from "../../../Client";
import { text } from "./WorkProjectCard";

const ProjectMedia = ({ project }) => {
  const [failed, setFailed] = useState(false);
  const source = imageUrl(project.imageurl);
  return <div className="work-showcase-media">{source && !failed
    ? <img src={source} alt={`${text(project.title) || "Untitled project"} interface screenshot`} width="800" height="440" onError={() => setFailed(true)} />
    : <p><FiImage aria-hidden="true" /> Project image unavailable.</p>}</div>;
};
export default ProjectMedia;
