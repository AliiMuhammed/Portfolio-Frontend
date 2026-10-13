import React, { useEffect, useId, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { IoMdClose } from "react-icons/io";
import ReactPlayer from "react-player";
import Spinner from "../../../Shared/Spinner";

const ProjectVideo = ({ project, title, handleClose }) => {
  const id = useId();
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (status !== "loading") return;
    // Some providers never report an error when their embed is blocked.
    const timeout = setTimeout(() => setStatus("error"), 30000);
    return () => clearTimeout(timeout);
  }, [status]);
  return <Dialog className="work-dialog work-video-dialog" open onClose={handleClose} maxWidth="md" fullWidth aria-labelledby={id}>
    <header className="work-dialog-header"><div><p className="work-eyebrow">PROJECT / VIDEO PREVIEW</p><h2 id={id}>{title}</h2></div><button className="work-dialog-close" type="button" aria-label="close" autoFocus onClick={handleClose}><IoMdClose aria-hidden="true" /></button></header>
    <DialogContent className="work-dialog-content">
      {status === "loading" && <div className="work-video-state" role="status"><Spinner size={3} color="light" /><p>Loading project video…</p></div>}
      {status === "error" ? <p className="work-video-state" role="alert">Unable to load this video. Please close the preview and try again later.</p> : <div className="work-video-frame" role="group" aria-label={`${title} video player`}><ReactPlayer url={project} onReady={() => setStatus("ready")} onError={() => setStatus("error")} controls width="100%" height="100%" /></div>}
    </DialogContent>
  </Dialog>;
};
export default ProjectVideo;
