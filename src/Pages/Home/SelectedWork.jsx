import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client, imageUrl } from "../../Client";

const text = (value) => typeof value === "string" ? value.trim() : "";
const webLink = (value) => /^https?:\/\//i.test(text(value)) ? text(value) : undefined;

const ProjectCard = ({ project, index }) => {
  const source = imageUrl(project.imageurl);
  const [failedImage, setFailedImage] = useState(false);
  const title = text(project.title) || "Untitled project";
  const demo = webLink(project.link);
  const github = webLink(project.github);
  const technologies = Array.isArray(project.techStack)
    ? [...new Set(project.techStack.map(text).filter(Boolean))] : [];

  return (
    <article className="home-project-card">
      <div className="home-project-media">
        {source && !failedImage ? <img src={source} alt={`${title} interface screenshot`} loading="lazy" width="800" height="440" onError={() => setFailedImage(true)} /> : <p>Project image unavailable.</p>}
        <span className="home-project-id">Project / {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="home-project-content">
        <h3>{title}</h3>
        {text(project.description) && <p>{text(project.description)}</p>}
        {technologies.length > 0 && <ul className="home-tags" aria-label={`${title} technologies`}>{technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>}
        <div className="home-project-links">
          {demo && <a href={demo} aria-label={`Live demo of ${title}`}>Live demo <span aria-hidden="true">↗</span></a>}
          {github && <a href={github} aria-label={`GitHub repository for ${title}`}>GitHub <span aria-hidden="true">↗</span></a>}
          {!demo && !github && <Link to="/work" aria-label={`View ${title} in Work`}>View in Work <span aria-hidden="true">↗</span></Link>}
        </div>
      </div>
    </article>
  );
};

const SelectedWork = () => {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    client.fetch('*[_type=="work"]', {}, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        setProjects(Array.isArray(response) ? response.filter((record) => record && typeof record === "object" && !Array.isArray(record)).slice(0, 2) : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="home-work home-section" aria-labelledby="home-work-heading">
      <div className="page-container">
        <p className="home-label">02 / Selected work</p>
        <div className="home-section-head"><h2 id="home-work-heading">Selected work. <em>Real code.</em></h2><p>A glimpse of my projects, with screenshots and details from my portfolio.</p></div>
        {status === "loading" && <p className="home-data-status" role="status">Loading selected projects…</p>}
        {status === "error" && <p className="home-data-status" role="status">Unable to load projects right now. Please try again later.</p>}
        {status === "ready" && projects.length === 0 && <p className="home-data-status" role="status">No projects to show yet. Please check back later.</p>}
        {status === "ready" && projects.length > 0 && <div className="home-project-grid">{projects.map((project, index) => <ProjectCard key={project._id || index} project={project} index={index} />)}</div>}
        <Link className="home-text-link home-work-all" to="/work">Explore all work <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
};

export default SelectedWork;
