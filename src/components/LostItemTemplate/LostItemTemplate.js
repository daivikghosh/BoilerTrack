import React, { useRef, useEffect } from "react";
import "./LostItemTemplate.css";

const LostItemTemplate = ({ item, setSelectedItem }) => {
  const canvasRef = useRef(null);

  // Automatically draw the template on the canvas when the component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size and background
      canvas.width = 1080;
      canvas.height = 1080;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title text
      ctx.font = "bold 36px Arial";
      ctx.fillStyle = "#222";
      ctx.fillText("Lost Item", 50, 80);

      // Item details
      ctx.font = "28px Arial";
      ctx.fillStyle = "#444";
      ctx.fillText(`Item Name: ${item.ItemName}`, 50, 150);
      ctx.fillText(`Description: ${item.Description}`, 50, 200);
      ctx.fillText(`Date Lost: ${item.DateLost}`, 50, 250);
      ctx.fillText(`Location: ${item.LocationLost}`, 50, 300);

      // Footer or contact text
      ctx.fillStyle = "#777";
      ctx.font = "20px Arial";
      ctx.fillText("Contact: " + item.userEmail, 50, 350);
      ctx.fillText("#BoilerTrack", 50, 400);
    }
  }, [item]);

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
      {/* Display the canvas directly */}
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
    </div>
  );
};

export default LostItemTemplate;
