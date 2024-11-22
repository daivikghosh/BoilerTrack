import React, { useState } from "react";
import "./FoundItemReportForm.css";
import axios from "axios";
const FoundItemReportForm = () => {
  const [locationFound, setLocationFound] = useState("");
  const [description, setDescription] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationFound || !description || !email) {
      setError("Location, Description, and Email are required.");
      return;
    }
    const reportData = {
      locationFound,
      description,
      additionalDetails,
      email,
    };
    try {
      const response = await axios.post("/api/report-found-item", reportData, {
        headers: { "Content-Type": "application/json" },
      });
      setSuccess("Report submitted successfully!");
      setError("");
      // Clear form fields
      setLocationFound("");
      setDescription("");
      setAdditionalDetails("");
      setEmail("");
    } catch (err) {
      setError("Failed to submit report. Please try again.");
      setSuccess("");
    }
  };
  return (
    <div className="found-item-form-container">
      <h2>Report Found Item</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="locationFound">Location Found</label>
          <input
            type="text"
            id="locationFound"
            value={locationFound}
            onChange={(e) => setLocationFound(e.target.value)}
            placeholder="e.g., Library, Gym"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Item Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="additionalDetails">Additional Details</label>
          <textarea
            id="additionalDetails"
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            placeholder="Any other information"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Submit Report
        </button>
      </form>
    </div>
  );
};
export default FoundItemReportForm;