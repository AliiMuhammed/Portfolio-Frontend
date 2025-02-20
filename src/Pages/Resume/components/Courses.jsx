import React, { useState } from "react";
import "../style/courses.css";
import certificates from "../components/Certificates";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { IoMdClose } from "react-icons/io";
import Spinner from "./../../../Shared/Spinner";
import { FiExternalLink } from "react-icons/fi";

const Courses = () => {
  // State to manage the selected certificate
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [isImageLoading, setIsImageLoading] = useState(false); // State to track image loading

  // Function to handle button click and set the selected certificate
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setOpen(true); // Open the dialog
    setIsImageLoading(true); // Start loading
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedCertificate(null); // Reset the selected certificate
    setIsImageLoading(false); // Reset loading state
  };

  // Function to handle image load
  const handleImageLoad = () => {
    setIsImageLoading(false); // Stop loading when the image is fully loaded
  };

  return (
    <div className="courses-container">
      <div className="header">
        <h1>My courses & certifications</h1>
        <p>
          My coursework has provided me with a diverse skill set and in-depth
          knowledge, equipping me to excel in my field.
        </p>
      </div>
      <div className="cards">
        {certificates.map((content, index) => (
          <div key={index} className="card">
            <p className="date">{content.date}</p>
            <h2 className="title">{content.title}</h2>
            <h3 className="company">{content.company}</h3>
            <button
              className="view-btn"
              onClick={() => handleViewCertificate(content.certificate)}
            >
              <FiExternalLink />
            </button>
          </div>
        ))}
      </div>

      {/* MUI Dialog to display the selected certificate */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#09f7a3",
            }}
          >
            <IoMdClose />
          </IconButton>
          {isImageLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px", // Adjust height as needed
              }}
            >
              <Spinner size={3} color={"dark"} />
            </div>
          )}
          {selectedCertificate && (
            <img
              src={selectedCertificate}
              alt="Certificate"
              style={{
                width: "100%",
                height: "auto",
                display: isImageLoading ? "none" : "block",
              }}
              onLoad={handleImageLoad} // Triggered when the image is fully loaded
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
