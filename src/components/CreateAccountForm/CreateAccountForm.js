import React, { useState } from "react";
import "./CreateAccountForm.css"; // Link to your CSS for styling

const CreateAccountForm = ({ onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@purdue\.edu$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid Purdue email.");
      return;
    }

    setError(""); // Clear errors
    console.log("New account created: ", { email, password });
    setEmail("");
    setPassword("");
  };

  return (
    <div className="create-account-form-container">
      <form className="create-account-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
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
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create Account</button>

        <div className="signup-link">
          Already have an account?{" "}
          <a href="#" onClick={onLoginClick}>
            Log In
          </a>
        </div>
      </form>
    </div>
  );
};

export default CreateAccountForm;
