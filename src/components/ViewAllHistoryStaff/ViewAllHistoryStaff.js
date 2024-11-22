import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewAllHistoryStaff.css";

const ListViewItemHistory = () => {
  const [itemHistory, setItemHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItemHistory = async () => {
      try {
        // Fetch item history from the backend API
        const response = await axios.get("/allitemhistory-staff");
        setItemHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching item history:", err);
        setError("Failed to load item history. Please try again later.");
        setLoading(false);
      }
    };

    fetchItemHistory();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="list-requests-container">
      {itemHistory.length > 0 ? (
        itemHistory.map((item) => (
          <div key={item.ItemID} className="list-item-card">
            <div className="list-item-details">
              <h3>{item.ItemName}</h3>
              <p>
                <strong>Item ID:</strong> {item.ItemID}
              </p>
            </div>
            <div className="list-item-actions">
              <button
                className="action-button"
                onClick={() => {
                  navigate(`/individual-itemhistory-staff/${item.ItemID}`);
                }}
              >
                View History
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No item history found.</p>
      )}
    </div>
  );
};

export default ListViewItemHistory;