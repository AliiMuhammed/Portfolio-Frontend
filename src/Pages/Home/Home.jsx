import React from "react";
import "./style/home.css";
import me from "../../Assets/me.webp";
import { Link } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import {
  FaLinkedinIn,
  FaFacebookF,
  FaGithub,
  FaWhatsapp,
} from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";

const Home = () => {
  const reduceMotion = useReducedMotion();
  return (
    <section className="home-section">
      <motion.div
        initial={false}
        animate={{
          opacity: 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container">
          <div className="left">
            <div className="header-content">
              <span>Software Engineer</span>
              <p>Hello I'm</p>
              <p className="name">Ali Muhammed</p>
            </div>
            <p className="desc">
              I am a software engineer passionate about web development. I
              specialize in React.js and build dynamic user interfaces. I love
              learning new technologies.
            </p>
            <div className="btns">
              <a
                href={"/Ali Muhammed Ahmed.pdf"}
                download
                className="second-btn"
              >
                Download CV <FiDownload />
              </a>
              <div className="social-media">
                <Link to="https://www.linkedin.com/in/ali-muhammed-dev/">
                  <FaLinkedinIn />
                </Link>
                <Link to="https://github.com/AliiMuhammed">
                  <FaGithub />
                </Link>
                <Link to="https://www.facebook.com/profile.php?id=100004223081202">
                  <FaFacebookF />
                </Link>
                <Link to="https://wa.me/201066567630">
                  <FaWhatsapp />
                </Link>
              </div>
            </div>
          </div>
          <div className="right ">
            <motion.div
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: reduceMotion ? 0 : 0.7,
                duration: reduceMotion ? 0 : 0.4,
                ease: "easeInOut",
              }}
            >
              <img src={me} alt="ali's-photo" loading="lazy" />
            </motion.div>
            {/* circle */}
            <motion.svg
              className="home-circle"
              fill="transparent"
              viewBox="0 0 506 506"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.circle
                cx="253"
                cy="253"
                r="250"
                stroke="var(--color-accent)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ strokeDasharray: "24 10 0 0" }}
                animate={reduceMotion ? { strokeDasharray: "24 10 0 0", rotate: 0 } : {
                  strokeDasharray: ["15 120 25 25", "16 25 92 72", "4 250 22 22"],
                  rotate: [120, 360],
                }}
                transition={reduceMotion ? { duration: 0 } : {
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </motion.svg>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Home;
