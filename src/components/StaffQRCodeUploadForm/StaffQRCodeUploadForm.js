import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./StaffQRCodeUploadForm.css";

const StaffQRCodeUploadForm = () => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!file) {
      alert("Please upload a picture of the QR code.");
      return;
    }
  
    // Create a FormData object to send the file via an API request
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post("/upload-qr-code", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      const { item_id, email } = response.data;
      console.log("QR code uploaded successfully:", response.data);
      alert(`QR code uploaded successfully! \n\nItem ID: ${item_id} \nUser Email: ${email}\n\nAn email to the relevent users will be sent shortly`);
      navigate("/all-items-staff");
    } catch (err) {
      console.error("Error uploading QR code:", err);
      alert("Error uploading QR code. Please try again.");
    }
  };
  

  return (
    <div className="qr-code-upload-container">
      <h2>Upload QR Code</h2>
      <form onSubmit={handleSubmit}>
        <div className="upload-section">
          <label htmlFor="file-upload" className="custom-file-upload">
            <img
              src={process.env.PUBLIC_URL + "/uploadsymbol.webp"}
              alt="Upload Icon"
            />
            <span>Choose File</span>
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
          {file && <p className="upload-preview">{file.name}</p>}
          {errors.file && <p className="error-text">{errors.file}</p>}
        </div>

        <button className="submit-button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StaffQRCodeUploadForm;
