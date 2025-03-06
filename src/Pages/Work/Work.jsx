import React, { useState } from "react";
import "./style/work.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IoIosLink } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { IoPlay } from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import projects from "./components/projects";
import Spinner from "../../Shared/Spinner";

const Work = () => {
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [isImageLoading, setIsImageLoading] = useState(true); // Start with loading state

  const handleSlideChange = (swiper) => {
    console.log("Slide changed, setting isLoading to true"); // Debugging
    setIsImageLoading(true); // Set loading state to true before slide change
    const activeIndex = swiper.activeIndex;
    setActiveProject(projects[activeIndex]);
  };

  const handleImageLoad = () => {
    console.log("Image loaded, setting isLoading to false"); // Debugging
    setIsImageLoading(false); // Set loading state to false when image loads
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
          <div className="left">
            <h1 className="number">0{activeProject.id}</h1>
            <p className="project-title">{activeProject.title}</p>
            <p className="project-description">{activeProject.description}</p>
            <div className="techStack">
              {activeProject.techStack.join(", ")}
            </div>
            <span className="line"></span>
            <div className="project-links">
              <Link to={activeProject.link} className="project-btn">
                <IoIosLink />
              </Link>
              <Link to={activeProject.github} className="project-btn">
                <FaGithub />
              </Link>
              <Link to={activeProject.video} className="project-btn">
                <IoPlay />
              </Link>
            </div>
          </div>
          <div className="right">
            <Swiper
              modules={[Navigation, A11y]}
              slidesPerView={1}
              spaceBetween={10}
              navigation
              onSwiper={(swiper) => console.log(swiper)}
              onSlideChange={handleSlideChange}
              className="mySwiper"
            >
              {projects.map((project) => (
                <SwiperSlide key={project.id}>
                  {isImageLoading && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "300px", // Adjust height as needed
                      }}
                    >
                      <Spinner size={3} color={"light"} />
                    </div>
                  )}
                  <img
                    src={`${project.image.src}?${Date.now()}`} // Force reload
                    alt={project.image.alt}
                    onLoad={handleImageLoad}
                    onError={() => {
                      console.error("Image failed to load"); // Debugging
                      setIsImageLoading(false); // Ensure loading state is reset even if the image fails
                    }}
                    style={{ display: isImageLoading ? "none" : "block" }} // Hide image while loading
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Work;