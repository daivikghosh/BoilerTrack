import React, { useState } from "react";
import "./TokenResetForm.css";

const TokenResetForm = () => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !token) {
      setError("Please fill in both fields.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const emailValue = localStorage.getItem("userEmail");
    fetch("http://localhost:5000/reset_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, token, newPassword }),
    })
      .then((response) => {
        if (response.ok) {
          setSuccess("Password changed successfully");
          setError(null);
          setNewPassword("");
          setConfirmPassword("");
          setToken("");
          setEmail(emailValue); // Resetting the email to local storage value
        } else {
          return response.json().then((data) => {
            if (data.error === "Token expired") {
              setError("Token Expired");
            } else if (data.error === "User Not Found") {
              setError("Please make sure you are logged in");
            } else if (data.error === "Invalid token") {
              setError("Invalid Token");
            } else {
              setError("An error occurred");
            }
          });
        }
      })
      .catch((err) => console.error("Error handling password change:", err));
  };

  const isFormValid =
    newPassword === confirmPassword &&
    newPassword !== "" &&
    email !== "" &&
    token !== "";

  return (
    <div className="token-reset-form-container">
      <form className="token-reset-form" onSubmit={handleSubmit}>
        <h2>Reset Password with Token</h2>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="token">Token:</label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter the reset token sent to your email"
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
        </div>
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
        <button
          type="submit"
          disabled={!isFormValid}
          style={{ opacity: isFormValid ? 1 : 0.5 }}
        >
          Reset Password
        </button>
        <div className="back-link">
          <a href="/">Back to Login</a>
        </div>
      </form>
    </div>
  );
};

export default TokenResetForm;
