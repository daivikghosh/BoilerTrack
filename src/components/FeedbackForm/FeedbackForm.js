import React, { useState } from "react";
import axios from "axios";
import "./FeedbackForm.css";
import "../../styles/colors.css";

function FeedbackForm() {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setDescription(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Feedback is required");
      return;
    }

    try {
      await axios.post(
        "/feedback",
        { description },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      alert("Feedback submitted successfully!");
      setDescription(""); // Clear the form
    } catch (error) {
      console.error("Error submitting feedback", error);
      alert("There was an error submitting your feedback. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h1>Feedback</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label>Let us know what you think of BoilerTrack</label>
          <textarea
            name="description"
            value={description}
            onChange={handleChange}
            placeholder="Enter your feedback here"
          />
          {error && <p className="error-text">{error}</p>}
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;
