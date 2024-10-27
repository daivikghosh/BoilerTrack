import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ItemView.css";

const ItemViewStudent = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [item, setItem] = useState(null);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate for routing

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
    ItemStatus: 3, // Example status for testing
  };

  const handleClaimClick = () => {
    navigate(`/claim/${id}`); // Navigate to the claim form when the Claim button is clicked
  };

  const handleDisputeClick = () => {
    navigate(`/dispute/${id}`); // Navigate to the dispute form when the Dispute button is clicked
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/item/${id}`);
        setItem(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching item details, using fake data:", err);
        setItem(fakeItem); // Use fakeItem data if backend fails
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Submitted proof and comments:", { file, comments });
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
        
        {item?.ItemStatus === 3 ? (
          <button className="dispute-button" onClick={handleDisputeClick}>
            Dispute Claim
          </button>
        ) : (
          <button className="claim-button" onClick={handleClaimClick}>
            Claim Request Form
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemViewStudent;
