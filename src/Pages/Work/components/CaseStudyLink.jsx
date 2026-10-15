import {Link, useLocation, useNavigate} from 'react-router-dom';

// Ephemeral history context; no storage or permanent reading list.
export const workPositions = new Map();
export default function CaseStudyLink({project, children, className, label}) {
  const location = useLocation(), navigate = useNavigate();
  const id = `${className ? 'spotlight-case-study' : 'case-study'}-${project.slug}`;
  return <Link id={id} className={className} aria-label={label} to={`/work/${project.slug}`} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const workReturn = location.pathname === '/work' ? {url:`/work${location.search}`, scrollY:window.scrollY, focusId:id} : {url:'/work', scrollY:0};
    if (location.pathname === '/work') {workPositions.set(location.key, workReturn); if (workPositions.size > 20) workPositions.delete(workPositions.keys().next().value);}
    navigate(`/work/${project.slug}`, {state:{workReturn}});
  }}>{children}</Link>;
}
