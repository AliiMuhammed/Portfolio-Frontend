import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./style/spinner.css";
const Spinner = ({ size, color }) => {
  return (
    <div className="spinner-container">
      <div className="spinner">
        <CircularProgress size={`${size}rem`} className={`${color}`} />
      </div>
    </div>
  );
};

export default Spinner;
