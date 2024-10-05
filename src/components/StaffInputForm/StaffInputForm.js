import React, { useState } from 'react';
import axios from 'axios';
import './StaffInputForm.css';

function StaffInputForm() {
    const [formData, setFormData] = useState({
        itemName: '',
        color: '',
        brand: '',
        foundAt: '',
        turnedInAt: '',
        description: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('image', selectedFile);
        for (let key in formData) {
            data.append(key, formData[key]);
        }

        try {
            const response = await axios.post('http://localhost:5000/items', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log(response.data);
            alert('Item added successfully!');
            setFormData({ itemName: '', color: '', brand: '', foundAt: '', turnedInAt: '', description: '' });
            setSelectedFile(null);
        } catch (error) {
            console.error('There was an error adding the item!', error);
        }
    };

    return (
        <div className="form-container">
            <h1>Upload</h1>
            <form onSubmit={handleSubmit}>
                <div className="file-upload">
                    <label htmlFor="image-upload" className="custom-file-upload">
                        <img src={process.env.PUBLIC_URL + '/uploadsymbol.webp'} alt="Upload Icon" />
                        <span>Choose File</span>
                    </label>
                    <input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
                    {selectedFile && <p>{selectedFile.name}</p>}
                </div>

                <div className="form-input">
                    <label>Item Name</label>
                    <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="Enter item name" required />
                </div>

                <div className="form-input">
                    <label>Color</label>
                    <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Enter color" />
                </div>

                <div className="form-input">
                    <label>Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Enter brand" />
                </div>

                <div className="form-input">
                    <label>Found At</label>
                    <input type="text" name="foundAt" value={formData.foundAt} onChange={handleChange} placeholder="Enter found location" />
                </div>

                <div className="form-input">
                    <label>Turned In At</label>
                    <input type="text" name="turnedInAt" value={formData.turnedInAt} onChange={handleChange} placeholder="Enter where it was turned in" />
                </div>

                <div className="form-input">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter item description" />
                </div>

                <button type="submit" className="upload-button">Submit</button>
            </form>
        </div>
    );
}

export default StaffInputForm;
