import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ItemView.css";

const PrintItem = () => {
  const { id } = useParams(); // Get the item ID from the URL
  const [item, setItem] = useState(null);
  const [user, setUser] = useState({ name: "N/A", email: "N/A", pronouns: "N/A" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItemAndClaimDetails = async () => {
      try {
        console.log(`Fetching item details for item ID: ${id}`);

        // Fetch the item information
        const response = await axios.get(`/item/${id}`);
        console.log("Item data received:", response.data);
        setItem(response.data);

        // Attempt to fetch claim details
        console.log(`Fetching claim details for item ID: ${id}`);
        try {
          const claimResponse = await axios.get(`/individual-request-staff/${id}`);
          const claimData = claimResponse.data;
          console.log("Claim data received:", claimData);

          // Check if the claim is approved
          if (claimData.ClaimStatus === 2) {
            console.log("Claim is approved, fetching user info...");
            const userEmail = claimData.UserEmail;
            console.log("User email from claim:", userEmail);

            // Fetch user profile using the user email from the claim request
            const userResponse = await axios.get(`/profile?email=${userEmail}`);
            console.log("User data received:", userResponse.data);
            setUser({ ...userResponse.data, email: userEmail });
          } else {
            console.log("Claim exists but is not approved.");
            // Set the email from the claim data, even if not approved
            setUser((prevUser) => ({ ...prevUser, email: claimData?.UserEmail || "N/A" }));
          }
        } catch (claimError) {
          // Handle cases where the claim request is not found (404 error)
          if (claimError.response && claimError.response.status === 404) {
            console.warn("No claim request found for this item.");
          } else {
            console.error("Error fetching claim details:", claimError);
          }
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
        setError("Failed to load item details. Please try again later.");
      } finally {
        console.log("Finished fetching item and claim details");
        setLoading(false);
        window.print();
      }
    };

    fetchItemAndClaimDetails();
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
        {/* Display the fetched image */}
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
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p> {/* Email is displayed from the claim */}
          <p><strong>Pronouns:</strong> {user?.pronouns || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintItem;