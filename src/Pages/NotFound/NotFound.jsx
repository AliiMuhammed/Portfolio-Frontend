import React from "react";
import "./style/NotFound.css";
import me from "../../Assets/me.webp";
import { Link } from "react-router";
const NotFound = () => {
  return (
    <section className="notfound-section">
      <div className="container">
        <div className="image-numbers">
          <span className="number">4</span>
          <div className="zero">
            <img src={me} alt="zero-img" loading="lazy" />
          </div>
          <span className="number">4</span>
        </div>
        <h1>Page Not Found</h1>
        <Link className="main-btn" to={"/"}>
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
