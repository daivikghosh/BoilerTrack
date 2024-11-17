import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PreRegItemForm.css";

const PreRegItemForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: "",
    color: "",
    brand: "",
    ownerEmail: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setErrors({ ...errors, image: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;
    for (let key in formData) {
      if (!formData[key]) {
        formErrors[key] = "This field is required";
        isValid = false;
      }
    }
    if (!selectedFile) {
      formErrors.image = "An image file is required";
      isValid = false;
    }
    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    data.append("image", selectedFile);
    for (let key in formData) {
      data.append(key, formData[key]);
    }

    try {
      await axios.post("/preregister-item", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Item preregistered successfully!");

      // Reset form
      setFormData({
        itemName: "",
        color: "",
        brand: "",
        ownerEmail: "",
        description: "",
      });
      setSelectedFile(null);
      setErrors({});
      navigate("/preregistered-items");
    } catch (error) {
      console.error("Error submitting the form!", error);
      alert("Failed to preregister the item.");
    }
  };

  return (
    <div className="form-container">
      {/* Mock Instructions */}
      <div className="instructions">
        <h2>Instructions for Pre-Registering an Item</h2>
        <p>
          Please provide the details of the item you'd like to preregister. 
          Ensure all fields are filled and upload a clear image of the item. 
          After submission, your item will be added to the preregistered items list.
        </p>
      </div>

      <h1>Preregister Item</h1>
      <form onSubmit={handleSubmit}>
        <div className="file-upload">
          <label>Image Upload</label>
          <label htmlFor="image-upload" className="custom-file-upload">
            <img
              src={process.env.PUBLIC_URL + "/uploadsymbol.webp"}
              alt="Upload Icon"
            />
            <span>Choose File</span>
          </label>
          <input
            id="image-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
          {selectedFile && <p>{selectedFile.name}</p>}
          {errors.image && <p className="error-text">{errors.image}</p>}
        </div>

        <div className="form-input">
          <label>Item Name</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Enter item name"
            required
          />
          {errors.itemName && <p className="error-text">{errors.itemName}</p>}
        </div>

        <div className="form-input">
          <label>Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Enter color"
            required
          />
          {errors.color && <p className="error-text">{errors.color}</p>}
        </div>

        <div className="form-input">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Enter brand"
          />
          {errors.brand && <p className="error-text">{errors.brand}</p>}
        </div>

        <div className="form-input">
          <label>Owner Email</label>
          <input
            type="email"
            name="ownerEmail"
            value={formData.ownerEmail}
            onChange={handleChange}
            placeholder="Enter owner's email"
            required
          />
          {errors.ownerEmail && <p className="error-text">{errors.ownerEmail}</p>}
        </div>

        <div className="form-input">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter item description"
            required
          />
          {errors.description && (
            <p className="error-text">{errors.description}</p>
          )}
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PreRegItemForm;
