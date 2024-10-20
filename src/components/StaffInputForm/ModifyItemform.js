import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StaffInputForm.css';

function ModifyItemForm() {
    const { id } = useParams();
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
    const [loading, setLoading] = useState(true);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                const response = await axios.get(`/item/${id}`);
                const itemData = response.data;
                setFormData({
                    itemName: itemData.ItemName,
                    color: itemData.Color,
                    brand: itemData.Brand,
                    foundAt: itemData.LocationFound,
                    turnedInAt: itemData.LocationTurnedIn,
                    description: itemData.Description,
                });
                setCurrentImage(itemData.Photo);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching item data:', error);
                setLoading(false);
            }
        };
    
        fetchItemData();
    }, [id]);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

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

        setErrors(formErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const data = new FormData();
        if (selectedFile) {
            data.append('image', selectedFile);
        }
        for (let key in formData) {
            data.append(key, formData[key]);
        }

        try {
            const response = await axios.put(`/item/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log(response.data);
            alert('Item updated successfully!');
            navigate('/all-items');
        } catch (error) {
            console.error('There was an error updating the item!', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="form-container">
            <h1>Modify Item</h1>
            <form onSubmit={handleSubmit}>
                <div className="file-upload">
                    <label htmlFor="image-upload" className="custom-file-upload">
                        <img src={process.env.PUBLIC_URL + '/uploadsymbol.webp'} alt="Upload Icon" />
                        <span>Choose New Image</span>
                    </label>
                    <input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
                    {selectedFile && <p>{selectedFile.name}</p>}
                    {!selectedFile && currentImage && (
    <div>
        <p>Current Image:</p>
        <img src={`data:image/jpeg;base64,${currentImage}`} alt="Current Item" style={{maxWidth: '200px'}} />
    </div>
)}
                </div>

                <div className="form-input">
                    <label>Item Name</label>
                    <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} required />
                    {errors.itemName && <p className="error-text">{errors.itemName}</p>}
                </div>

                <div className="form-input">
                    <label>Color</label>
                    <input type="text" name="color" value={formData.color} onChange={handleChange} />
                    {errors.color && <p className="error-text">{errors.color}</p>}
                </div>

                <div className="form-input">
                    <label>Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} />
                    {errors.brand && <p className="error-text">{errors.brand}</p>}
                </div>

                <div className="form-input">
                    <label>Found At</label>
                    <input type="text" name="foundAt" value={formData.foundAt} onChange={handleChange} />
                    {errors.foundAt && <p className="error-text">{errors.foundAt}</p>}
                </div>

                <div className="form-input">
                    <label>Turned In At</label>
                    <input type="text" name="turnedInAt" value={formData.turnedInAt} onChange={handleChange} />
                    {errors.turnedInAt && <p className="error-text">{errors.turnedInAt}</p>}
                </div>

                <div className="form-input">
                    <label>Description</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} />
                    {errors.description && <p className="error-text">{errors.description}</p>}
                </div>

                <button type="submit" className="upload-button">Update Item</button>
            </form>
        </div>
    );
}

export default ModifyItemForm;