// File: src/pages/StudentAnalyticsPage.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentAnalyticsPage.css";

const StudentAnalyticsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      // Sort categories in descending order based on ItemCount
      const sortedCategories = response.data.sort(
        (a, b) => b.ItemCount - a.ItemCount
      );
      setCategories(sortedCategories);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch categories.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // Polling every 60 seconds to update the data
    const interval = setInterval(() => {
      fetchCategories();
    }, 60000); // 60000ms = 60 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="analytics-container">Loading...</div>;
  }

  if (error) {
    return <div className="analytics-container error">{error}</div>;
  }

  return (
    <div className="analytics-container">
      <h2>Lost Items Categories</h2>
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Number Lost</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.CategoryName}>
              <td>{category.CategoryName}</td>
              <td>{category.ItemCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAnalyticsPage;