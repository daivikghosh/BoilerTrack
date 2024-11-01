import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ItemView.css";

const PrintItem = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [item, setItem] = useState(null);
  const [user, setUser] = useState({ name: "N/A", pronouns: "N/A", email: "N/A" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        // Fetch the item details
        const itemResponse = await axios.get(`/item/${id}`);
        setItem(itemResponse.data);
        console.log("Item data:", itemResponse.data); // Log item data for debugging

        // Fetch claim requests related to the item
        const claimResponse = await axios.get(`/claim-requests?itemId=${id}`);
        const claims = claimResponse.data;
        console.log("Claim requests:", claims); // Log claim requests for debugging

        // Check if there is an approved claim
        const approvedClaim = claims.find(claim => claim.ClaimStatus === 2);
        if (approvedClaim) {
          console.log("Approved claim found:", approvedClaim); // Log approved claim for debugging
          
          // Fetch user information if an approved claim exists
          const userResponse = await axios.get(`/profile?email=${approvedClaim.UserEmail}`);
          setUser({ ...userResponse.data, email: approvedClaim.UserEmail });
          console.log("User data:", userResponse.data); // Log user data for debugging
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching item or claim details:", err);
        setError("Failed to load item details.");
        setLoading(false);
      }
    };

    fetchItemData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="item-view-container">
      <div className="item-view-card">
        {item && item.ImageURL && (
          <img
            src={`data:image/jpeg;base64,${item.ImageURL}`}
            alt={item.ItemName}
            className="item-view-image"
          />
        )}
        <h2>{item?.ItemName}</h2>
        <div className="item-details">
          <p>
            <strong>Brand:</strong> {item?.Brand}
          </p>
          <p>
            <strong>Color:</strong> {item?.Color}
          </p>
          <p>
            <strong>Found at:</strong> {item?.LocationFound}
          </p>
          <p>
            <strong>Turned In At:</strong> {item?.LocationTurnedIn}
          </p>
          <p className="item-description">{item?.Description}</p>
          <h3>User Information</h3>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Pronouns:</strong> {user.pronouns}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintItem;
