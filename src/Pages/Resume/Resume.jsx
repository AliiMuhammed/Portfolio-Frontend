import React, { useState } from "react";
import "./style/resume.css";
import { motion } from "framer-motion";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Skills from "./components/Skills";
import AboutMe from "./components/AboutMe";
import Courses from "./components/Courses";

const Resume = () => {
  const [activeSection, setActiveSection] = useState("experience");

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="resume-section">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
        }}
        transition={{ delay: 0.4, duration: 0.4, ease: "easeInOut" }}
      >
        <div className="container">
          <div className="left">
            <div className="description">
              <p className="hire-title">Why Hire Me?</p>
              <p className="hire-desc">
                I'm a passionate software engineer with a deep love for
                technology and design.
              </p>
            </div>
            <div className="resume-btns">
              {[
                { label: "Experience", section: "experience" },
                { label: "Education", section: "education" },
                { label: "Courses", section: "courses" },
                { label: "Skills", section: "skills" },
                { label: "About me", section: "about" },
              ].map(({ label, section }) => (
                <button
                  key={section}
                  className={`resume-btn ${
                    activeSection === section ? "active" : ""
                  }`}
                  onClick={() => setActiveSection(section)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="right">
            {[
              { section: "experience", content: <Experience /> },
              { section: "education", content: <Education /> },
              { section: "courses", content: <Courses /> },
              { section: "skills", content: <Skills /> },
              { section: "about", content: <AboutMe /> },
            ].map(({ section, content }) => (
              <motion.div
                key={section}
                initial="hidden"
                animate={activeSection === section ? "visible" : "hidden"}
                variants={sectionVariants}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`content ${
                  activeSection === section ? "show" : "hide"
                }`}
              >
                {content}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Resume;
