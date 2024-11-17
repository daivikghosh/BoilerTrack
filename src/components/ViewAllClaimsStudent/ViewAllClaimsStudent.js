import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewAllClaimsStudent.css";

const ListViewClaimRequestsStudent = () => {
  const { emailId } = useParams();
  const [claimRequests, setClaimRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClaimRequests = async () => {
      try {
        // Fetch claim requests from the backend API
        const claimResponse = await axios.get(
          `/allclaim-requests-student/${emailId}`,
        );
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
    <div className="list-requests-container">
      {claimRequests.length > 0 ? (
        claimRequests.map((item) => (
          <div key={item.ItemID} className="list-item-card">
            <div className="list-item-details">
              <h3>{item.ItemName}</h3>
              <p>
                <strong>Item ID:</strong> {item.ItemID}
              </p>
              <p>
                <strong>Claim Status:</strong> {item.ClaimStatus}
              </p>
              <p>
                <strong>Reason Given:</strong> {item.Comments}
              </p>
            </div>
            <div className="list-item-actions">
              {item.ClaimStatus !== "Acepted" && (
                <button
                  className="action-button"
                  onClick={() => {
                    navigate(`/claim-modify-student/${item.ItemID}`);
                  }}
                >
                  Modify Request
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No claim requests found.</p>
      )}
    </div>
  );
};

export default ListViewClaimRequestsStudent;
