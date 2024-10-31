import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import "./ClaimForm.css";

const ModifyClaimForm = () => {
  const { claim_id } = useParams();
  const [file, setFile] = useState(null);
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        const response = await axios.get(`/item/${claim_id}`);
        const claim = response.data;
        setComments(claim.comments);
        setFile(null);
      } catch (err) {
        console.error("Error fetching claim details:", err);
      }
    };

    fetchClaimData();
  }, [claim_id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCommentChange = (e) => {
    setComments(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && !comments) {
      alert("Please upload a file or modify your comments.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("comments", comments);

    try {
        const response = await axios.put(`/claim-modify-student/${claim_id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
        });
      alert("Claim modified successfully!");
      navigate('/all-items');
    } catch (err) {
      console.error("Error modifying claim:", err);
      alert("Failed to modify claim. Please try again.");
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="claim-form-container">
      <h2>Modify Claim</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-upload">
        <label htmlFor="comments">Update Image Proof</label>
          <button 
            type="button" 
            className="upload-button" 
            onClick={handleFileUploadClick}
          >
            Upload File
          </button>
          <input 
            id="image-upload" 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: "none" }}
          />
          {file && <p>{file.name}</p>}
        </div>

        <div className="comment-section">
          <label htmlFor="comments">Update Comments</label>
          <textarea
            id="comments"
            placeholder="Add new comments here"
            value={comments}
            onChange={handleCommentChange}
            maxLength={2000}
          />
          <p className="char-limit">Max. 2000 characters</p>
        </div>

        <button className="claim-submit-button" type="submit">
          Submit Changes
        </button>
      </form>
    </div>
  );
};

export default ModifyClaimForm;
