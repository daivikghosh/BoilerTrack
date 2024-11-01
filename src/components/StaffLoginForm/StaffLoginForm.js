import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StaffLoginForm.css";

function StaffLoginForm({ onSignupClick }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    buildingDept: "HILL",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("/api/staff/login", formData);
      if (response.data.isApproved) {
        navigate("/all-items-staff");
      } else {
        setError("Your account is not approved yet.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="form-container">
      <h2>Staff Login</h2>
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
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <p>
        Don't have an account?{" "}
        <button onClick={onSignupClick} className="link-button">
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default StaffLoginForm;