import React, { useState } from 'react';
import axios from 'axios';
import './StaffInputForm.css';

function StaffInputForm() {
    const [formData, setFormData] = useState({
        description: '',
        size: '',
        color: '',
        shape: '',
        additional_notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:5000/items', formData)
            .then(response => {
                console.log(response.data);
                alert('Item added successfully!');
                setFormData({ description: '', size: '', color: '', shape: '', additional_notes: '' });
            })
            .catch(error => console.error('There was an error adding the item!', error));
    };

    return (
        <div>
            <h1>Add a Lost Item</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Description:</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div>
                    <label>Size:</label>
                    <input type="text" name="size" value={formData.size} onChange={handleChange} required />
                </div>
                <div>
                    <label>Color:</label>
                    <input type="text" name="color" value={formData.color} onChange={handleChange} required />
                </div>
                <div>
                    <label>Shape:</label>
                    <input type="text" name="shape" value={formData.shape} onChange={handleChange} required />
                </div>
                <div>
                    <label>Additional Notes:</label>
                    <textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} />
                </div>
                <button type="submit">Add Item</button>
            </form>
        </div>
    );
}

export default StaffInputForm;