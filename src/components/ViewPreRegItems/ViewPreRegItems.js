import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ViewPreRegItems.css";

const ViewPreRegItems = () => {
  const [preRegItems, setPreRegItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreRegItems = async () => {
      try {
        const preRegResponse = await axios.get("/pre-registered-items");
        const preRegItems = preRegResponse.data;

        setPreRegItems(preRegItems);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pre-registered items:", err);
        setError("Failed to load pre-registered items. Please try again later.");
        setLoading(false);
      }
    };

    fetchPreRegItems();
  }, []);

  const deleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.post(
        "/delete-pre-reg-item",
        { itemId },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Item deleted successfully!");
      // if error


      // Update the UI by filtering out the deleted item
      setPreRegItems(preRegItems.filter((item) => item.pre_reg_item_id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Please try again later.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {/* Header buttons */}
      <div className="header">
        <Link to="/add-registered-item" className="add-item-button">
          Add Registered Item
        </Link>
        <Link to="/qr-code-instructions" className="instructions-button">
          How to Print QR Code
        </Link>
      </div>

      {/* Pre-registered items list */}
      <div className="pre-reg-items-container">
        {preRegItems.length > 0 ? (
          preRegItems.map((item) => (
            <div key={item.pre_reg_item_id} className="pre-reg-card">
              <div className="item-details">
                <img
                  src={`data:image/jpeg;base64,${item.Photo}`}
                  alt={item.ItemName}
                  className="item-image"
                />
                <h3>{item.ItemName}</h3>
                <p>
                  <strong>Color:</strong> {item.Color}
                </p>
                <p>
                  <strong>Brand:</strong> {item.Brand}
                </p>
                <p>
                  <strong>Description:</strong> {item.Description}
                </p>
                <p>
                  <strong>Status:</strong> Pre-registered
                </p>
              </div>
              <div className="qr-code-details">
                <h4>QR Code</h4>
                <img
                  src={`data:image/jpeg;base64,${item.QRCodeImage}`}
                  alt="QR Code"
                  className="qr-code-image"
                />
                <a
                  href={`data:image/jpeg;base64,${item.QRCodeImage}`}
                  download={`${item.ItemName}_QRCode.jpg`}
                  className="download-button"
                >
                  Download QR Code
                </a>
              
              <button
                className="delete-button"
                onClick={() => deleteItem(item.pre_reg_item_id)}
              >
                Delete Item
              </button>
            </div>
            </div>

          ))
        ) : (
          <p>No pre-registered items found.</p>
        )}
      </div>
    </div>
  );
};

export default ViewPreRegItems;
