import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DisputeClaimForm.css";

const DisputeClaimForm = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Fake item data for testing
  const fakeItem = {
    ItemID: 2,
    ItemName: "Headphones",
    Color: "Red",
    Brand: "Sony",
    LocationFound: "Gym",
    LocationTurnedIn: "Front Desk",
    Description: "Red Sony headphones found at the gym front desk.",
    ImageURL: "", // Include base64 image here for testing
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/item/${id}`);
        setItem(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching item details, using fake data:", err);
        setItem(fakeItem); // Use fakeItem data if backend fails
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const validateForm = () => {
    const errors = {};
    if (!reason.trim()) {
      errors.reason = "Reason for dispute is required.";
    }
    if (!file) {
      errors.file = "Proof image is required.";
    }
    if (!notes.trim()) {
      errors.notes = "Additional comments are required. Enter 'NA' if none.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("reason", reason);
    formData.append("notes", notes);
    formData.append("itemId", id);

    try {
      const response = await axios.post(`/dispute-claim/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Dispute submitted:", response.data);
      alert("Dispute submitted successfully!");
      setFile(null);
      setReason("");
      setNotes("");
      setFormErrors({});
      navigate("/all-items");
    } catch (err) {
      console.error("Error submitting dispute:", err);
      alert("Error submitting dispute. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dispute-form-container">
      <h2>Dispute Claim Form</h2>

      <button
        className="message-button"
        onClick={() => navigate(`/messages/${id}`)}
      >
        Communicate with Help Desk
      </button>

      {/* Display item information */}
      {item && (
        <div className="item-info">
          {item.ImageURL && (
            <img
              src={`data:image/jpeg;base64,${item.ImageURL}`}
              alt={item.ItemName}
              className="item-image"
            />
          )}
          <h3>{item.ItemName}</h3>
          <p>
            <strong>Brand:</strong> {item.Brand}
          </p>
          <p>
            <strong>Color:</strong> {item.Color}
          </p>
          <p>
            <strong>Found at:</strong> {item.LocationFound}
          </p>
          <p>
            <strong>Turned In At:</strong> {item.LocationTurnedIn}
          </p>
          <p className="item-description">{item.Description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="reason-section">
          <label htmlFor="reason">Reason for submitting dispute</label>
          <textarea
            id="reason"
            placeholder="Explain your reason for disputing this claim"
            value={reason}
            onChange={handleReasonChange}
            maxLength={1000}
          />
          {formErrors.reason && (
            <p className="error-text">{formErrors.reason}</p>
          )}
          <p className="char-limit">Max. 1000 characters</p>
        </div>

        <div className="file-upload">
          <label htmlFor="file-upload" className="custom-file-upload">
            Upload proof
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
          </label>
          {formErrors.file && <p className="error-text">{formErrors.file}</p>}
          <div className="file-upload-text">
            {file ? file.name : "Choose file"}
          </div>
        </div>

        <div className="notes-section">
          <label htmlFor="notes">Additional comments (NA if none)</label>
          <textarea
            id="notes"
            placeholder="Any additional information to support your dispute (Enter 'NA' if none)"
            value={notes}
            onChange={handleNotesChange}
            maxLength={2000}
          />
          {formErrors.notes && <p className="error-text">{formErrors.notes}</p>}
          <p className="char-limit">Max. 2000 characters</p>
        </div>

        <button className="dispute-submit-button" type="submit">
          Submit Dispute
        </button>
      </form>
    </div>
  );
};

export default DisputeClaimForm;
