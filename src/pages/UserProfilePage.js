import React, { useState } from "react";
import UserProfileForm from "../components/UserProfileForm/UserProfileForm.js";

const UserProfilePage = () => {
    const [name, setName] = useState('');
    const [pronoun, setPronoun] = useState('');
    const [isEditing, setIsEditing] = useState(false);
  
    const handleEditClick = () => {
      setIsEditing(true);
    };
  
    const handleSaveClick = () => {
      setIsEditing(false);
    };
  
    return (
      <div className="user-profile">
        <h2>User Profile Setup</h2>
        <UserProfileForm
          name={name}
          setName={setName}
          pronoun={pronoun}
          setPronoun={setPronoun}
          isEditing={isEditing}
          handleEditClick={handleEditClick}
          handleSaveClick={handleSaveClick}
        />
      </div>
    );
  };
  
  export default UserProfilePage;