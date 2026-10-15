import React, { useEffect, useRef, useState } from "react";
import "./style/resume.css";
import portrait from "../../Assets/me_resume_page.webp";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Skills from "./components/Skills";
import AboutMe from "./components/AboutMe";
import Courses from "./components/Courses";
import CvDownload from "../Home/CvDownload";

const sections = [
  { id: "experience", label: "Experience", content: Experience },
  { id: "education", label: "Education", content: Education },
  { id: "skills", label: "Skills", content: Skills },
  { id: "certifications", label: "Certificates", content: Courses },
  { id: "about", label: "About", content: AboutMe },
];

const Resume = () => {
  const [activeSection, setActiveSection] = useState("experience");
  const sectionLinks = useRef(null);

  useEffect(() => {
    const revealActiveLink = () => {
      const list = sectionLinks.current;
      if (!list || list.scrollWidth <= list.clientWidth) return;
      const link = list.querySelector('[aria-current="location"]');
      if (!link) return;
      const viewport = list.getBoundingClientRect();
      const target = link.getBoundingClientRect();
      const left = target.left < viewport.left + 8
        ? target.left - viewport.left - 8
        : target.right > viewport.right - 8 ? target.right - viewport.right + 8 : 0;
      if (left) list.scrollBy({ left, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    revealActiveLink();
    window.addEventListener("resize", revealActiveLink);
    return () => window.removeEventListener("resize", revealActiveLink);
  }, [activeSection]);

  useEffect(() => {
    let frame;
    const updateSection = () => {
      let current = sections[0].id;
      sections.forEach(({ id }) => {
        if (document.getElementById(id)?.getBoundingClientRect().top <= 190) current = id;
      });
      // The final section may be too short to reach the activation line.
      if (document.documentElement.scrollHeight > window.innerHeight &&
          window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1].id;
      }
      setActiveSection(current);
      frame = undefined;
    };
    const onScroll = () => {
      if (frame === undefined) frame = requestAnimationFrame(updateSection);
    };
    // Route-level scroll restoration runs first; native section links keep their behavior.
    frame = requestAnimationFrame(() => {
      const target = sections.find(({ id }) => window.location.hash === `#${id}`);
      if (target) document.getElementById(target.id)?.scrollIntoView();
      updateSection();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
    <main className="resume-concept" id="resume-main" tabIndex={-1}>
      <section className="resume-hero page-container" aria-labelledby="resume-title">
        <div className="resume-hero-copy">
          <p className="resume-eyebrow">02 / RESUME · SOFTWARE ENGINEER</p>
          <h1 id="resume-title">The work<br />behind <em>the work.</em></h1>
          <p className="resume-intro">I'm <strong>Ali Muhammed</strong>, a software engineer focused on React and frontend development. Here's a closer look at my professional journey, academic background and the tools I work with.</p>
          <div className="resume-hero-actions">
            <CvDownload className="resume-action-primary resume-cv" label="Download My Résumé" />
            <a href="#experience">Explore experience <span aria-hidden="true">↗</span></a>
          </div>
          <ul className="resume-focus" aria-label="Professional focus"><li>REACT.JS</li><li>FRONTEND DEVELOPMENT</li><li>UI DESIGN</li></ul>
        </div>
        <div className="resume-identity">
          <span className="resume-identity-label">&lt; career /&gt;</span>
          <pre className="resume-identity-code" aria-hidden="true"><code>const focus = {'{'}<br />  role: <span>"frontend"</span>,<br />  tool: <span>"React"</span><br />{'}'};</code></pre>
          <img src={portrait} alt="Ali Muhammed, software engineer" className="resume-portrait" />
          <div className="resume-identity-name"><strong>Ali Muhammed Ahmed</strong><span>SOFTWARE ENGINEER</span></div>
          <span className="resume-stamp" aria-hidden="true">keep<br />building ↗</span>
        </div>
      </section>
      <div className="resume-layout page-container">
        <nav className="resume-section-nav" aria-label="Resume sections">
          <p className="resume-eyebrow">IN THIS RESUME</p>
          <ul ref={sectionLinks}>{sections.map(({ id, label }, index) => (
            <li key={id}><a href={`#${id}`} aria-current={activeSection === id ? "location" : undefined}><span aria-hidden="true">0{index + 1}</span>{label}</a></li>
          ))}</ul>
        </nav>
        <div className="resume-sections">
          {sections.map(({ id, content: Content }) => (
            <section key={id} id={id} className="resume-section" aria-labelledby={`${id}-title`} tabIndex={-1}><Content /></section>
          ))}
        </div>
      </div>
    </main>
    <footer className="resume-footer">
      <div className="page-container">
        <p>© {new Date().getFullYear()} Ali Muhammed · Software Engineer</p>
        <div><a href="#resume-main">Back to top <span aria-hidden="true">↑</span></a><a href="https://github.com/AliiMuhammed">GitHub <span aria-hidden="true">↗</span></a><a href="https://www.linkedin.com/in/ali-muhammed-dev/">LinkedIn <span aria-hidden="true">↗</span></a></div>
      </div>
    </footer>
    </>
  );
};

export default Resume;
