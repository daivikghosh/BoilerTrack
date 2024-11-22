import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./UnclaimedItemTemplate.css";

const UnclaimedItemTemplate = () => {
  const [unclaimedItems, setUnclaimedItems] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const canvasRef = useRef(null);
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    const fetchUnclaimedItems = async () => {
      try {
        const response = await axios.get("/items");
        const allItems = response.data;

        const currentDate = new Date();
        let startDate;

        switch (timeRange) {
          case "week":
            startDate = new Date();
            startDate.setDate(currentDate.getDate() - 7);
            break;
          case "month":
            startDate = new Date();
            startDate.setMonth(currentDate.getMonth() - 1);
            break;
          case "year":
            startDate = new Date();
            startDate.setFullYear(currentDate.getFullYear() - 1);
            break;
          default:
            startDate = new Date(0);
        }

        const filteredItems = allItems.filter((item) => {
          const itemDate = new Date(item.Date);
          return itemDate >= startDate && item.ItemStatus === 1;
        });

        setUnclaimedItems(filteredItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        alert("Failed to fetch unclaimed items.");
      }
    };

    fetchUnclaimedItems();
  }, [timeRange]);

  useEffect(() => {
    if (canvasRef.current && unclaimedItems.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = 1080;
      canvas.height = 1350;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawCenteredText = (text, y, fontSize, fontColor, fontWeight) => {
        ctx.font = `${fontWeight || "normal"} ${fontSize}px Arial`;
        ctx.fillStyle = fontColor || "#000";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (canvas.width - textWidth) / 2, y);
      };

      let y = 80;
      drawCenteredText(
        `Unclaimed Items (${timeRange === "all" ? "All Time" : `Last ${timeRange}`})`,
        y,
        40,
        "#222",
        "bold",
      );
      y += 60;

      unclaimedItems.forEach((item, index) => {
        if (y > canvas.height - 100) {
          drawCenteredText("...and more items not displayed.", y, 28, "#444");
          return;
        }

        drawCenteredText(`${index + 1}. ${item.ItemName}`, y, 28, "#444");
        y += 40;
        drawCenteredText(
          `Location Turned In: ${item.LocationTurnedIn}`,
          y,
          24,
          "#555",
        );
        y += 30;
        drawCenteredText(`Date Found: ${item.Date}`, y, 24, "#555");
        y += 50;
      });

      drawCenteredText("#BoilerTrack", canvas.height - 50, 24, "#777");

      setImageURL(canvas.toDataURL("image/png"));
    }
  }, [unclaimedItems, timeRange]);

  const saveAsImage = (format) => {
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL(`image/${format}`);
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = `unclaimed-items-template.${format}`;
    link.click();
  };

  return (
    <div className="template-container">
      <h1 className="template-header">Unclaimed Items</h1>
      <div className="content-container">
        <div className="preview-section">
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              marginBottom: "20px",
              maxWidth: "100%",
            }}
          />
        </div>
        <div className="options-section">
          <label htmlFor="timeRange" className="time-range-label">
            Select Time Range:
          </label>
          <select
            id="timeRange"
            className="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            className="template-button"
            onClick={() => saveAsImage("png")}
          >
            Download as PNG
          </button>
          <button
            className="template-button"
            onClick={() => saveAsImage("jpeg")}
          >
            Download as JPEG
          </button>
          <div className="social-links">
            <h3>Visit Social Media Platforms</h3>
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
      </div>
    </div>
  );
};

export default UnclaimedItemTemplate;
