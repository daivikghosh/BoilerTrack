import React from "react";
import "./UserProfileForm.css";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook

const UserProfileForm = ({
  name,
  setName,
  pronouns,
  setPronouns,
  isEditing,
  handleEditClick,
  handleSaveClick,
}) => {
  const navigate = useNavigate(); // Initialize navigate
  return (
    <div className="user-profile-container">
      <div className="user-profile">
        <h2 className="profile-title">Profile</h2>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          {isEditing ? (
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          ) : (
            <p className="profile-info">{name || "N/A"}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="pronouns">Pronouns:</label>
          {isEditing ? (
            <input
              type="text"
              id="pronouns"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
              className="input-field"
            />
          ) : (
            <p className="profile-info">{pronouns || "N/A"}</p>
          )}
        </div>
        <div className="button-group">
          {isEditing ? (
            <button onClick={handleSaveClick} className="save-button">
              Save
            </button>
          ) : (
            <button onClick={handleEditClick} className="edit-button">
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="additional-buttons">
        <button
          onClick={() => navigate("/ClaimRequests")} // Use navigate to go to claim requests page
          className="action-button"
        >
          View Claim Requests
        </button>
        <button
          onClick={() => navigate("/Preregistered-items")} // Use navigate to go to registered items page
          className="action-button"
        >
          My Registered Items
        </button>
        <button
          onClick={() => navigate("/UserFeedback")} // Use navigate to go to registered items page
          className="action-button"
        >
          My Feedback
        </button>
      </div>
    </div>
  );
};

export default UserProfileForm;
