import React from "react";
import "./style/home.css";
import me from "../../Assets/me.png";
import { Link } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import {
  FaLinkedinIn,
  FaFacebookF,
  FaGithub,
  FaInstagram,
} from "react-icons/fa";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <section className="home-section">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
        }}
        transition={{ delay: 0.4, duration: 0.4, ease: "easeInOut" }}
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
                <Link to="https://www.instagram.com/https_alimuhammed/">
                  <FaInstagram />
                </Link>
              </div>
            </div>
          </div>
          <div className="right ">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
              }}
              transition={{ delay: 0.7, duration: 0.4, ease: "easeInOut" }}
            >
              <img src={me} alt="ali's-photo"></img>
            </motion.div>
            {/* circle */}
            <motion.svg
              className="w-[700px] xl:w-[706px] h-[700px] xl:h-[706px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 home-circle"
              fill="transparent"
              viewBox="0 0 506 506"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.circle
                cx="253"
                cy="253"
                r="250"
                stroke="#00ff99"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ strokeDasharray: "24 10 0 0" }}
                animate={{
                  strokeDasharray: [
                    "15 120 25 25",
                    "16 25 92 72",
                    "4 250 22 22",
                  ],
                  rotate: [120, 360],
                }}
                transition={{
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
