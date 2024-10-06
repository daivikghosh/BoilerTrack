import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ItemView.css";

// Simulating a fake GET request data
const fakeItemsFromDB = [
  {
    ItemID: 1,
    ItemName: "Samsung Phone",
    Color: "Black",
    Brand: "Samsung A24",
    LocationFound: "WALC Printing Station",
    Description: "Android phone, pink wallpaper, three cameras",
    Photo: "https://via.placeholder.com/150?text=Samsung+Phone",
  },
  {
    ItemID: 2,
    ItemName: "Apple Watch",
    Color: "White",
    Brand: "Apple",
    LocationFound: "PMU food court",
    Description: "Watch, white band",
    Photo: "https://via.placeholder.com/150?text=Apple+Watch",
  },
  {
    ItemID: 3,
    ItemName: "Lenovo ThinkPad",
    Color: "Black",
    Brand: "Lenovo",
    LocationFound: "Earhart Dining Court",
    Description: "Laptop, blue sticker, Purdue sticker",
    Photo: "https://via.placeholder.com/150?text=Lenovo+ThinkPad",
  },
  {
    ItemID: 4,
    ItemName: "Wallet",
    Color: "White",
    Brand: "MK",
    LocationFound: "Earhart Dining Court",
    Description: "Leather, blue keychain",
    Photo: "https://via.placeholder.com/150?text=Wallet",
  },
  {
    ItemID: 5,
    ItemName: "Keychain",
    Color: "pink",
    Brand: "unknown",
    LocationFound: "Earhart Dining Court",
    Description: "airtag",
    Photo: "https://via.placeholder.com/150?text=Keychain",
  },
];

const ItemView = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");
  const [item, setItem] = useState(null); // State to hold the item details

  // Find the item based on the ID from the URL
  useEffect(() => {
    const foundItem = fakeItemsFromDB.find(
      (item) => item.ItemID === parseInt(id)
    );
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
        <img src={item.Photo} alt={item.ItemName} className="item-view-image" />
        <h2>{item.ItemName}</h2>
        <div className="item-details">
          <p>
            <strong>Brand:</strong> {item.Brand}
          </p>
          <p>
            <strong>Color:</strong> {item.Color}
          </p>
          <p>
            <strong>Location Found:</strong> {item.LocationFound}
          </p>
          <p>
            <strong>Description:</strong> {item.Description}
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
