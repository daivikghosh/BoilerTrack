import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditProcessedClaim.css"; // Ensure you create this CSS file for styling

const EditProcessedClaim = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dateClaimed: "",
    userEmailID: "",
    staffName: "",
    studentID: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch the existing claim data
    const fetchClaimData = async () => {
      try {
        const response = await axios.get(`/get-release-form/${claimId}`);
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load claim data.");
        setLoading(false);
      }
    };

    fetchClaimData();
  }, [claimId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/edit-processed-claim/${claimId}`, formData);
      alert("Claim updated successfully!");
      navigate("/processed-claims");
    } catch (err) {
      setError("Failed to update claim.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-claim-container">
      <h2>Edit Processed Claim</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label>Date Claimed</label>
          <input
            type="date"
            name="dateClaimed"
            value={formData.dateClaimed}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-input">
          <label>User Email</label>
          <input
            type="email"
            name="userEmailID"
            value={formData.userEmailID}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-input">
          <label>Staff Name</label>
          <input
            type="text"
            name="staffName"
            value={formData.staffName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-input">
          <label>Student ID</label>
          <input
            type="text"
            name="studentID"
            value={formData.studentID}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">Update Claim</button>
      </form>
    </div>
  );
};

export default EditProcessedClaim;
