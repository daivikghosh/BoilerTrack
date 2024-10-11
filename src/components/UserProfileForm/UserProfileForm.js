const UserProfileForm = ({ name, setName, pronouns, setPronouns, isEditing, handleEditClick, handleSaveClick }) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        {isEditing ? (
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <p>{name || 'N/A'}</p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="pronouns">Pronouns:</label>
        {isEditing ? (
          <input
            type="text"
            id="pronouns"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
        ) : (
          <p>{pronouns || 'N/A'}</p>
        )}
      </div>
      <div className="button-group">
      {isEditing ? (
        <button onClick={handleSaveClick}>Save</button>
      ) : (
        <button onClick={handleEditClick}>Edit</button>
      )}
    </div>
  </>
);
};

export default UserProfileForm;