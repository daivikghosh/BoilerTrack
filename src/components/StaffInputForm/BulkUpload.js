import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './StaffInputForm.css';

function BulkUpload() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        itemName: '',
        color: '',
        brand: '',
        foundAt: '',
        turnedInAt: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});

    const handleFileChange = (event) => setSelectedFile(event.target.files[0]);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateForm = () => {
        let formErrors = {};
        let isValid = true;
        for (let key in formData) {
            if (!formData[key]) {
                formErrors[key] = 'This field is required';
                isValid = false;
            }
        }
        if (!selectedFile) {
            formErrors.image = 'An image file is required';
            isValid = false;
        }
        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData();
        data.append('image', selectedFile);
        for (let key in formData) {
            data.append(key, formData[key]);
        }

        try {
            const response = await axios.post('/items', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newItemId = response.data.ItemID; // Retrieve new item ID from response

            // Now check for a lost item match after adding the item
            const checkResponse = await axios.post('/check-lost-item-request', { ...formData, foundItemId: newItemId }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (checkResponse.data.matchFound) {
                alert(checkResponse.data.message);
            } else {
                alert(checkResponse.data.message);
            }

            // Reset form
            setFormData({ itemName: '', color: '', brand: '', foundAt: '', turnedInAt: '', description: '' });
            setSelectedFile(null);
            setErrors({});
            navigate('/all-items-staff');
        } catch (error) {
            console.error('Error processing the item!', error);
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
                        <span>Choose File</span>
                    </label>
                    <input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
                    {selectedFile && <p>{selectedFile.name}</p>}
                    {errors.image && <p className="error-text">{errors.image}</p>}
                </div>

                <div className="form-input">
                    <label>Turned In At</label>
                    <input type="text" name="turnedInAt" value={formData.turnedInAt} onChange={handleChange} placeholder="Enter where it was turned in" />
                    {errors.turnedInAt && <p className="error-text">{errors.turnedInAt}</p>}
                </div>

                <button type="submit" className="upload-button">Submit</button>
            </form>
        </div>
    );
}

export default BulkUpload;
