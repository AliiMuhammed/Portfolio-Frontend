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
import Tooltip from "@mui/material/Tooltip";

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
          <Tooltip title="HTML5" placement="bottom">
            <FaHtml5 />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="CSS3" placement="bottom">
            <FaCss3 />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="JavaScript" placement="bottom">
            <IoLogoJavascript />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="React" placement="bottom">
            <FaReact />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="Figma" placement="bottom">
            <FaFigma />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="Material-UI" placement="bottom">
            <SiMui />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="Git" placement="bottom">
            <FaGitAlt />
          </Tooltip>
        </div>
        <div className="card">
          <Tooltip title="Redux" placement="bottom">
            <SiRedux />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default Skills;
