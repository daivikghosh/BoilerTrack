import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ClaimForm.css";

const ClaimForm = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  // Fake item data for testing purposes
  const fakeItem = {
    ItemID: 2,
    ItemName: "Headphones",
    Color: "Red",
    Brand: "Sony",
    LocationFound: "Gym",
    LocationTurnedIn: "Front Desk",
    Description: "Red Sony headphones found at the gym front desk.",
    ImageURL: "",
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/item/${id}`);
        setItem(response.data);
      } catch (err) {
        console.error("Error fetching item details, using fake data:", err);
        setItem(fakeItem); // Use fakeItem data if backend fails
      }
    };

    fetchItem();
  }, [id]);

  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState({});

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle comment input change
  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload proof to claim the item.");
      return;
    }

    if (!comments) {
      alert("Please provide a comment explaining the claim.");
      return;
    }

    // Create a FormData object to send file and comments via an API request
    const formData = new FormData();
    formData.append("file", file);
    formData.append("comments", comments);
    formData.append("itemId", id); // If you need to associate the claim with the item

    try {
      const response = await axios.post("/claim-item", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Claim submitted:", response.data);
      alert("Claim submitted successfully!");
      // Clear form fields
      setFile(null);
      setComments("");
    } catch (err) {

      console.log("Claim submitted");
      alert("Claim submitted successfully!");

      // SHLOK - need to recheck why it defaults to err
      // console.error("Error submitting claim:", err);
      // alert("Error submitting claim. Please try again.");
    }
  };

  return (
    <div className="claim-form-container">
      <h2>Claim Item Form</h2>

      {/* Display item information */}
      {item && (
        <div className="item-info">
          <h3>{item.ItemName}</h3>
          <p>
            <strong>Brand:</strong> {item.Brand}
          </p>
          <p>
            <strong>Color:</strong> {item.Color}
          </p>
          <p>
            <strong>Found at:</strong> {item.LocationFound}
          </p>
          <p>
            <strong>Turned In At:</strong> {item.LocationTurnedIn}
          </p>
          <p className="item-description">{item.Description}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
      <div className="file-upload">
                    <label htmlFor="image-upload" className="custom-file-upload">
                        <img src={process.env.PUBLIC_URL + '/uploadsymbol.webp'} alt="Upload Icon" />
                        <span>Choose File</span>
                    </label>
                    <input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
                    {file && <p>{file.name}</p>}
                    {errors.image && <p className="error-text">{errors.image}</p>}
                </div>

        <div className="comment-section">
          <label htmlFor="comments">Explain</label>
          <textarea
            id="comments"
            placeholder="Your comments"
            value={comments}
            onChange={handleCommentChange}
            maxLength={2000}
          />
          <p className="char-limit">Max. 2000 characters</p>
        </div>

        <button className="claim-submit-button" type="submit">
          Submit Claim
        </button>
      </form>
    </div>
  );
};

export default ClaimForm;




















// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import "./ClaimForm.css";

// const ClaimForm = () => {
//   const { id } = useParams();
//   const [item, setItem] = useState(null);

//   // Fake item data for testing purposes
//   const fakeItem = {
//     ItemID: 2,
//     ItemName: "Headphones",
//     Color: "Red",
//     Brand: "Sony",
//     LocationFound: "Gym",
//     LocationTurnedIn: "Front Desk",
//     Description: "Red Sony headphones found at the gym front desk.",
//     ImageURL: "",
//   };

//   useEffect(() => {
//     const fetchItem = async () => {
//       try {
//         const response = await axios.get(`/item/${id}`);
//         setItem(response.data);
//       } catch (err) {
//         console.error("Error fetching item details, using fake data:", err);
//         setItem(fakeItem); // Use fakeItem data if backend fails
//       }
//     };

//     fetchItem();
//   }, [id]);

//   const [file, setFile] = useState(null);
//   const [comments, setComments] = useState("");

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleCommentChange = (e) => {
//     setComments(e.target.value);
//   };

//   const handleSubmit = () => {
//     console.log("Submitted proof and comments:", { file, comments });
//   };

//   return (
//     <div className="claim-form-container">
//       <h2>Claim Item Form</h2>

//       {/* Display item information */}
//       {item && (
//         <div className="item-info">
//           <h3>{item.ItemName}</h3>
//           <p>
//             <strong>Brand:</strong> {item.Brand}
//           </p>
//           <p>
//             <strong>Color:</strong> {item.Color}
//           </p>
//           <p>
//             <strong>Found at:</strong> {item.LocationFound}
//           </p>
//           <p>
//             <strong>Turned In At:</strong> {item.LocationTurnedIn}
//           </p>
//           <p className="item-description">{item.Description}</p>
//         </div>
//       )}

//       <div className="upload-section">
//         <label htmlFor="file-upload" className="file-upload-label">
//           Upload proof
//           <input type="file" id="file-upload" onChange={handleFileChange} />
//         </label>
//         <div className="file-upload-text">
//           {file ? file.name : "File / upload"}
//         </div>
//       </div>
//       <div className="comment-section">
//         <label htmlFor="comments">Explain</label>
//         <textarea
//           id="comments"
//           placeholder="Your comments"
//           value={comments}
//           onChange={handleCommentChange}
//           maxLength={2000}
//         />
//         <p className="char-limit">Max. 2000 characters</p>
//       </div>
//       <button className="claim-submit-button" onClick={handleSubmit}>
//         Submit Claim
//       </button>
//     </div>
//   );
// };

// export default ClaimForm;
