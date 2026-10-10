import React from "react";
import { Link } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import { FaLinkedinIn, FaFacebookF, FaGithub, FaWhatsapp } from "react-icons/fa";
import me from "../../Assets/me.webp";
import SelectedWork from "./SelectedWork";
import "./style/home.css";

const socials = [
  ["LinkedIn", "https://www.linkedin.com/in/ali-muhammed-dev/", FaLinkedinIn],
  ["GitHub", "https://github.com/AliiMuhammed", FaGithub],
  ["Facebook", "https://www.facebook.com/profile.php?id=100004223081202", FaFacebookF],
  ["WhatsApp", "https://wa.me/201066567630", FaWhatsapp],
];

const Home = () => (
  <div className="home-concept">
    <a className="home-skip" href="#home-main">Skip to Home content</a>
    <main id="home-main" tabIndex={-1}>
      <section className="home-hero" aria-labelledby="home-heading">
        <div className="page-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-label"><span aria-hidden="true">01 /</span> Software Engineer</p>
            <h1 id="home-heading"><span>Engineering</span>{" "}<span>meets a little</span>{" "}<em>imagination.</em></h1>
            <p className="home-description">Hey, I'm <strong>Ali Muhammed.</strong> I'm a software engineer specializing in React and web development. I build dynamic interfaces and enjoy connecting <strong>code and design.</strong></p>
            <div className="home-actions">
              <Link className="home-button home-button-primary" to="/work">Explore my work <span aria-hidden="true">↗</span></Link>
              <Link className="home-button home-button-ghost" to="/resume">Get to know me <span aria-hidden="true">↗</span></Link>
            </div>
            <a className="home-cv" href="/Ali Muhammed Ahmed.pdf" download>Download CV <FiDownload aria-hidden="true" /></a>
            <div className="home-socials">
              <span className="home-mono">Find me on</span>
              {socials.map(([label, href, Icon]) => (
                <a key={label} href={href} aria-label={`Ali Muhammed on ${label}`}><Icon aria-hidden="true" />{label}</a>
              ))}
            </div>
          </div>
          <div className="home-visual">
            <div className="home-portrait-stage">
              <span className="home-orb home-orb-mint" aria-hidden="true" />
              <span className="home-orb home-orb-purple" aria-hidden="true" />
              <img className="home-portrait" src={me} alt="Ali Muhammed, software engineer" fetchPriority="high" width="500" height="500" />
              <div className="home-float home-float-top"><span className="home-code-tile" aria-hidden="true">{'{ }'}</span><div><span className="home-mono">Code & design</span><strong>React interfaces</strong></div></div>
              <div className="home-float home-float-bottom" aria-hidden="true"><span className="home-mono">In my element</span><code><span>const</span> focus = [<br />&nbsp; 'React', 'UI',<br />&nbsp; 'craft'<br />];</code></div>
            </div>
          </div>
        </div>
      </section>
      <div className="home-focus-strip"><div className="page-container"><span>React interfaces</span><i aria-hidden="true">✳</i><span>JavaScript</span><i aria-hidden="true">✳</i><span>Frontend development</span><i aria-hidden="true">✳</i><span>User interfaces</span></div></div>
      <SelectedWork />
      <section className="home-about home-section" aria-labelledby="home-about-heading">
        <div className="page-container home-about-grid">
          <div>
            <p className="home-label">03 / Beyond the pixels</p>
            <h2 id="home-about-heading">A builder at heart.<br /><em>Curious by default.</em></h2>
            <p className="home-bio">I'm a software engineer passionate about web development. I specialize in React.js and build dynamic user interfaces. I love learning new technologies.</p>
            <Link className="home-text-link" to="/resume">Explore my resume <span aria-hidden="true">↗</span></Link>
          </div>
          <dl className="home-practice-list">
            <div><dt>Frontend</dt><dd><strong>Interfaces built with React</strong><span>React · JavaScript · HTML5 · CSS3</span></dd></div>
            <div><dt>UI toolkit</dt><dd><strong>Thoughtful interface development</strong><span>Material UI · Figma</span></dd></div>
            <div><dt>Workflow</dt><dd><strong>Tools behind the experience</strong><span>Git · Redux</span></dd></div>
          </dl>
        </div>
      </section>
      <section className="home-contact home-section" aria-labelledby="home-contact-heading">
        <div className="page-container">
          <div className="home-contact-card">
            <span className="home-contact-art" aria-hidden="true">✳</span>
            <div><p className="home-label">04 / Let's connect</p><h2 id="home-contact-heading">Have something<br /><em>interesting</em> in mind?</h2><p>Let's talk about thoughtful interfaces, web development, or your next project.</p></div>
            <Link className="home-button home-button-primary" to="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </main>
    <footer className="home-footer"><div className="page-container"><p>© {new Date().getFullYear()} Ali Muhammed · Software Engineer</p><div><a href="#home-main">Back to top <span aria-hidden="true">↑</span></a><a href="https://github.com/AliiMuhammed">GitHub <span aria-hidden="true">↗</span></a><a href="https://www.linkedin.com/in/ali-muhammed-dev/">LinkedIn <span aria-hidden="true">↗</span></a></div></div></footer>
  </div>
);

export default Home;
