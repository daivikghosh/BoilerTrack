import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './StaffInputForm.css';

function BulkUpload() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        turnedInAt: '',
        description: 'bottle', // Default to the first dropdown value
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [errors, setErrors] = useState({});

    const handleFileChange = (event) => {
        setSelectedFiles([...event.target.files]);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateForm = () => {
        let formErrors = {};
        let isValid = true;

        if (!formData.turnedInAt) {
            formErrors.turnedInAt = 'This field is required';
            isValid = false;
        }

        if (selectedFiles.length === 0) {
            formErrors.image = 'At least one image file is required';
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Loop through all selected files and submit each one
        try {
            for (let file of selectedFiles) {
                const data = new FormData();
                data.append('image', file);
                data.append('turnedInAt', formData.turnedInAt);
                data.append('description', formData.description);
                data.append('itemName', formData.description);
                data.append('color', 'N/A');
                data.append('brand', 'N/A');
                data.append('foundAt', 'N/A');
                data.append('archived', 0);
                data.append('itemStatus', 1);

                await axios.post('/items', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            alert('Items uploaded successfully!');
            setFormData({ turnedInAt: '', description: 'bottle' });
            setSelectedFiles([]);
            setErrors({});
            navigate('/all-items-staff');
        } catch (error) {
            console.error('Error processing the items!', error);
        }
    };

    return (
        <div className="form-container">
            <h1>Bulk Upload</h1>
            <Link to={`/StaffInputForm`}>
                <button className="regular-upload-button">Regular Upload</button>
            </Link>
            <form onSubmit={handleSubmit}>
                <div className="file-upload">
                    <label htmlFor="image-upload" className="custom-file-upload">
                        <img src={process.env.PUBLIC_URL + '/uploadsymbol.webp'} alt="Upload Icon" />
                        <span>Choose Files</span>
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                    />
                    {selectedFiles.length > 0 && (
                        <p>{selectedFiles.map((file) => file.name).join(', ')}</p>
                    )}
                    {errors.image && <p className="error-text">{errors.image}</p>}
                </div>

                <div className="form-input">
                    <label>Item Type</label>
                    <select
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    >
                        <option value="bottle">Bottle</option>
                        <option value="laptop">Laptop</option>
                        <option value="headphone">Headphone</option>
                        <option value="wallet">Wallet</option>
                    </select>
                </div>

                <div className="form-input">
                    <label>Turned In At</label>
                    <input
                        type="text"
                        name="turnedInAt"
                        value={formData.turnedInAt}
                        onChange={handleChange}
                        placeholder="Enter where it was turned in"
                    />
                    {errors.turnedInAt && <p className="error-text">{errors.turnedInAt}</p>}
                </div>

                <button type="submit" className="upload-button">Submit</button>
            </form>
        </div>
    );
}

export default BulkUpload;
