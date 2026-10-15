import React from "react";
import "./style/NotFound.css";
import me from "../../Assets/me.webp";
import { Link } from "react-router";
const NotFound = () => {
  return (
    <main className="notfound-section" id="not-found-main" tabIndex={-1}>
      <div className="container">
        <div className="image-numbers" aria-hidden="true">
          <span className="number">4</span>
          <div className="zero">
            <img src={me} alt="" loading="lazy" />
          </div>
          <span className="number">4</span>
        </div>
        <h1>Page Not Found</h1>
        <Link className="main-btn" to={"/"}>
          Back to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
