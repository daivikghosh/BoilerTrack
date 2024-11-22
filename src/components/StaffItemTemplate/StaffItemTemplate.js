import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StaffItemTemplate.css";

const StaffItemTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item; // Get the passed item from state
  const canvasRef = useRef(null);

  if (!item) {
    // If no item is passed, redirect back to the AllItemsPage
    navigate(-1);
    return null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set up canvas dimensions and background
    canvas.width = 1080;
    canvas.height = 1080;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Helper function to draw centered text
    const drawCenteredText = (text, y, fontSize, fontColor = "#000") => {
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = fontColor;
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, (canvas.width - textWidth) / 2, y);
    };

    let y = 50;

    // Title
    drawCenteredText("Item Turned In", y, 36, "#222");
    y += 190;

    // Draw item image if it exists
    if (item.ImageURL) {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${item.ImageURL}`;
      img.onload = () => {
        const imageWidth = 400;
        const imageHeight = (img.height / img.width) * imageWidth; // Maintain aspect ratio
        ctx.drawImage(
          img,
          (canvas.width - imageWidth) / 2,
          y,
          imageWidth,
          imageHeight,
        );
        y += imageHeight + 80; // Add spacing after the image

        // Draw details after the image is loaded
        drawDetails(y);
      };
    } else {
      // If no image, draw details immediately
      drawDetails(y);
    }

    // Function to draw item details
    const drawDetails = (startY) => {
      let detailsY = startY;

      drawCenteredText(`Item Name: ${item.ItemName}`, detailsY, 28, "#444");
      detailsY += 50; // Add spacing between lines

      drawCenteredText(
        `Description: ${item.Description}`,
        detailsY,
        24,
        "#555",
      );
      detailsY += 50;

      drawCenteredText(
        `Location Turned In: ${item.LocationTurnedIn}`,
        detailsY,
        24,
        "#555",
      );
      detailsY += 50;

      drawCenteredText("#BoilerTrack", canvas.height - 50, 20, "#777");
    };
  }, [item]);

  const downloadTemplate = (type) => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL(`image/${type}`);
    const link = document.createElement("a");
    link.href = image;
    link.download = `${item.ItemName}-template.${type}`;
    link.click();
  };

  return (
    <div className="template-page">
      <div className="template-container">
        {/* Live preview on the left */}
        <div className="preview-section">
          <canvas ref={canvasRef} className="template-canvas" />
        </div>

        {/* Options on the right */}
        <div className="options-section">
          <h1>Generate Template for {item.ItemName}</h1>
          <button
            onClick={() => downloadTemplate("png")}
            className="template-button"
          >
            Download as PNG
          </button>
          <button
            onClick={() => downloadTemplate("jpeg")}
            className="template-button"
          >
            Download as JPEG
          </button>
          <button onClick={() => navigate(-1)} className="back-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffItemTemplate;
