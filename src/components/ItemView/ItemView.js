import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Use params to get the item ID
import "./ItemView.css";

// Simulating a fake GET request data (you can replace this with real data fetching)
const fakeItemsFromDB = [
  {
    id: 1,
    description: "Lost Wallet",
    size: "Small",
    color: "Black",
    shape: "Rectangle",
    additional_notes: "Found near library",
    status: "available",
    image: "https://via.placeholder.com/150?text=Lost+Wallet", // Temporary image URL
  },
  {
    id: 2,
    description: "Lost Keychain",
    size: "Small",
    color: "Blue",
    shape: "Round",
    additional_notes: "Found near gym",
    status: "claimed",
    image: "https://via.placeholder.com/150?text=Lost+Keychain", // Temporary image URL
  },
  // Additional items...
];

const ItemView = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");
  const [item, setItem] = useState(null); // State to hold the item details

  // Find the item based on the ID from the URL
  useEffect(() => {
    const foundItem = fakeItemsFromDB.find((item) => item.id === parseInt(id));
    setItem(foundItem); // Set the item details
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

  if (!item) {
    return <p>Loading...</p>; // Loading state or handle case where item is not found
  }

  return (
    <div className="item-view-container">
      <div className="item-view-card">
        <img
          src={item.image}
          alt={item.description}
          className="item-view-image"
        />
        <h2>{item.description}</h2>
        <div className="item-details">
          <p>
            <strong>Size:</strong> {item.size}
          </p>
          <p>
            <strong>Color:</strong> {item.color}
          </p>
          <p>
            <strong>Shape:</strong> {item.shape}
          </p>
          <p>
            <strong>Additional Notes:</strong> {item.additional_notes}
          </p>
        </div>
        <div className="upload-section">
          <label htmlFor="file-upload" className="file-upload-label">
            Upload proof
            <input type="file" id="file-upload" onChange={handleFileChange} />
          </label>
          <div className="file-upload-text">
            {file ? file.name : "File / upload"}
          </div>
        </div>
        <div className="comment-section">
          <label htmlFor="comments">Explain</label>
          <textarea
            id="comments"
            placeholder="Your comments"
            value={comments}
            onChange={handleCommentChange}
            maxLength={2000}
          />
          <p className="char-limit">Max. 2000 characters</p>
        </div>
        <button className="claim-button" onClick={handleSubmit}>
          Claim
        </button>
      </div>
    </div>
  );
};

export default ItemView;
