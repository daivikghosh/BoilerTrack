import React, { useState } from "react";
import "./ItemView.css";

const ItemView = () => {
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");

  const item = {
    image:
      "https://fnac.sa/cdn/shop/files/51IF7maXR1L._AC_SL1000.jpg?v=1705660809", // Temporary image URL
    name: "Samsung Galaxy A14",
    brand: "Samsung",
    color: "Light Green",
    description: "Brand new Samsung Galaxy A14 found in Purdue Campus.",
    category: "Electronics",
    dateFound: "September 28, 2024",
    location: "Purdue Campus Library",
  }; //test item

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Submitted proof and comments:", { file, comments });
  };

  return (
    <div className="item-view-container">
      <div className="item-view-card">
        <img src={item.image} alt={item.name} className="item-view-image" />
        <h2>{item.name}</h2>
        <div className="item-details">
          <p>
            <strong>Brand:</strong> {item.brand}
          </p>
          <p>
            <strong>Color:</strong> {item.color}
          </p>
          <p>
            <strong>Found at:</strong> {item.location}
          </p>
          <p>
            <strong>Date Found:</strong> {item.dateFound}
          </p>
          <p className="item-description">{item.description}</p>
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
