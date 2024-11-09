import React from "react";
import { Link } from "react-router-dom";
import "./LayoutBar.css"; // Import your CSS file for styling

function LayoutBar() {
  return (
    <nav className="layout-bar">
      <Link to="/all-items-staff" className="logo">
        BoilerTrack
      </Link>
    </nav>
  );
}

export default LayoutBar;
