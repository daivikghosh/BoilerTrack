import React, { useState } from "react";
import "./CreateAccountForm.css"; // Link to your CSS for styling

const CreateAccountForm = ({ onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !name) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@purdue\.edu$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid Purdue email.");
      return;
    }

    setError(""); // Clear errors

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, isStudent: true, isStaff: false }),
      });

      if (response.ok) {
        console.log("New account created: ", { email, password, name });
        setEmail("");
        setPassword("");
        setName("");
        alert("Account created successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.error + (errorData.details ? `: ${errorData.details}` : ''));
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while creating the account.');
    }
  };

  return (
    <div className="create-account-form-container">
      <form className="create-account-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>
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