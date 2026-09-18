import React, { useState, useEffect } from "react";
import "../style/experience-education.css";
import Spinner from "../../../Shared/Spinner";
import { client } from "../../../Client";
const Experience = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ex, setEx] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    const query = '*[_type=="experience"]';
    client
      .fetch(query, {}, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const records = Array.isArray(response) ? response.filter(Boolean) : [];
        const sortedExperiences = records.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
        setEx(sortedExperiences);
        setIsLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(true);
        setIsLoading(false);
      });
    return () => controller.abort();
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
      {error && (
        <p role="status">Unable to load experience. Please try again later.</p>
      )}
      {!isLoading && !error && ex.length === 0 && (
        <p role="status">No experience found. Please check back later.</p>
      )}
      {!isLoading && ex.length > 0 && (
        <div className="cards">
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
