import React, { useState, useEffect } from "react";
import "../style/experience-education.css";
import { client } from "../../../Client";
import {parseDate} from "../../../Shared/parseDate";

const dateValue = value => parseDate(value)?.getTime() ?? NaN;
const formatDate = (value, fallback) => {
  const timestamp = dateValue(value);
  return Number.isFinite(timestamp)
    ? new Date(timestamp).toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })
    : fallback;
};

const Experience = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ex, setEx] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    const query = '*[_type=="experience"]';
    client.fetch(query, {}, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const records = Array.isArray(response) ? response.filter(record => record && typeof record === "object" && !Array.isArray(record)) : [];
        records.sort((a, b) => (Number.isFinite(dateValue(b.startDate)) ? dateValue(b.startDate) : -Infinity) - (Number.isFinite(dateValue(a.startDate)) ? dateValue(a.startDate) : -Infinity));
        setEx(records);
        setIsLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(true);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="resume-experience">
      <header className="resume-section-head">
        <div><p className="resume-eyebrow">01 / PROFESSIONAL EXPERIENCE</p><h2 id="experience-title">The <em>journey.</em></h2></div>
        <p>A chronological view of my frontend development and professional experience.</p>
      </header>
      {isLoading && <p role="status">Loading experience…</p>}
      {error && <p role="status">Unable to load experience. Please try again later.</p>}
      {!isLoading && !error && ex.length === 0 && <p role="status">No experience found. Please check back later.</p>}
      {!isLoading && !error && ex.length > 0 && <>
        <p className="resume-timeline-note">NEWEST FIRST</p>
        <ol className="resume-timeline">
          {ex.map((record, index) => (
            <li className="resume-role" key={typeof record._id === "string" ? record._id : index}>
              <p className="resume-role-date">{formatDate(record.startDate, "Date not listed")} — {formatDate(record.endDate, record.endDate == null || record.endDate === "" ? "Present" : "Date not listed")}</p>
              <div><h3>{typeof record.title === "string" && record.title.trim() ? record.title : "Role not listed"}</h3><p className="resume-role-company">{typeof record.company === "string" && record.company.trim() ? record.company : "Company not listed"}</p></div>
              <span className="resume-role-mark" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </li>
          ))}
        </ol>
      </>}
    </div>
  );
};
export default Experience;
