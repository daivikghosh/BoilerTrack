import React, { useRef, useEffect, useState } from "react";
import "./LostItemTemplate.css";

const LostItemTemplate = ({ item, setSelectedItem, goBack }) => {
  const canvasRef = useRef(null);

  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
  });
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size and background
      canvas.width = 1080;
      canvas.height = 1080;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Helper to draw centered text
      const drawCenteredText = (text, y, fontSize, fontColor, fontWeight) => {
        ctx.font = `${fontWeight || "normal"} ${fontSize}px Arial`;
        ctx.fillStyle = fontColor || "#000";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (canvas.width - textWidth) / 2, y);
      };

      let y = 80;

      // Title
      drawCenteredText("Have you seen this item?", y, 40, "#222", "bold"); // Increased from 36 to 40
      y += uploadedImage ? 0 : 350;

      // Draw uploaded image if it exists
      if (uploadedImage) {
        const img = new Image();
        img.src = uploadedImage;
        img.onload = () => {
          const imageWidth = 400; // Adjust width
          const imageHeight = (img.height / img.width) * imageWidth; // Maintain aspect ratio
          const x = (canvas.width - imageWidth) / 2; // Center image
          ctx.drawImage(img, x, y, imageWidth, imageHeight);
        };
        y += 200; // Increased spacing for the image
      }

      // Item details
      drawCenteredText(`Item Name: ${item.ItemName}`, y, 32, "#444"); // Increased from 28 to 32
      y += 60; // Increased spacing
      drawCenteredText(`Description: ${item.Description}`, y, 32, "#444"); // Increased from 28 to 32
      y += 60;
      drawCenteredText(`Date Lost: ${item.DateLost}`, y, 32, "#444"); // Increased from 28 to 32
      y += 60;
      drawCenteredText(`Last seen at: ${item.LocationLost}`, y, 32, "#444"); // Increased from 28 to 32
      y += 70;

      // Contact details
      if (contactInfo.email || contactInfo.phone) {
        drawCenteredText(
          `If found, contact: ${contactInfo.email || "N/A"} ${
            contactInfo.phone ? `or ${contactInfo.phone}` : ""
          }`,
          y,
          24, // Increased from 20 to 24
          "#777",
        );
      } else {
        drawCenteredText("If found, reach out!", y, 24, "#777"); // Increased from 20 to 24
      }
      y += 60;

      // Additional Notes
      if (additionalNotes) {
        drawCenteredText(`Notes: ${additionalNotes}`, y, 24, "#555"); // Increased from 20 to 24
        y += 60;
      }

      // Footer with BoilerTrack text
      drawCenteredText("#BoilerTrack", y, 24, "#777"); // Increased from 20 to 24
      y += 50;

      // Logo at the bottom left
      const logo = new Image();
      logo.src = "logo.png"; // Replace with your logo file path
      logo.onload = () => {
        const logoSize = 100; // Adjust size as needed
        ctx.drawImage(
          logo,
          20,
          canvas.height - logoSize - 20,
          logoSize,
          logoSize,
        );
      };
    }
  }, [item, contactInfo, additionalNotes, uploadedImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result); // Set the uploaded image as a data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAsPNG = () => {
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `${item.ItemName}-template.png`;
    link.click();
  };

  const saveAsJPEG = () => {
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `${item.ItemName}-template.jpg`;
    link.click();
  };

  return (
    <div className="template-container">
      <div className="template-preview">
        <canvas
          ref={canvasRef}
          style={{ display: "block", marginBottom: "20px", maxWidth: "100%" }}
        />
        <button className="template-button" onClick={saveAsPNG}>
          Download as PNG
        </button>
        <button className="template-button" onClick={saveAsJPEG}>
          Download as JPEG
        </button>

        <div className="social-links">
          <h3>Share this to: </h3>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-button twitter"
          >
            Twitter
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-button facebook"
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-button instagram"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="input-fields">
        {/* File input for image upload */}
        <label>
          Upload Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              marginBottom: "10px",
              display: "block",
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </label>

        {/* Other input fields */}
        <label>
          Email:
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, email: e.target.value })
            }
          />
        </label>
        <label>
          Phone:
          <input
            type="text"
            value={contactInfo.phone}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, phone: e.target.value })
            }
          />
        </label>
        <label>
          Additional Notes:
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Enter any additional notes (e.g., sentimental value, reward details)"
          />
        </label>
      </div>
    </div>
  );
};

export default LostItemTemplate;
