import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { CgMenuRightAlt } from "react-icons/cg";
import { IoCloseOutline } from "react-icons/io5";
import "./style/navbar.css";

const destinations = [["/", "Home"], ["/resume", "Resume"], ["/work", "Work"], ["/contact", "Contact"]];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const toggle = useRef(null);
  const mobileMenu = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (mobileMenu.current?.contains(document.activeElement)) toggle.current.focus();
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 801px)");
    const onResize = () => {
      if (desktop.matches) {
        if (header.current.contains(document.activeElement)) {
          const path = document.activeElement.getAttribute("href") || location.pathname;
          header.current.querySelector(`.navbar-desktop a[href="${path}"]`)?.focus();
        }
        setOpen(false);
      } else if (header.current.querySelector(".navbar-desktop")?.contains(document.activeElement)) {
        toggle.current.focus();
      }
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event) => {
      if (!header.current.contains(event.target)) {
        if (mobileMenu.current.contains(document.activeElement)) toggle.current.focus();
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggle.current.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = () => (
    <>
      <ul className="navbar-links">
        {destinations.map(([to, label]) => (
          <li key={to}><NavLink to={to} end>{label}</NavLink></li>
        ))}
      </ul>
      <Link className="navbar-cta" to="/contact">Let's talk <span aria-hidden="true">↗</span></Link>
    </>
  );

  return (
    <header className="portfolio-navbar" ref={header} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="page-container navbar-bar">
        <Link className="navbar-brand" to="/" aria-label="Ali Muhammed — Home">
          <span className="navbar-mark" aria-hidden="true"><span>A</span></span>
          <span>Ali<span className="navbar-dot">.</span></span>
        </Link>
        <nav className="navbar-desktop" aria-label="Main navigation">{links()}</nav>
        <button ref={toggle} className="navbar-toggle" type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open} aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}>
          {open ? <IoCloseOutline aria-hidden="true" /> : <CgMenuRightAlt aria-hidden="true" />}
        </button>
      </div>
      <nav ref={mobileMenu} id="mobile-navigation" className="navbar-mobile page-container"
        aria-label="Mobile navigation" hidden={!open} onClick={(event) => {
          if (event.target.closest("a")) {
            setOpen(false);
            toggle.current.focus();
          }
        }}>{links()}</nav>
    </header>
  );
};

export default Navbar;
