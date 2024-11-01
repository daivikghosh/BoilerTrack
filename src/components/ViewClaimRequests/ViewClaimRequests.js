import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewClaimRequests.css";

const ViewClaimRequests = () => {
  const [claimRequests, setClaimRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaimRequests = async () => {
      try {
        // Fetch claim requests from the backend API
        const claimResponse = await axios.get("/claim-requests");
        const claimRequests = claimResponse.data;

        setClaimRequests(claimRequests);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching claim requests:", err);
        setError("Failed to load claim requests. Please try again later.");
        setLoading(false);
      }
    };

    fetchClaimRequests();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="claim-requests-container">
      {claimRequests.length > 0 ? (
        claimRequests.map((item) => (
          <div key={item.ItemID} className="claim-card">
            <div className="item-details">
              <img
                src={`data:image/jpeg;base64,${item.ImageURL}`}
                alt={item.ItemName}
                className="item-image"
              />
              <h3>{item.ItemName}</h3>
              <p>
                <strong>Color:</strong> {item.Color}
              </p>
              <p>
                <strong>Brand:</strong> {item.Brand}
              </p>
              <p>
                <strong>Found at:</strong> {item.LocationFound}
              </p>
              <p>
                <strong>Turned in at:</strong> {item.LocationTurnedIn}
              </p>
              <p>
                <strong>Description:</strong> {item.Description}
              </p>
              <p>
                <strong>Date Found:</strong> {item.Date}
              </p>
              <p>
                <strong>Status:</strong> Claim request submitted
              </p>
            </div>
            <div className="claim-details">
              <h4>Claim Request Details</h4>
              <p>
                <strong>Comments:</strong> {item.Comments}
              </p>
              <img
                src={`data:image/jpeg;base64,${item.PhotoProof}`}
                alt="Claim Proof"
                className="claim-proof"
              />
            </div>
          </div>
        ))
      ) : (
        <p>No claim requests found.</p>
      )}
    </div>
  );
};

export default ViewClaimRequests;
