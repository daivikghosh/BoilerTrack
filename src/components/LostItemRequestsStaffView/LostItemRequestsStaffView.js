import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LostItemRequestsStaffView.css";

const LostItemRequestsStaffView = () => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLostItems, setFilteredLostItems] = useState([]);

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get("/lost-item-requests");
        setLostItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lost items:", error);
        setError("Error fetching lost item requests.");
        setLoading(false);
      }
    };

    fetchLostItems();
  }, []);

  useEffect(() => {
    const filteredLostItems = lostItems.filter((item) => {
      if (searchQuery) {
        return item.userEmail.includes(searchQuery.toLowerCase());
      }
      return true;
    });
    setFilteredLostItems(filteredLostItems);
  }, [searchQuery, lostItems]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div>
      <input
        type="search"
        value={searchQuery}
        placeholder="Search by user email"
        onChange={handleSearchChange}
      />
      {filteredLostItems.length > 0 ? (
        <ul className="lost-items-list">
          {filteredLostItems.map((item) => (
            <li key={item.ItemID} className="lost-item-card">
              <div className="lost-item-details">
                <h3>{item.ItemName}</h3>
                <p>
                  <strong>Description:</strong> {item.Description}
                </p>
                <p>
                  <strong>Loser:</strong> {item.userEmail}
                </p>
                <p>
                  <strong>Date Lost:</strong> {item.DateLost}
                </p>
                <p>
                  <strong>Location:</strong> {item.LocationLost}
                </p>
                <p>
                  <strong>Status:</strong> {item.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lost item requests found.</p>
      )}
    </div>
  );
};

export default LostItemRequestsStaffView;
