import React, { useEffect, useState } from "react";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import "./style/work.css";
import { client } from "../../Client";
import Spinner from "../../Shared/Spinner";
import ProjectVideo from "./components/ProjectVideo";
import ProjectSpotlight from "./components/ProjectSpotlight";
import ProjectDetails from "./components/ProjectDetails";
import WorkProjectCard, { text, technologies } from "./components/WorkProjectCard";

const focusAreas = ["React interfaces", "JavaScript", "HTML & CSS", "Frontend development", "User interfaces"];

const Work = () => {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");
  const [search, setSearch] = useState("");
  const [technology, setTechnology] = useState("");
  const [video, setVideo] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    client.fetch('*[_type=="work"]', {}, { signal: controller.signal })
      .then(response => {
        if (controller.signal.aborted) return;
        setProjects(Array.isArray(response) ? response.filter(record => record && typeof record === "object" && !Array.isArray(record)) : []);
        setStatus("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, []);

  const filters = technologies(projects.flatMap(project => technologies(project.techStack))).sort((a, b) => a.localeCompare(b));
  const query = text(search).toLowerCase();
  const results = projects.filter(project => {
    const tags = technologies(project.techStack);
    return (!technology || tags.some(tag => tag.toLowerCase() === technology))
      && text([text(project.title), text(project.description), text(project.shortDescription), text(project.longDescription), ...tags].join(" ")).toLowerCase().includes(query);
  });
  const reset = () => { setSearch(""); setTechnology(""); };
  const closeVideo = () => setVideo(null);

  return (
    <div className="work-concept" id="work-main">
      <section className="work-hero" aria-labelledby="work-title">
        <div className="page-container work-hero-layout">
          <div className="work-hero-copy">
          <p className="work-eyebrow">Portfolio / Selected work</p>
          <h1 id="work-title"><span>Built with</span>{" "}<span className="work-heading-mint">curiosity.</span>{" "}<span className="work-heading-purple">Made to work.</span></h1>
          <div className="work-hero-bottom">
            <p>A closer look at my frontend interfaces and web projects. Explore the screenshots, technologies and code behind the work.</p>
            <div className="work-hero-actions">
              <a className="work-primary" href="#work-projects">Explore projects <FiArrowUpRight aria-hidden="true" /></a>
              <a href="https://github.com/AliiMuhammed" target="_blank" rel="noopener noreferrer">GitHub profile <FiArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          </div>
          {status === "ready" && projects.length > 0
            ? <ProjectSpotlight projects={projects} onExplore={setDetails} />
            : <div className="work-showcase-placeholder"><span aria-hidden="true">&lt; projects /&gt;</span><p>{status === "loading" ? "Loading the project showcase…" : status === "error" ? "The showcase is currently unavailable." : "New projects will appear here."}</p></div>}
        </div>
      </section>
      <div className="work-ticker" role="region" aria-label="Technical focus; scrolling pauses on focus" tabIndex={0}>
        <div className="work-ticker-track">{[0, 1, 2, 3].map(group => <ul className="work-ticker-group" key={group} aria-label={group === 0 ? "Focus areas" : undefined} aria-hidden={group > 0 ? "true" : undefined}>{focusAreas.map(label => <li key={label}><span>{label}</span><i aria-hidden="true">✳</i></li>)}</ul>)}</div>
      </div>
      <section className="work-index" id="work-projects" aria-labelledby="work-index-title">
        <div className="page-container">
          <p className="work-eyebrow">01 / Explore the work</p>
          <div className="work-section-heading"><h2 id="work-index-title">The project index.<br /><em>Find your focus.</em></h2><p>Browse the projects, search for an idea or explore the technologies used to build them.</p></div>
          {status === "loading" && <div className="work-data-status" role="status"><Spinner size="3" color="light" /> Loading projects…</div>}
          {status === "error" && <p className="work-data-status" role="status">Unable to load projects. Please try again later.</p>}
          {status === "ready" && projects.length === 0 && <p className="work-data-status" role="status">No projects published yet. Please check back later.</p>}
          {status === "ready" && projects.length > 0 && <>
            <div className="work-tools">
              <div className="work-filter-group">
                <label htmlFor="work-technology">Technology</label>
                <select id="work-technology" data-active={Boolean(technology)} value={technology} onChange={event => setTechnology(event.target.value)}>
                  <option value="">All Projects</option>
                  {filters.map(label => <option key={label.toLowerCase()} value={label.toLowerCase()}>{label}</option>)}
                </select>
              </div>
              <div className="work-search-group">
                <label htmlFor="work-search">Search projects</label>
                <div className="work-search-field"><FiSearch aria-hidden="true" /><input id="work-search" type="search" placeholder="Title, description or technology…" value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); document.getElementById("work-search").focus(); }}><FiX aria-hidden="true" /></button>}</div>
              </div>
            </div>
            <div className="work-results"><p role="status" aria-live="polite" aria-atomic="true">Showing <strong>{results.length}</strong> of {projects.length} projects{technology && ` · ${filters.find(label => label.toLowerCase() === technology)}`}</p><button type="button" disabled={!search && !technology} onClick={reset}>Reset filters</button></div>
            {results.length > 0
              ? <div className="work-project-grid">{results.map(project => <WorkProjectCard key={project._id || projects.indexOf(project)} project={project} index={projects.indexOf(project)} onVideo={url => setVideo({ url, title: text(project.title) || "Untitled project" })} onExplore={setDetails} />)}</div>
              : <div className="work-empty"><h3>No matching projects.</h3><p>Try another keyword or reset the filters to explore all projects.</p><button type="button" onClick={reset}>Show all projects <FiArrowUpRight aria-hidden="true" /></button></div>}
          </>}
        </div>
      </section>
      <footer className="work-footer">
        <div className="page-container">
          <p>© {new Date().getFullYear()} Ali Muhammed · Software Engineer</p>
          <div>
            <a href="#work-main">Back to top <span aria-hidden="true">↑</span></a>
            <a href="https://github.com/AliiMuhammed">GitHub <span aria-hidden="true">↗</span></a>
            <a href="https://www.linkedin.com/in/ali-muhammed-dev/">LinkedIn <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </footer>
      {details && <ProjectDetails project={details} onClose={() => setDetails(null)} />}
      {video && <ProjectVideo project={video.url} title={video.title} handleClose={closeVideo} />}
    </div>
  );
};
export default Work;
