import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import UserProfileForm from "../components/UserProfileForm/UserProfileForm.js";

const UserProfilePage = () => {
    const [name, setName] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(''); // This should be set when the user logs in
    const navigate = useNavigate(); // Initialize useNavigate hook

    useEffect(() => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
          setEmail(userEmail);
          fetchUserProfile(userEmail);
      } else {
          console.error('No user email found in localStorage');
          // You might want to redirect to login here
      }
  }, []);

    const fetchUserProfile = async () => {
      try {
          // Assume email is stored in localStorage when user logs in
          const userEmail = localStorage.getItem('userEmail');
          setEmail(userEmail);
  
          if (!userEmail) {
              console.error('No user email found in localStorage');
              return;
          }
  
          const response = await fetch(`http://localhost:5000/profile?email=${encodeURIComponent(userEmail)}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });
          if (response.ok) {
              const data = await response.json();
              console.log("Fetched profile data:", data);
              setName(data.name || '');
              setPronouns(data.pronouns || '');
          } else {
              console.error('Failed to fetch user profile:', await response.text());
          }
      } catch (error) {
          console.error('Error:', error);
      }
  };

  const handleSaveClick = async () => {
    try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            console.error('No user email found in localStorage');
            // You might want to redirect to login or show an error message
            return;
        }

        console.log("Sending profile update:", { email: userEmail, name, pronouns });
        const response = await fetch('http://localhost:5000/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail, name, pronouns }),
        });
        if (response.ok) {
            console.log("Profile updated successfully");
            setIsEditing(false);
        } else {
            const errorText = await response.text();
            console.error('Failed to update user profile:', errorText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  };

  const handleViewClaimRequests = () => {
    navigate('/ClaimRequests'); // This will navigate to the Claim Requests page
  };

  const handleViewRegistedItems = () => {
    navigate('/Preregistered-items'); // This will navigate to the Claim Requests page
  };
    // ... rest of the component

    return (
        <div className="user-profile">
            <h2>User Profile Setup</h2>
            <UserProfileForm
                name={name}
                setName={setName}
                pronouns={pronouns}
                setPronouns={setPronouns}
                isEditing={isEditing}
                handleEditClick={() => setIsEditing(true)}
                handleSaveClick={handleSaveClick}
            />
        </div>
    );
};

export default UserProfilePage;