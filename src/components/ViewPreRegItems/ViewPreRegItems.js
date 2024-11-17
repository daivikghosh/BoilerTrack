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
        setError(
          "Failed to load pre-registered items. Please try again later.",
        );
        setLoading(false);
      }
    };

    fetchPreRegItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {/* Button to go to instructions page */}
      <div className="header">
        <Link to="/qr-code-instructions" className="instructions-button">
          How to Print QR Code
        </Link>
      </div>

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
