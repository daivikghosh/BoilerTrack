import React, { useState } from "react";
import "./LostItemForm.css";
import axios from "axios";

const LostItemForm = () => {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [locationLost, setLocationLost] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !description || !dateLost || !locationLost) {
      setError("All fields are required.");
      return;
    }

    setError("");
    console.log("Lost item details:", {
      itemName,
      description,
      dateLost,
      locationLost,
    });

    const itemData = {
      itemName,
      description,
      dateLost,
      locationLost,
    };

    try {
      const response = await axios.post("/lost-item-request", itemData, {
        headers: { "Content-Type": "application/json" },
      });
      // const response = await axios.post("/", {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      console.log(response.data);
      alert("Lost item submitted successfully!");
    } catch (error) {
      console.error("Error submitting lost item:", error);
      setError("Failed to submit lost item. Please try again.");
    }
  };

  return (
    <div className="lost-item-form-container">
      <h2>Report Lost Item</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="itemName">Item Name</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., Wallet, Keys, Laptop"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed description of the item"
            maxLength={2000}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateLost">Date Lost</label>
          <input
            type="date"
            id="dateLost"
            value={dateLost}
            onChange={(e) => setDateLost(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="locationLost">Location Lost</label>
          <input
            type="text"
            id="locationLost"
            value={locationLost}
            onChange={(e) => setLocationLost(e.target.value)}
            placeholder="e.g., Library, Gym, Parking Lot"
          />
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default LostItemForm;
