import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AllLostItemRequests.css";
import { Link } from "react-router-dom";
import LostItemTemplate from "../LostItemTemplate/LostItemTemplate";

const AllLostItemRequests = () => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Track the selected item for the template

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/delete-lost-item/${itemId}`);
      setLostItems(lostItems.filter((item) => item.ItemID !== itemId));
      alert("Lost item request deleted successfully.");
    } catch (error) {
      console.error("Error deleting lost item request:", error);
      alert("Failed to delete the lost item request.");
    }
  };

  const toggleCompleteStatus = async (itemId, currentStatus) => {
    try {
      const newStatus = currentStatus === "complete" ? "pending" : "complete";
      await axios.put(`/toggle-status/${itemId}`, { status: newStatus });
      setLostItems((prevItems) =>
        prevItems.map((item) =>
          item.ItemID === itemId ? { ...item, status: newStatus } : item,
        ),
      );
      alert(`Status changed to "${newStatus}".`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to change status.");
    }
  };

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="lost-items-container">
      {/* Conditionally render header */}
      {!selectedItem && <h2>Your Lost Item Requests</h2>}

      {selectedItem ? (
        <div className="template-container">
          <LostItemTemplate
            item={selectedItem}
            setSelectedItem={setSelectedItem}
            goBack={() => setSelectedItem(null)} // Pass back functionality
          />
        </div>
      ) : (
        <ul className="lost-items-list">
          {lostItems.map((item) => (
            <li key={item.ItemID} className="lost-item-card">
              <div className="lost-item-details">
                <h3>{item.ItemName}</h3>
                <p>
                  <strong>Description:</strong> {item.Description}
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

                <Link to={`/edit-lost-item/${item.ItemID}`}>
                  <button className="edit-button">Edit</button>
                </Link>

                <button
                  className="complete-button"
                  onClick={() => toggleCompleteStatus(item.ItemID, item.status)}
                >
                  {item.status === "complete" ? "Undo Complete" : "Complete"}
                </button>

                {item.ItemMatchID > -1 && (
                  <Link to={`/item-view-student/${item.ItemMatchID}`}>
                    <button className="view-matched-item-button">
                      View Matched Item
                    </button>
                  </Link>
                )}

                <button
                  className="delete-button"
                  onClick={() => handleDelete(item.ItemID)}
                >
                  Delete
                </button>

                <button
                  className="generate-template-button"
                  onClick={() => setSelectedItem(item)}
                >
                  Generate Template
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllLostItemRequests;
