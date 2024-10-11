import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";

function AllItemsPage() {
  const [filter, setFilter] = useState({
    includePast: false,
    categories: [],
    keywords: [],
    sortAlphabetically: false,
    locations: [], // Added locations to filter state
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const fakeItems = [
    {
      ItemID: 1,
      ItemName: "Water Bottle",
      Color: "Blue",
      Brand: "Hydro Flask",
      LocationFound: "Library",
      LocationTurnedIn: "Reception",
      Description:
        "A blue stainless steel water bottle found near the library.",
      ImageURL: "", // Base64 image string if needed
    },
    {
      ItemID: 2,
      ItemName: "Laptop",
      Color: "Black",
      Brand: "Dell",
      LocationFound: "Study Hall",
      LocationTurnedIn: "Security Desk",
      Description: "Dell laptop with a black cover left in the study hall.",
      ImageURL: "",
    },
    {
      ItemID: 3,
      ItemName: "Headphones",
      Color: "Red",
      Brand: "Sony",
      LocationFound: "Gym",
      LocationTurnedIn: "Front Desk",
      Description: "Red Sony headphones found at the gym front desk.",
      ImageURL: "",
    },
    {
      ItemID: 4,
      ItemName: "Wallet",
      Color: "Black",
      Brand: "Gucci",
      LocationFound: "Cafeteria",
      LocationTurnedIn: "Lost and Found Office",
      Description: "Black leather wallet found near the cafeteria.",
      ImageURL: "",
    },
    {
      ItemID: 5,
      ItemName: "Laptop",
      Color: "Silver",
      Brand: "Apple",
      LocationFound: "Computer Lab",
      LocationTurnedIn: "IT Help Desk",
      Description: "MacBook Pro found in the computer lab.",
      ImageURL: "",
    },
    {
      ItemID: 6,
      ItemName: "Headphones",
      Color: "White",
      Brand: "Bose",
      LocationFound: "Library",
      LocationTurnedIn: "Library Desk",
      Description: "White Bose headphones left in the library.",
      ImageURL: "",
    },
    {
      ItemID: 7,
      ItemName: "Water Bottle",
      Color: "Green",
      Brand: "Nalgene",
      LocationFound: "Gym Locker Room",
      LocationTurnedIn: "Gym Front Desk",
      Description: "Plastic water bottle found in the gym locker room.",
      ImageURL: "",
    },
  ];

  // Fetch items from the backend API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/items");
        setItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems(fakeItems);
        setFilteredItems(fakeItems);
      }
    };

    fetchItems();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter({ ...filter, ...newFilter });
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

    // Apply location filter
    if (filter.locations && filter.locations.length > 0) {
      filtered = filtered.filter((item) =>
        filter.locations.includes(item.LocationFound)
      );
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter((item) =>
        item.ItemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply keyword filter
    if (filter.keywords && filter.keywords.length > 0) {
      filtered = filtered.filter((item) =>
        filter.keywords.some((keyword) =>
          item.Description.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Sort items alphabetically if the checkbox is checked
    if (filter.sortAlphabetically) {
      filtered.sort((a, b) => a.ItemName.localeCompare(b.ItemName));
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
