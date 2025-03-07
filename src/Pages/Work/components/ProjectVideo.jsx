import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { IoMdClose } from "react-icons/io";
import ReactPlayer from "react-player";
import Spinner from "./../../../Shared/Spinner";

const ProjectVideo = ({
  open,
  project,
  handleClose,
  isVideoLoading,
  setIsVideoLoading,
}) => {
  // Function to stop loading when the video is ready
  const handleVideoLoad = () => {
    setIsVideoLoading(false);
  };

  return (
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

        {/* Show spinner while loading */}
        {isVideoLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <Spinner size={3} color={"dark"} />
          </div>
        )}

        {/* Always show video, but hide it until loaded */}
        {project && (
          <ReactPlayer
            className="project-player"
            url={project}
            onReady={handleVideoLoad}
            style={{ display: isVideoLoading ? "none" : "block" }}
            controls={true}
            width="100%"
            height="50vh"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectVideo;
