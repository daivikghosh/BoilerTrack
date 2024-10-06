import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";

//test data
const fakeItemsFromDB = [
  {
    ItemID: 1,
    ItemName: "Samsung Phone",
    Color: "Black",
    Brand: "Samsung A24",
    LocationFound: "WALC Printing Station",
    Description: "Android phone, pink wallpaper, three cameras",
    Photo: "https://via.placeholder.com/150?text=Samsung+Phone",
  },
  {
    ItemID: 2,
    ItemName: "Apple Watch",
    Color: "White",
    Brand: "Apple",
    LocationFound: "PMU food court",
    Description: "Watch, white band",
    Photo: "https://via.placeholder.com/150?text=Apple+Watch",
  },
  {
    ItemID: 3,
    ItemName: "Lenovo ThinkPad",
    Color: "Black",
    Brand: "Lenovo",
    LocationFound: "Earhart Dining Court",
    Description: "Laptop, blue sticker, Purdue sticker",
    Photo: "https://via.placeholder.com/150?text=Lenovo+ThinkPad",
  },
  {
    ItemID: 4,
    ItemName: "Wallet",
    Color: "White",
    Brand: "MK",
    LocationFound: "Earhart Dining Court",
    Description: "Leather, blue keychain",
    Photo: "https://via.placeholder.com/150?text=Wallet",
  },
  {
    ItemID: 5,
    ItemName: "Keychain",
    Color: "pink",
    Brand: "unknown",
    LocationFound: "Earhart Dining Court",
    Description: "airtag",
    Photo: "https://via.placeholder.com/150?text=Keychain",
  },
];

function AllItemsPage() {
  const [filter, setFilter] = useState({
    includePast: false,
    categories: [], // Only filtering by categories now
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]); // Initially empty, no data yet
  const [filteredItems, setFilteredItems] = useState([]);

  // Simulate fetching items from a database
  useEffect(() => {
    setItems(fakeItemsFromDB);
    setFilteredItems(fakeItemsFromDB); // Initially show all items
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
                  src={item.Photo}
                  alt={item.ItemName}
                  className="item-image"
                />
                <h3>{item.ItemName}</h3>
                <p>{item.Description}</p>
                <Link to={`/item-view/${item.ItemID}`}>
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
