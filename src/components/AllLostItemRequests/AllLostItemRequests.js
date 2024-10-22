import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AllLostItemRequests.css';  // Import the CSS file for styling
import { Link } from 'react-router-dom'; 

const AllLostItemRequests = () => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lost items entered by the user
  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get('/lost-item-requests');  // Call the Flask API
        setLostItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lost items:', error);
        setError('Error fetching lost item requests.');
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
      <h2>Your Lost Item Requests</h2>
      {lostItems.length > 0 ? (
        <ul className="lost-items-list">
          {lostItems.map((item) => (
            <li key={item.ItemID} className="lost-item-card">
              <div className="lost-item-details">
                <h3>{item.ItemName}</h3>
                <p><strong>Description:</strong> {item.Description}</p>
                <p><strong>Date Lost:</strong> {item.DateLost}</p>
                <p><strong>Location:</strong> {item.LocationLost}</p>
                <Link to={`/edit-lost-item/${item.ItemID}`}>
                  <button className="edit-button">Edit</button>
                </Link>
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

export default AllLostItemRequests;
