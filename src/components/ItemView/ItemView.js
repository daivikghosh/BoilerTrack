import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ItemView.css";

// STAFF VIEW

const ItemView = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArchived, setIsArchived] = useState(false);

  // Fake item data for testing
  const fakeItem = {
    ItemID: 2,
    ItemName: "Headphones",
    Color: "Red",
    Brand: "Sony",
    LocationFound: "Gym",
    LocationTurnedIn: "Front Desk",
    Description: "Red Sony headphones found at the gym front desk.",
    ImageURL: "", // Add a base64 image string if you want to display an image
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/item/${id}`);
        setItem(response.data);
        setIsArchived(response.data.Archived == 1);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching item details, using fake data:", err);
        setItem(fakeItem); // Use fakeItem data if backend fails
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleArchiveToggle = async () => {
    try {
      if (isArchived) {
        await axios.post(`/item/unarchive/${id}`);
        setIsArchived(false);
      } else {
        await axios.post(`/item/archive/${id}`);
        setIsArchived(true);
      }
    } catch (err) {
      console.error("Error archiving/unarchiving item:", err);
    }
  };

  const handlePrint = () => {
    window.print(); // This will trigger the browser's print dialog
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="item-view-container">
      <div className="item-view-card">
        {/* Display the fetched image */}
        {item && item.ImageURL && (
          <img
            src={`data:image/jpeg;base64,${item.ImageURL}`}
            alt={item.ItemName}
            className="item-view-image"
          />
        )}
        <h2>{item?.ItemName}</h2>
        <div className="item-details">
          <p>
            <strong>Brand:</strong> {item?.Brand}
          </p>
          <p>
            <strong>Color:</strong> {item?.Color}
          </p>
          <p>
            <strong>Found at:</strong> {item?.LocationFound}
          </p>
          <p>
            <strong>Turned In At:</strong> {item?.LocationTurnedIn}
          </p>
          <p className="item-description">{item?.Description}</p>
        </div>
        <div className="button-container">
          <button className="archive-button" onClick={handleArchiveToggle}>
            {isArchived
              ? "Undo Move to Central Lost and Found Facility"
              : "Transfer to Central Lost and Found Facility"}
          </button>
          <button className="archive-button" onClick={handlePrint}>
            Print Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemView;