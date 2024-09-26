import React, { useState } from "react";
import "./LoginForm.css"; // Link to your CSS for styling

const LoginForm = ({ onSignupClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation for email and password
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    // Email format validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@purdue\.edu$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid Purdue email.");
      return;
    }

    setError(""); // Clear errors if validation passes

    // Mock API call or actual API call here
    console.log("Submitted: ", { email, password });

    // Reset fields after submission
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <button type="submit">Login</button>

        {/* Forgot password link */}
        <div className="forgot-password">
          <a href="#">Forgot your password?</a>
        </div>

        {/* Sign up link */}
        <div className="signup-link">
          Don’t have an account?{" "}
          <a href="#" onClick={onSignupClick}>
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
