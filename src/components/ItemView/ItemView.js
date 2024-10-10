import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ItemView.css";

// STAFF VIEW

const ItemView = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [item, setItem] = useState(null);
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isArchived, setIsArchived] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/item/${id}`);
        setItem(response.data);
        setIsArchived(response.data.Archived === 1);
        setLoading(false);
      } catch (err) {
        setError("Error fetching item details");
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    console.log("Submitted proof and comments:", { file, comments });
  };

  const handleArchiveToggle = async () => {
    try {
      if (isArchived) {
        await axios.post(`/item/unarchive/${id}`);
        setIsArchived(false);
      } else {
        await axios.post(`/item/archive/${id}`);
        setIsArchived(true);
      }
    } catch (err) {
      console.error("Error archiving/unarchiving item:", err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="item-view-container">
      <div className="item-view-card">
        {/* Display the fetched image */}
        {item && item.ImageURL && (
          <img
            src={`data:image/jpeg;base64,${item.ImageURL}`}
            alt={item.ItemName}
            className="item-view-image"
          />
        )}
        <h2>{item?.ItemName}</h2>
        <div className="item-details">
          <p><strong>Brand:</strong> {item?.Brand}</p>
          <p><strong>Color:</strong> {item?.Color}</p>
          <p><strong>Found at:</strong> {item?.LocationFound}</p>
          <p><strong>Turned In At:</strong> {item?.LocationTurnedIn}</p>
          <p className="item-description">{item?.Description}</p>
        </div>
        <div className="upload-section">
          <label htmlFor="file-upload" className="file-upload-label">
            Upload proof
            <input type="file" id="file-upload" onChange={handleFileChange} />
          </label>
          <div className="file-upload-text">
            {file ? file.name : "File / upload"}
          </div>
        </div>
        <div className="comment-section">
          <label htmlFor="comments">Explain</label>
          <textarea
            id="comments"
            placeholder="Your comments"
            value={comments}
            onChange={handleCommentChange}
            maxLength={2000}
          />
          <p className="char-limit">Max. 2000 characters</p>
        </div>
        <div className="button-container">
        <button className="claim-button" onClick={handleSubmit}>
          Claim
        </button>
        <button className="archive-button" onClick={handleArchiveToggle}>
          {isArchived ? "Undo Move to Central Lost and Found Facility" : "Transfer to Central Lost and Found Facility"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default ItemView;
