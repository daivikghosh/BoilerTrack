import React, { useState } from "react";
import "./PasswordChangeForm.css";

const PasswordChangeForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

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

    // Here we would ideally call a backend API to change the password,
    // but for the sake of this example, we'll only simulate the process.
    console.log("Old password: ", oldPassword);
    console.log("New password: ", newPassword);

    // Simulate successful password change
    alert("Password changed successfully!");
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
