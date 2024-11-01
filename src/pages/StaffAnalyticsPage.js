// File: src/pages/StaffAnalyticsPage.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StaffAnalyticsPage.css";

const StaffAnalyticsPage = () => {
  const [claimedCount, setClaimedCount] = useState(0);
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [missingLocations, setMissingLocations] = useState([]);
  const [commonCategories, setCommonCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("/api/staff-analytics");
      const data = response.data;
      setClaimedCount(data.claimedCount);
      setUnclaimedCount(data.unclaimedCount);
      setMissingLocations(data.missingLocations);
      setCommonCategories(data.commonCategories);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch analytics data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="staff-analytics-container">Loading...</div>;
  }

  if (error) {
    return <div className="staff-analytics-container error">{error}</div>;
  }

  return (
    <div className="staff-analytics-container">
      <h2>Staff Analytics Dashboard</h2>
      <div className="counters">
        <div className="counter-card">
          <h3>Items Claimed</h3>
          <p>{claimedCount}</p>
        </div>
        <div className="counter-card">
          <h3>Items Unclaimed</h3>
          <p>{unclaimedCount}</p>
        </div>
      </div>
      <div className="analytics-section">
        <h3>Top Missing Locations</h3>
        <ul>
          {missingLocations.map((location, index) => (
            <li key={index}>
              {location.Location}: {location.Count}
            </li>
          ))}
        </ul>
      </div>
      <div className="analytics-section">
        <h3>Most Common Categories</h3>
        <ul>
          {commonCategories.map((category, index) => (
            <li key={index}>
              {category.CategoryName}: {category.ItemCount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StaffAnalyticsPage;