import React from "react";
import "../style/about.css";
import { Link } from "react-router-dom";
const AboutMe = () => {
  return (
    <div className="about-container">
      <div className="header">
        <h1>ِAbout me</h1>
        <p>
          Driven by curiosity and a passion for growth, I strive to bring
          dedication and creativity to everything I do
        </p>
      </div>

      <div className="info-container">
        <p className="info">
          <span>name</span>Ali Muhammed Ahmed
        </p>
        <p className="info">
          <span>phone</span>(+20) 01066567630
        </p>
        <p className="info">
          <span>experience</span>+1 years
        </p>
        <p className="info">
          <span>freelance</span>Available
        </p>
        <p className="info">
          <span>linkedIn</span>
          <Link
            to={"https://www.linkedin.com/in/ali-muhammed-dev"}
            target="_blank"
          >
            Ali Muhammed
          </Link>
        </p>
        <p className="info">
          <span>nationality</span>Egyptian
        </p>
        <p className="info">
          <span>email</span>
          <Link to={"mailto:ali.muhammed.dev@gmail.com"}>
            ali.muhammed.dev@gmail.com
          </Link>
        </p>
        <p className="info">
          <span>language</span>
          Arabic, English
        </p>
      </div>
    </div>
  );
};

export default AboutMe;
