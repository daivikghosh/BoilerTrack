import React from "react";
import "./Layout.css"; // Link to your CSS file

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        <nav>
          <ul>
            <li>Pre-Register</li>
            <li>Feed</li>
            <li>Upload</li>
            <li>Analytics</li>
          </ul>
        </nav>
      </header>

      {/* Sub Navbar (Search bar, Toggle) */}
      <div className="sub-navbar">
        <div className="search-bar">
          <input type="text" placeholder="Search items..." />
          <button>Search</button>
        </div>
        <div className="toggle-container">
          <label>
            Include past items
            <input type="checkbox" />
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-container">
        {children}{" "}
        {/* This is where the main content (forms, feeds, etc.) will be rendered */}
      </div>
    </div>
  );
};

export default Layout;
