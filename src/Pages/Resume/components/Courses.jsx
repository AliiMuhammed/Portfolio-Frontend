import React, { useState, useEffect, useId } from "react";
import "../style/courses.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { IoMdClose } from "react-icons/io";
import { FiExternalLink, FiAward } from "react-icons/fi";
import Spinner from "../../../Shared/Spinner";
import { imageUrl, client } from "../../../Client";
import {parseDate as issueDate} from "../../../Shared/parseDate";

const text = (value, fallback) => typeof value === "string" && value.trim() ? value : fallback;
const formatDate = value => {
  const date = issueDate(value);
  return date ? `Issued ${date.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })}` : "Issue date not listed";
};

const Courses = () => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [imageState, setImageState] = useState("loading");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const dialogTitleId = useId();

  useEffect(() => {
    const controller = new AbortController();
    client.fetch('*[_type=="courses"]', {}, { signal: controller.signal })
      .then(response => {
        if (controller.signal.aborted) return;
        const records = Array.isArray(response) ? response.filter(record => record && typeof record === "object" && !Array.isArray(record)) : [];
        records.sort((a, b) => {
          const aDate = issueDate(a.issuedDate), bDate = issueDate(b.issuedDate);
          return aDate && bDate ? bDate - aDate : aDate ? -1 : bDate ? 1 : 0;
        });
        setCourses(records);
        setIsLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(true);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleClose = () => setSelectedCertificate(null);
  const handleViewCertificate = (title, issuer, url) => {
    setImageState("loading");
    setSelectedCertificate({ title, issuer, url });
  };

  return (
    <div className="courses-container">
      <div className="resume-section-head">
        <div><p className="resume-eyebrow">04 / CONTINUOUS LEARNING</p><h2 id="certifications-title">Always <em>learning.</em></h2></div>
        <p>Courses and certifications from my ongoing learning in software development and beyond.</p>
      </div>
      {isLoading && <div role="status"><Spinner size={3} color="light" /><span>Loading courses and certifications…</span></div>}
      {error && <p role="status">Unable to load courses or certifications. Please try again later.</p>}
      {!isLoading && !error && courses.length === 0 && <p role="status">No courses or certifications found.</p>}
      {!isLoading && !error && courses.length > 0 && (
        <div className="cards resume-certificate-grid">
          {courses.map((content, index) => {
            const title = text(content.title, "Course title not listed");
            const issuer = text(content.issuedBy, "Issuer not listed");
            const url = imageUrl(content.certificateImgUrl);
            return (
              <article key={content._id || index} className="card resume-certificate-card">
                <div className="resume-certificate-top"><p className="date">{formatDate(content.issuedDate)}</p><span className="resume-certificate-mark" aria-hidden="true"><FiAward /></span></div>
                <h3 className="title">{title}</h3>
                <p className="company">{issuer}</p>
                <div className="resume-certificate-bottom">
                  {url ? <button type="button" className="view-btn" aria-label={`Show certificate: ${title}`} onClick={() => handleViewCertificate(title, issuer, url)}>View certificate <FiExternalLink aria-hidden="true" /></button> : <span className="resume-certificate-unavailable">Preview unavailable</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Dialog className="certificate-dialog" open={Boolean(selectedCertificate)} onClose={handleClose} maxWidth="md" fullWidth aria-labelledby={dialogTitleId}>
        <div className="certificate-dialog-header">
          <div><p className="certificate-dialog-label">CERTIFICATE VIEWER</p><h2 id={dialogTitleId}>{selectedCertificate?.title || "Certificate preview"}</h2><p className="certificate-dialog-issuer">{selectedCertificate?.issuer}</p></div>
          <IconButton className="certificate-dialog-close" aria-label="close" onClick={handleClose} autoFocus><IoMdClose aria-hidden="true" /></IconButton>
        </div>
        <DialogContent className="certificate-dialog-content">
          {selectedCertificate && imageState === "loading" && <div className="certificate-preview-state" role="status"><Spinner size={3} color="light" /><p>Loading certificate image…</p></div>}
          {selectedCertificate && imageState === "error" && <div className="certificate-preview-state" role="status"><FiAward aria-hidden="true" /><p>Unable to load this certificate image. Please close the preview and try again later.</p></div>}
          {selectedCertificate && imageState !== "error" && <img key={selectedCertificate.url} className="certificate-preview-image" src={selectedCertificate.url} alt={`${selectedCertificate.title} certificate`} hidden={imageState !== "loaded"} onLoad={() => setImageState("loaded")} onError={() => setImageState("error")} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
