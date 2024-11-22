import React, { useState } from "react";
import axios from "axios";
import "./StaffCreateAccountForm.css";

function StaffCreateAccountForm({ onLoginClick }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    buildingDept: "HILL",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await axios.post("/api/staff/signup", formData);
      setMessage("Account created successfully. Awaiting approval.");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed.");
    }
  };

  return (
    <div className="form-container">
      <h2>Staff Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-input">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-input">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-input">
          <label>Building Department</label>
          <select
            name="buildingDept"
            value={formData.buildingDept}
            onChange={handleChange}
            required
          >
            <option value="HILL">HILL</option>
            <option value="WALC">WALC</option>
          </select>
        </div>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <button onClick={onLoginClick} className="link-button">
          Login
        </button>
      </p>
    </div>
  );
}

export default StaffCreateAccountForm;
