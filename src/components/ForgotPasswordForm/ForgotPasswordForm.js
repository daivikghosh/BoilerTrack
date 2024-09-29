import React, { useState } from "react";
import "./ForgotPasswordForm.css";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@purdue\.edu$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid Purdue email.");
      return;
    }

    setError("");

    console.log("Reset link sent to: ", email);

    setEmail("");
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Purdue email"
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Send Reset Link</button>

        <div className="signup-link">
          <a href="#" onClick={onBackToLogin}>
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
