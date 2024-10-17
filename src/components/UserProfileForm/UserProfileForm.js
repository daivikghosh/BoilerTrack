import React from "react";
import "./UserProfileForm.css";

const UserProfileForm = ({
  name,
  setName,
  pronouns,
  setPronouns,
  isEditing,
  handleEditClick,
  handleSaveClick,
}) => {
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
        <button onClick={() => alert("View Claim Requests clicked")}>
          View Claim Requests
        </button>
        <button onClick={() => alert("My Registered Items clicked")}>
          My Registered Items
        </button>
      </div>
    </div>
  );
};

export default UserProfileForm;
