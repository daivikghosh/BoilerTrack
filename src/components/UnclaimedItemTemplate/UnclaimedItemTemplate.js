import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./UnclaimedItemTemplate.css";

const UnclaimedItemTemplate = () => {
  const [unclaimedItems, setUnclaimedItems] = useState([]);
  const canvasRef = useRef(null);

  // Fetch all items and filter unclaimed items turned in the last week
  useEffect(() => {
    const fetchUnclaimedItems = async () => {
      try {
        const response = await axios.get("/items"); // Fetch all items
        const allItems = response.data;

        allItems.forEach((item) => {
          console.log(
            "Item DateFound:",
            item.Date,
            "Parsed:",
            new Date(item.Date),
          );
        });

        // Get the date one week ago
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 700);

        console.log("One week ago:", oneWeekAgo);

        // Filter items for unclaimed status and DateFound within the last week
        const recentUnclaimedItems = allItems.filter((item) => {
          // Parse DateFound using Date constructor
          const itemDate = new Date(item.Date);

          // Validate that itemDate is a valid date
          if (isNaN(itemDate.getTime())) {
            console.error("Invalid date format for item:", item);
            return false;
          }

          return itemDate >= oneWeekAgo && item.ItemStatus === 1; // 1 = Unclaimed
        });

        console.log("Filtered unclaimed items:", recentUnclaimedItems);

        setUnclaimedItems(recentUnclaimedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        alert("Failed to fetch unclaimed items.");
      }
    };

    fetchUnclaimedItems();
  }, []);

  // Draw the template on the canvas
  useEffect(() => {
    if (canvasRef.current && unclaimedItems.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size and background
      canvas.width = 1080;
      canvas.height = 1350; // Adjust based on item count
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw title
      const drawCenteredText = (text, y, fontSize, fontColor, fontWeight) => {
        ctx.font = `${fontWeight || "normal"} ${fontSize}px Arial`;
        ctx.fillStyle = fontColor || "#000";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (canvas.width - textWidth) / 2, y);
      };

      let y = 80;
      drawCenteredText("Unclaimed Items (Last Week)", y, 40, "#222", "bold");
      y += 60;

      // Loop through unclaimed items and render details
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
        drawCenteredText(`Date Found: ${item.DateFound}`, y, 24, "#555");
        y += 50;
      });

      // Footer
      drawCenteredText("#BoilerTrack", canvas.height - 50, 24, "#777");
    }
  }, [unclaimedItems]);

  // Save canvas as PNG or JPEG
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
      <h1>Unclaimed Items Template</h1>
      {unclaimedItems.length > 0 ? (
        <>
          <div className="template-preview">
            <canvas
              ref={canvasRef}
              style={{
                display: "block",
                marginBottom: "20px",
                maxWidth: "100%",
              }}
            />
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
          </div>
        </>
      ) : (
        <p>Loading unclaimed items...</p>
      )}
    </div>
  );
};

export default UnclaimedItemTemplate;
