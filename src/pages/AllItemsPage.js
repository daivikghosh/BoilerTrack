import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";

function AllItemsPage() {
  const [filter, setFilter] = useState({
    includePast: false,
    categories: [], // Only filtering by categories now
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]); // Initially empty, no data yet
  const [filteredItems, setFilteredItems] = useState([]);

  // Fetch items from the backend API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/items"); // this needs to be /items, it cannot be the full path
        setItems(response.data);
        setFilteredItems(response.data); // Initially show all items
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...items];

    // Apply category filter (if categories are selected)
    if (filter.categories.length > 0) {
      filtered = filtered.filter((item) =>
        filter.categories.some((category) =>
          item.ItemName.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter((item) =>
        item.ItemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [filter, search, items]);

  return (
    <div className="all-items-page">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="🔍 Search for items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="main-content">
        <FilterPane onFilterChange={handleFilterChange} />

        <div className="items-container">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.ItemID} className="item-card">
                <img
                  src={`data:image/jpeg;base64,${item.ImageURL}`}
                  alt={item.ItemName}
                  className="item-image"
                />
                <h3>{item.ItemName}</h3>
                <p>{item.Description}</p>
                <Link to={`/item/${item.ItemID}`}>
                  <button className="view-button">View</button>
                </Link>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllItemsPage;
