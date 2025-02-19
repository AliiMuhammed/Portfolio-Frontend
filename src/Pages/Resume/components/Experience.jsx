import React from "react";
import "../style/experience-education.css";
const Experience = () => {
  return (
    <div className="experience-container">
      <div className="header">
        <h1>My experience</h1>
        <p>
          I’m a Front-end Developer specializing in React.js, with experience
          integrating AI models into real-time applications.
        </p>
      </div>
      <div className="cards">
        {[
          {
            title: "Coding Instructor",
            company: "iSchool",
            date: "Jun 2024 - Oct 2024",
          },
          {
            title: "Online Coordinator",
            company: "Almentor",
            date: "Dec 2023 - Jul 2024",
          },
          {
            title: "Front-end Developer",
            company: "freelancer",
            date: "Aug 2023 - Oct 2023 ",
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

export default Experience;
