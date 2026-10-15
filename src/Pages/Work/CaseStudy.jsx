import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import {FiArrowLeft, FiArrowUpRight, FiGithub, FiPlay} from 'react-icons/fi';
import {client} from '../../Client';
import {detailQuery, eligible, validSlug} from './caseStudyContract';
import {text, technologies, webLink} from './components/WorkProjectCard';
import ProjectMedia from './components/ProjectMedia';
import ProjectVideo from './components/ProjectVideo';
import ArticleBody, {headings} from '../Writing/components/ArticleBody';
import WritingMetadata from '../Writing/components/WritingMetadata';
import './style/work.css';
import './style/caseStudy.css';

export default function CaseStudy() {
  const {slug} = useParams(), location = useLocation();
  const [state, setState] = useState({slug:null, status:'loading', project:null});
  const [video, setVideo] = useState(false);
  const titleRef = useRef(null);
  const status = state.slug === slug ? state.status : 'loading';
  const project = state.slug === slug ? state.project : null;
  useEffect(() => {
    const controller = new AbortController();
    setVideo(false);
    setState({slug, status:'loading', project:null});
    if (!validSlug(slug)) {setState({slug, status:'missing', project:null}); return () => controller.abort();}
    client.fetch(detailQuery, {slug}, {signal:controller.signal, perspective:'published'})
      .then(result => {if (!controller.signal.aborted) setState({slug, status:eligible(result) && result.slug === slug ? 'ready' : 'missing', project:eligible(result) && result.slug === slug ? result : null});})
      .catch(() => {if (!controller.signal.aborted) setState({slug, status:'error', project:null});});
    return () => controller.abort();
  }, [slug]);
  useEffect(() => {if (status !== 'loading') titleRef.current?.focus({preventScroll:true});}, [status]);
  const previous = location.state?.workReturn;
  const back = previous && /^\/work(?:\?[^#]*)?$/.test(previous.url) ? previous.url : '/work';
  const demo = webLink(project?.link), github = webLink(project?.github), videoUrl = webLink(project?.video);
  const toc = headings(project?.caseStudy).filter(item=>text(item.title));
  const summary = text(project?.shortDescription) || text(project?.description);
  const metadata = project ? {...project, excerpt:summary} : null;
  const actions = <div className="work-project-actions case-study-actions">
    {demo && <a href={demo} target="_blank" rel="noopener noreferrer">Live demo <FiArrowUpRight aria-hidden="true" /></a>}
    {github && <a href={github} target="_blank" rel="noopener noreferrer"><FiGithub aria-hidden="true" /> GitHub repository</a>}
    {videoUrl && <button type="button" onClick={()=>setVideo(true)}><FiPlay aria-hidden="true" /> Project video</button>}
  </div>;
  return <div className="work-concept case-study" id="case-study-top">
    <WritingMetadata entry={metadata} slug={slug} section="work" />
    <main id="case-study-main" tabIndex={-1}>
      <header className="case-study-intro">
        <div className="page-container">
          <Link className="case-study-back" to={back} state={previous ? {workReturn:previous} : undefined}><FiArrowLeft aria-hidden="true" /> Back to Work</Link>
          <p className="work-eyebrow">Project / Engineering case study</p>
          <h1 ref={titleRef} tabIndex={-1}>{status === 'ready' ? project.title : status === 'loading' ? 'Loading case study…' : status === 'missing' ? 'Case study not found.' : 'Case study unavailable.'}</h1>
          {status === 'loading' && <p role="status">Loading the published project narrative…</p>}
          {status === 'missing' && <p role="status">This case study is not published or is no longer available. Explore the project index for available work.</p>}
          {status === 'error' && <p role="alert">Unable to load this case study. Please try again later.</p>}
          {project && <>{summary && <p className="case-study-summary">{summary}</p>}
            {technologies(project.techStack).length > 0 && <ul className="work-project-tags" aria-label={`${project.title} technologies`}>{technologies(project.techStack).map(tag=><li key={tag.toLowerCase()}>{tag}</li>)}</ul>}
            {actions}</>}
        </div>
      </header>
      {project && <div className="page-container">
        <div className="case-study-preview"><div className="work-browser-bar"><span className="work-browser-dots" aria-hidden="true"><i/><i/><i/></span><span>project / interface</span></div><ProjectMedia key={slug} project={project} /></div>
        <div className="case-study-layout">
          {toc.length > 0 && <nav className="case-study-toc" aria-label="Case study sections"><p className="work-eyebrow">Inside the project</p>{toc.map(item=><a key={item.id} href={`#${item.id}`}>{item.title}</a>)}</nav>}
          <article className="case-study-narrative" aria-label={`${project.title} engineering narrative`}><ArticleBody body={project.caseStudy} /></article>
        </div>
        <div className="case-study-end">{actions}<Link className="case-study-back" to={back} state={previous ? {workReturn:previous} : undefined}><FiArrowLeft aria-hidden="true" /> Back to Work</Link></div>
      </div>}
    </main>
    <footer className="work-footer"><div className="page-container"><p>© {new Date().getFullYear()} Ali Muhammed · Software Engineer</p><div><a href="#case-study-main">Back to top ↑</a><a href="https://github.com/AliiMuhammed">GitHub ↗</a><a href="https://www.linkedin.com/in/ali-muhammed-dev/">LinkedIn ↗</a></div></div></footer>
    {video && videoUrl && <ProjectVideo project={videoUrl} title={project.title} handleClose={()=>setVideo(false)} />}
  </div>;
}
