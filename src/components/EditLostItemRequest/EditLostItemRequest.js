import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./EditLostItemRequest.css";

function EditLostItemRequest() {
  const { itemId } = useParams(); // Get the item ID from the route params
  const [item, setItem] = useState(null);
  const [updatedItem, setUpdatedItem] = useState({
    itemName: "",
    description: "",
    dateLost: "",
    locationLost: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the lost item data from the server
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/lost-item/${itemId}`); // Change PUT to GET
        setItem(response.data);
        setUpdatedItem({
          itemName: response.data.ItemName,
          description: response.data.Description,
          dateLost: response.data.DateLost,
          locationLost: response.data.LocationLost,
        });
      } catch (error) {
        console.error("Error fetching item data", error);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the updated item data to the backend
      await axios.put(`/lost-item/${itemId}`, updatedItem);
      // Redirect the user back to the list after a successful update
      navigate("/all-lost-item-requests");
    } catch (error) {
      console.error("Error updating item", error);
    }
  };

  if (!item) {
    return <p>Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Lost Item Request</h2>
      <label>
        Item Name:
        <input
          type="text"
          name="itemName"
          value={updatedItem.itemName}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={updatedItem.description}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Date Lost:
        <input
          type="date"
          name="dateLost"
          value={updatedItem.dateLost}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Location Lost:
        <input
          type="text"
          name="locationLost"
          value={updatedItem.locationLost}
          onChange={handleInputChange}
        />
      </label>
      <button type="submit">Update Item</button>
    </form>
  );
}

export default EditLostItemRequest;
