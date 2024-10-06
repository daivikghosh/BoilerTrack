import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";

// Simulating a fake GET request data in the correct format from your database
const fakeItemsFromDB = [
  {
    id: 1,
    description: "Lost Wallet",
    size: "Small",
    color: "Black",
    shape: "Rectangle",
    additional_notes: "Found near library",
    status: "available",
  },
  {
    id: 2,
    description: "Lost Keychain",
    size: "Small",
    color: "Blue",
    shape: "Round",
    additional_notes: "Found near gym",
    status: "claimed",
  },
  // more items...
];

function AllItemsPage() {
  const [filter, setFilter] = useState({
    includePast: false,
    claimStatus: "all",
    colors: [],
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]); // Initially empty, no data yet
  const [filteredItems, setFilteredItems] = useState([]);

  // Simulate fetching items from a database
  useEffect(() => {
    setItems(fakeItemsFromDB);
    setFilteredItems(fakeItemsFromDB);
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...items];

    if (filter.claimStatus !== "all") {
      filtered = filtered.filter((item) =>
        filter.claimStatus === "claimed"
          ? item.status === "claimed"
          : item.status === "available"
      );
    }

    if (filter.colors.length > 0) {
      filtered = filtered.filter((item) =>
        filter.colors.some(
          (color) => item.color.toLowerCase() === color.toLowerCase()
        )
      );
    }

    if (search) {
      filtered = filtered.filter((item) =>
        item.description.toLowerCase().includes(search.toLowerCase())
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
              <div key={item.id} className="item-card">
                <img
                  src={`https://via.placeholder.com/150?text=${item.description}`}
                  alt={item.description}
                  className="item-image"
                />
                <h3>{item.description}</h3>
                <p>{item.additional_notes}</p>
                {/* Pass item.id in the URL */}
                <Link to={`/item-view/${item.id}`}>
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
