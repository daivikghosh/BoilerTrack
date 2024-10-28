import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ClaimViewStaff.css";

const IndividualClaimView = () => {
  const { claimId } = useParams(); // Get the claim ID from the URL
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rationale, setRationale] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate for routing

  useEffect(() => {
    const fetchClaimDetails = async () => {
      try {
        const response = await axios.get(`/individual-request-staff/${claimId}`);
        setClaim(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching claim details:", err);
        setError("Failed to load claim details. Please try again later.");
        setLoading(false);
      }
    };

    fetchClaimDetails();
  }, [claimId]);

  const handleApprove = async () => {
    try {
      // Make an API call to approve the claim request
      await axios.post(`/individual-request-staff/${claimId}/approve`);
      alert("Claim approved successfully!");
      navigate("/all-request-staff"); // Navigate back to the claim list
    } catch (err) {
      console.error("Error approving claim:", err);
      alert("Failed to approve the claim. Please try again.");
    }
  };

  const handleReject = async () => {
    try {
      if (!rationale) {
        alert("Please provide a rationale for rejection.");
        return;
      }
      await axios.post(`/individual-request-staff/${claimId}/reject`, { rationale });
      alert("Claim rejected with rationale!");
      navigate("/all-request-staff");
    } catch (err) {
      console.error("Error rejecting claim:", err);
      alert("Failed to reject the claim. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="individual-claim-container">
      <div className="individual-claim-card">
        <div className="image-container">
          <p className="image-caption">
            <strong>Image proof provided by user:</strong>
          </p>
          <img
            src={`data:image/jpeg;base64,${claim.PhotoProof}`}
            alt={claim.ItemName}
            className="individual-claim-image"
          />
        </div>
        <div className="claim-details-container">
          <div className="individual-claim-header">
            <h2>Claim Details for {claim?.ItemName}</h2>
          </div>
          <div className="claim-details">
            <p>
              <strong>Item ID:</strong> {claim?.ItemID}
            </p>
            <p>
              <strong>Item name:</strong> {claim?.ItemName}
            </p>
            <p>
              <strong>Item at location:</strong> {claim?.LocationTurnedIn}
            </p>
            <p>
              <strong>Request submitted by user:</strong> {claim?.UserEmail}
            </p>
            <p>
              <strong>Reason provided by user:</strong> {claim?.Comments}
            </p>
          </div>
          <div className="staff-actions">
            <button className="approve-button" onClick={handleApprove}>
              Approve
            </button>
            <textarea
              placeholder="Provide rationale for rejection..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}  // Capture rationale input
              className="rationale-textarea"
            ></textarea>
            <button className="reject-button" onClick={handleReject}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default IndividualClaimView;
