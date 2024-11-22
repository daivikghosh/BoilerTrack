import React from "react";
import { Link } from "react-router-dom";
import "./QRCodeInstructions.css";

const QRCodeInstructions = () => {
  return (
    <div className="instructions-container">
      <h2>How to Print QR Code</h2>
      <h4>Visit the Knowledge Lab to print your sticker!</h4>
      <h4>
        <strong>Location:</strong> 3rd Floor at WALC.
      </h4>
      <h4>
        Click this link for detailed instructions:{" "}
        <a
          href="https://guides.lib.purdue.edu/klab-stickerprinting#:~:text=Visit%20the%20Knowledge%20Lab%20to%20print%20your%20sticker!"
          target="_blank"
          rel="noopener noreferrer"
          className="instructions-link"
        >
          Sticker Printing Instructions
        </a>
      </h4>
      <Link to="/" className="back-button">
        Go Back
      </Link>
    </div>
  );
};

export default QRCodeInstructions;
