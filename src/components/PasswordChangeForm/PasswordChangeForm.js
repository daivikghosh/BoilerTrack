import React, { useState } from "react";
import "./PasswordChangeForm.css";

const PasswordChangeForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    const email = localStorage.getItem("userEmail");
    fetch("http://localhost:5000/reset_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, oldPassword, newPassword }),
    })
      .then((response) => {
        if (response.ok) {
          setSuccess("Password changed successfully");
          setError(null);
          setNewPassword("");
          setOldPassword("");
          setConfirmPassword("");
        } else {
          return response.json().then((data) => {
            if (data.error === "Incorrect Password") {
              setError("Incorrect password");
            } else if (data.error === "User Not Found") {
              setError("Please make sure you are logged in");
            } else {
              setError("An error occurred");
            }
          });
        }
      })
      .catch((err) => console.error("Error handling password reset:", err));
  };

  const isFormValid =
    newPassword === confirmPassword && newPassword && confirmPassword;

  return (
    <div className="password-change-form-container">
      <form className="password-change-form" onSubmit={handleSubmit}>
        <h2>Change Password</h2>
        <div className="form-group">
          <label htmlFor="old-password">Old Password:</label>
          <input
            type="password"
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter your old password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New Password:</label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm New Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
          />
          {success && (
            <div className="success-message" style={{ color: "black" }}>
              {success}
            </div>
          )}
          {error && (
            <div className="error-message" style={{ color: "red" }}>
              {error}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          style={{ opacity: isFormValid ? 1 : 0.5 }}
        >
          Change Password
        </button>
        <div className="back-link">
          <a href="/">Back to Login</a>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
