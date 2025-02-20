import React from "react";
import "../style/skills.css";
import { FaHtml5 } from "react-icons/fa";
import { FaCss3 } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { FaReact } from "react-icons/fa";
import { FaFigma } from "react-icons/fa";
import { SiMui } from "react-icons/si";
import { FaGitAlt } from "react-icons/fa";
import { SiRedux } from "react-icons/si";

const Skills = () => {
  return (
    <div className="skills-container">
      <div className="header">
        <h1>My skills</h1>
        <p>
          My skills reflect a blend of practical expertise and continuous
          learning, enabling me to tackle challenges effectively.
        </p>
      </div>
      <div className="cards">
        <div className="card">
          <FaHtml5 />
        </div>
        <div className="card">
          <FaCss3 />
        </div>
        <div className="card">
          <IoLogoJavascript />
        </div>
        <div className="card">
          <FaReact />
        </div>
        <div className="card">
          <FaFigma />
        </div>
        <div className="card">
          <SiMui />
        </div>
        <div className="card">
          <FaGitAlt />
        </div>
        <div className="card">
          <SiRedux />
        </div>
      </div>
    </div>
  );
};

export default Skills;
