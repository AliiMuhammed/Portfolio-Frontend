import React, { useEffect, useState } from "react";
import "./style/work.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IoIosLink } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { IoPlay } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import Spinner from "../../Shared/Spinner";
import ProjectVideo from "./components/ProjectVideo";
import Tooltip from "@mui/material/Tooltip";
import { imageUrl, client } from "../../Client";
const Work = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [isVideoLoading, setIsVideoLoading] = useState(false); // State to track image loading
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const query = '*[_type=="work"]';
    client
      .fetch(query, {}, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const records = Array.isArray(response) ? response.filter(Boolean) : [];
        setProjects(records);
        setActiveProject(records.length ? { ...records[0], id: 1 } : null);
        setIsLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(true);
        setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <Spinner size={"4"} color={"light"} />; // Show a spinner while loading
  }

  const handleViewProject = (Project) => {
    setSelectedProject(Project);
    setOpen(true); // Open the dialog
    setIsVideoLoading(true); // Start loading
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedProject(null);
    setIsVideoLoading(false); // Reset the selected Project
  };

  const handleSlideChange = (swiper) => {
    const activeIndex = swiper.activeIndex;
    const newProject = projects[activeIndex];
    if (!newProject) return;

    // Create a new Image object to check if it's already cached
    const img = new Image();
    const source = imageUrl(newProject.imageurl);
    if (source) img.src = source;

    if (!source || img.complete) {
      setIsImageLoading(false); // If already loaded, hide spinner immediately
    } else {
      setIsImageLoading(true); // Otherwise, show spinner
      img.onload = () => setIsImageLoading(false);
      img.onerror = () => setIsImageLoading(false);
    }

    setActiveProject({ ...newProject, id: activeIndex + 1 });
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: 1,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <section className="work-section">
        <div className="container">
          {error && (
            <p role="status">Unable to load projects. Please try again later.</p>
          )}
          {!error && projects.length === 0 && (
            <p role="status">No projects found. Please check back later.</p>
          )}
          {!isLoading && projects.length !== 0 && activeProject && (
            <>
              <div className="left">
                <h1 className="number">0{activeProject.id}</h1>
                <p className="project-title">{activeProject.title}</p>
                <p className="project-description">
                  {activeProject.description}
                </p>
                <div className="techStack">
                  {Array.isArray(activeProject.techStack)
                    ? activeProject.techStack.filter(Boolean).join(", ")
                    : ""}
                </div>
                <span className="line"></span>

                <div className="project-links">
                  {activeProject.link && ( // Render only if `link` is not empty
                    <Tooltip title="Live Demo" placement="bottom">
                      <Link to={activeProject.link} className="project-btn">
                        <IoIosLink />
                      </Link>
                    </Tooltip>
                  )}
                  {activeProject.github && ( // Render only if `github` is not empty
                    <Tooltip title="Open Repository" placement="bottom">
                      <Link to={activeProject.github} className="project-btn">
                        <FaGithub />
                      </Link>
                    </Tooltip>
                  )}
                  {activeProject.video && (
                    // Render only if `video` is not empty
                    <Tooltip title="Play Demo" placement="bottom">
                      <button
                        onClick={() => handleViewProject(activeProject.video)}
                        className="project-btn"
                      >
                        <IoPlay />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="right">
                <Swiper
                  modules={[Navigation, A11y]}
                  slidesPerView={1}
                  spaceBetween={15}
                  navigation
                  onSlideChange={handleSlideChange}
                  className="mySwiper"
                >
                  {projects.map((project, index) => (
                    <SwiperSlide key={index}>
                      {imageUrl(project.imageurl) && isImageLoading && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          <Spinner size={3} color={"light"} />
                        </div>
                      )}
                      {imageUrl(project.imageurl) ? (
                        <img
                          key={imageUrl(project.imageurl)}
                          src={imageUrl(project.imageurl)}
                          alt={project.title}
                          onLoad={handleImageLoad}
                          onError={handleImageLoad}
                          style={{ display: isImageLoading ? "none" : "block" }}
                        />
                      ) : (
                        <p>Project image unavailable.</p>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </>
          )}
        </div>
      </section>
      <ProjectVideo
        open={open}
        project={selectedProject}
        handleClose={handleClose}
        isVideoLoading={isVideoLoading}
        setIsVideoLoading={setIsVideoLoading}
      />
    </motion.div>
  );
};

export default Work;
