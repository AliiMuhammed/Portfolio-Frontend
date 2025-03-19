import React, { useEffect, useState } from "react";
import "./style/work.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IoIosLink } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { IoPlay } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
// import projects from "./components/projects";
import Spinner from "../../Shared/Spinner";
import ProjectVideo from "./components/ProjectVideo";
import Tooltip from "@mui/material/Tooltip";
import { urlFor, client } from "../../Client";
const Work = () => {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState({});
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false); // State to control dialog visibility
  const [isVideoLoading, setIsVideoLoading] = useState(false); // State to track image loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query = '*[_type=="work"]';
    client
      .fetch(query)
      .then((response) => {
        setProjects(response);
        setActiveProject({ ...response[0], id: 1 });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        setIsLoading(false);
      });
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

    // Create a new Image object to check if it's already cached
    const img = new Image();
    img.src = urlFor(newProject.imageurl);

    if (img.complete) {
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
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
      }}
      transition={{ delay: 0.4, duration: 0.4, ease: "easeInOut" }}
    >
      <section className="work-section">
        <div className="container">
          {isLoading && <Spinner size={"4"} color={"light"} />}
          {!isLoading && projects.length !== 0 && activeProject && (
            <>
              <div className="left">
                <h1 className="number">0{activeProject.id}</h1>
                <p className="project-title">{activeProject.title}</p>
                <p className="project-description">
                  {activeProject.description}
                </p>
                <div className="techStack">
                  {activeProject.techStack.join(", ")}
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
                  <Tooltip
                    title="Show certificate"
                    placement="bottom"
                  ></Tooltip>
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
                      {isImageLoading && (
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
                      <img
                        key={urlFor(project.imageurl)} // Forces React to treat it as a new element
                        src={urlFor(project.imageurl)}
                        alt={project.title}
                        onLoad={() => handleImageLoad()}
                        onError={() => handleImageLoad()}
                        style={{ display: isImageLoading ? "none" : "block" }}
                      />
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
