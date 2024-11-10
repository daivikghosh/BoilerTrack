import React from "react";
import { Link } from "react-router-dom";
import "./QRCodeInstructions.css";

const QRCodeInstructions = () => {
  return (
    <div className="instructions-container">
      <h2>How to Print QR Code</h2>
      <p>Here are the steps to print a QR code sticker at Purdue:</p>
      <p>/* Add detailed instructions here later */</p>
      <Link to="/" className="back-button">
        Go Back
      </Link>
    </div>
  );
};

export default QRCodeInstructions;
