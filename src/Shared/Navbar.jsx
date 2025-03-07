import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CgMenuRightAlt } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";

import "./style/navbar.css";
const Navbar = () => {
  const [isActive, setIsActive] = useState(false); // State to track the active class

  // Function to toggle the active state
  const toggleMenu = () => {
    setIsActive(!isActive);
  };
  const closeMenu = () => {
    setIsActive(false);
  };
  return (
    <>
      <div
        className={`overlay ${isActive ? "active" : ""}`}
        onClick={closeMenu}
      ></div>

      <header>
        <nav>
          <div className="container">
            <div className="logo">
              <Link to="/">
                Ali<span>.</span>
              </Link>
            </div>
            <ul className={isActive ? "active" : ""}>
              <button className="close-btn" onClick={toggleMenu}>
                <IoCloseOutline />
              </button>
              <div className="links">
                <div className="logo">
                  Ali<span>.</span>
                </div>
                <li className="link">
                  <NavLink to="/">Home</NavLink>
                </li>
                {/* <li className="link">
                  <NavLink to="/services">Services</NavLink>
                </li> */}
                <li className="link">
                  <NavLink to="/resume">Resume</NavLink>
                </li>
                <li className="link">
                  <NavLink to="/work">Work</NavLink>
                </li>
                <li className="link">
                  <NavLink to="/contact">Contact</NavLink>
                </li>
                <li className="link">
                  <NavLink to="/contact" className="main-btn">
                    Hire me
                  </NavLink>
                </li>
              </div>
            </ul>
            <button className="menu-btn" onClick={toggleMenu}>
              <CgMenuRightAlt />
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
