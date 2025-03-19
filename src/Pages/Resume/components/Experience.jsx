import React, { useState, useEffect } from "react";
import "../style/experience-education.css";
import Spinner from "../../../Shared/Spinner";
import { client } from "../../../Client";
const Experience = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ex, setEx] = useState([]);
  useEffect(() => {
    const query = '*[_type=="experience"]';
    client
      .fetch(query)
      .then((response) => {
        const sortedExperiences = response.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
        setEx(sortedExperiences);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setIsLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };
  return (
    <div className="experience-container">
      <div className="header">
        <h1>My experience</h1>
        <p>
          I’m a Front-end Developer specializing in React.js, with experience
          integrating AI models into real-time applications.
        </p>
      </div>
      {isLoading && ex.length === 0 && <Spinner size={"3"} color={"light"} />}
      {!isLoading && ex.length > 0 && (
        <div className="cards">
          {!isLoading && ex.length === 0 && (
            <p>No experience found. Please check back later.</p>
          )}
          {ex.map((content, index) => (
            <div key={index} className="card">
              <p className="date">{`${formatDate(
                content.startDate
              )} - ${formatDate(content.endDate)}`}</p>
              <h2 className="title">{content.title}</h2>
              <h3 className="company">{content.company}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experience;
