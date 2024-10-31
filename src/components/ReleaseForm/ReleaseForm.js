import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReleaseForm.css';

const ReleaseForm = () => {
  const { claimId } = useParams();
  const [formData, setFormData] = useState({
    dateClaimed: new Date().toISOString().split('T')[0],
    userEmailID: '',
    staffName: '',
    studentID: ''
  });
  const [errors, setErrors] = useState({});
  const [submissionMessage, setSubmissionMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!formData.dateClaimed) {
      formErrors.dateClaimed = 'Date claimed is required';
      isValid = false;
    }
    if (!formData.userEmailID) {
      formErrors.userEmailID = 'User email is required';
      isValid = false;
    }
    if (!formData.staffName) {
      formErrors.staffName = 'Staff name is required';
      isValid = false;
    }
    if (!formData.studentID) {
      formErrors.studentID = 'Student ID is required';
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Submit release form data
      await axios.post('/submit-release-form', {
        ...formData,
        claimId
      });

      // Call endpoint to remove the request from CLAIMREQUETS table
      await axios.post(`/individual-request-staff/${claimId}/approve`);

      setSubmissionMessage('Release form submitted and claim approved successfully!');
      
      // Navigate to another page or refresh
      setTimeout(() => navigate('/all-request-staff'), 1500);
    } catch (error) {
      console.error('Error processing the request:', error);
      setSubmissionMessage('Failed to process the request. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Release Form</h2>
      {submissionMessage && <p className="submission-message">{submissionMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label>Date Claimed</label>
          <input
            type="date"
            name="dateClaimed"
            value={formData.dateClaimed}
            onChange={handleChange}
            required
          />
          {errors.dateClaimed && <p className="error-text">{errors.dateClaimed}</p>}
        </div>

        <div className="form-input">
          <label>User Email</label>
          <input
            type="email"
            name="userEmailID"
            value={formData.userEmailID}
            onChange={handleChange}
            placeholder="Enter user's email"
            required
          />
          {errors.userEmailID && <p className="error-text">{errors.userEmailID}</p>}
        </div>

        <div className="form-input">
          <label>Staff Name</label>
          <input
            type="text"
            name="staffName"
            value={formData.staffName}
            onChange={handleChange}
            placeholder="Enter staff name"
            required
          />
          {errors.staffName && <p className="error-text">{errors.staffName}</p>}
        </div>

        <div className="form-input">
          <label>Student ID</label>
          <input
            type="text"
            name="studentID"
            value={formData.studentID}
            onChange={handleChange}
            placeholder="Enter student ID"
            required
          />
          {errors.studentID && <p className="error-text">{errors.studentID}</p>}
        </div>

        <button type="submit" className="submit-button">Submit Release Form</button>
      </form>
    </div>
  );
};

export default ReleaseForm;
