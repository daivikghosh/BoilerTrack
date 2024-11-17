import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ProcessedClaims.css";

const ProcessedClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProcessedClaims = async () => {
      try {
        const response = await axios.get("/get-processed-claims");
        setClaims(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching processed claims:", err);
        setError("Failed to load processed claims.");
        setLoading(false);
      }
    };

    fetchProcessedClaims();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="processed-claims-page">
      <h2>Processed Claims</h2>
      {claims.length > 0 ? (
        <div className="claims-container">
          {claims.map((claim) => (
            <div key={claim.ClaimID} className="claim-card">
              <p>
                <strong>Claim ID:</strong> {claim.ClaimID}
              </p>
              <p>
                <strong>Date Claimed:</strong> {claim.DateClaimed}
              </p>
              <p>
                <strong>User Email:</strong> {claim.UserEmailID}
              </p>
              <p>
                <strong>Staff Name:</strong> {claim.StaffName}
              </p>
              <p>
                <strong>Student ID:</strong> {claim.StudentID}
              </p>
              <Link to={`/edit-processed-claim/${claim.ClaimID}`}>
                <button className="edit-button">Edit</button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No processed claims found.</p>
      )}
    </div>
  );
};

export default ProcessedClaims;
