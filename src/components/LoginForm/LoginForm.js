import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = ({ onSignupClick, onForgotPasswordClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setError("");

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful: ", data);
        localStorage.setItem("userEmail", email);
        alert("Login successful!");
        navigate("/all-items");
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while logging in.");
    }
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
            placeholder="Enter your email"
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

        <div className="signup-link">
          Don't have an account?{" "}
          <a href="#" onClick={onSignupClick}>
            Sign Up
          </a>
        </div>
        <div className="forgot-password-link">
          <a href="#" onClick={onForgotPasswordClick}>
            Forgot Password?
          </a>{" "}
          |{" "}
          <a href="#" onClick={() => navigate("/token-reset")}>
            Have a token?
          </a>
        </div>
        <div className="staff-login">
          <Link to="/staff-auth" className="link-button">
            Staff Login/Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
