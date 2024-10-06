const UserProfileForm = ({ name, setName, pronoun, setPronoun, isEditing, handleEditClick, handleSaveClick }) => {
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
          <label htmlFor="pronoun">Pronoun:</label>
          {isEditing ? (
            <input
              type="text"
              id="pronoun"
              value={pronoun}
              onChange={(e) => setPronoun(e.target.value)}
            />
          ) : (
            <p>{pronoun || 'N/A'}</p>
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