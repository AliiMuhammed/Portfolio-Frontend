import React from "react";
import "../style/experience-education.css";
const Education = () => {
  return (
    <div className="education-container">
      <div className="header">
        <h1>My education</h1>
        <p>
          My education has been a cornerstone of my personal and professional
          growth, shaping my skills and knowledge.
        </p>
      </div>
      <div className="cards">
        {[
          {
            title: "Bachelor of Computer Science - CS Department",
            company: "Helwan University",
            date: "Sep 2020 - Jun 2024",
          },
        ].map((content, index) => (
          <div key={index} className="card">
            <p className="date">{content.date}</p>
            <h2 className="title">{content.title}</h2>
            <h3 className="company">{content.company}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Education;
