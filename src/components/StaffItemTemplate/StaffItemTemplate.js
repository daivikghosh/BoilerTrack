import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./StaffItemTemplate.css";

const StaffItemTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item; // Get the passed item from state
  const canvasRef = useRef(null);
  const [imageURL, setImageURL] = useState(""); // Store the generated image URL

  if (!item) {
    // If no item is passed, redirect back to the AllItemsPage
    navigate(-1);
    return null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 1080;
    canvas.height = 1080;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawCenteredText = (text, y, fontSize, fontColor = "#000") => {
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = fontColor;
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, (canvas.width - textWidth) / 2, y);
    };

    let y = 50;
    drawCenteredText("Item Turned In", y, 36, "#222");
    y += 190;

    if (item.ImageURL) {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${item.ImageURL}`;
      img.onload = () => {
        const imageWidth = 400;
        const imageHeight = (img.height / img.width) * imageWidth;
        ctx.drawImage(
          img,
          (canvas.width - imageWidth) / 2,
          y,
          imageWidth,
          imageHeight,
        );
        y += imageHeight + 80;
        drawDetails(y);
        setImageURL(canvas.toDataURL("image/png"));
      };
    } else {
      drawDetails(y);
      setImageURL(canvas.toDataURL("image/png"));
    }

    const drawDetails = (startY) => {
      let detailsY = startY;
      drawCenteredText(`Item Name: ${item.ItemName}`, detailsY, 28, "#444");
      detailsY += 50;
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
      <div className="big-container">
        <div className="preview-section">
          <canvas ref={canvasRef} className="template-canvas" />
        </div>
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

          {/* Social Media Links */}
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

          <button onClick={() => navigate(-1)} className="back-button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffItemTemplate;
