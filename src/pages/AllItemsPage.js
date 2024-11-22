import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";

function AllItemsPage() {
  const [filter, setFilter] = useState({
    sortAlphabetically: false,
    locations: [],
    dates: [],
    keywords: [],
    timeFilter: "all", // New time filter state
    filterDate: null, // Date reference for time-based filtering
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);

  // Fetch items from the backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/items");
        setItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setItems(fakeItems); // Use fake items as fallback
        setFilteredItems(fakeItems);
      }
    };
    fetchItems();
  }, []);

  const fakeItems = [
    {
      ItemID: 1,
      ItemName: "Water Bottle",
      Color: "Blue",
      LocationFound: "Library",
      DateFound: "2024-10-01",
      Description: "A blue stainless steel water bottle.",
      ImageURL: "",
    },
    {
      ItemID: 2,
      ItemName: "Laptop",
      Color: "Black",
      LocationFound: "Study Hall",
      DateFound: "2024-10-02",
      Description: "A Dell laptop left in the study hall.",
      ImageURL: "",
    },
    // Add more fake items if needed
  ];

  const handleFilterChange = (newFilter) => {
    console.log("Filter change detected:", newFilter);
    setFilter((prevFilter) => ({ ...prevFilter, ...newFilter }));
  };

  const handlePinItem = (itemID) => {
    if (pinnedItems.includes(itemID)) {
      setPinnedItems(pinnedItems.filter((id) => id !== itemID));
    } else {
      setPinnedItems([...pinnedItems, itemID]);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let nonPinnedItems = items.filter(
      (item) => !pinnedItems.includes(item.ItemID),
    );
    let pinned = items.filter((item) => pinnedItems.includes(item.ItemID));

    // Apply "Items Older Than" filter
    if (filter.timeFilter && filter.timeFilter !== "all") {
      nonPinnedItems = nonPinnedItems.filter((item) => {
        const itemDate = new Date(item.Date); // Parse item date
        const filterDate = new Date(filter.filterDate); // Parse filter date
        if (isNaN(itemDate.getTime())) {
          console.warn(
            `Invalid DateFound for item: ${item.ItemID}`,
            item.DateFound,
          );
          return false; // Exclude items with invalid dates
        }
        return itemDate >= filterDate;
      });
    }

    // Apply location filter
    if (filter.locations.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.locations.includes(item.LocationFound),
      );
    }

    // Apply date range filter
    if (filter.dates.length === 2) {
      const [startDate, endDate] = filter.dates.map((date) => new Date(date)); // Convert to Date objects
      nonPinnedItems = nonPinnedItems.filter((item) => {
        const itemDate = new Date(item.Date); // Ensure item.DateFound is used correctly
        return itemDate >= startDate && itemDate <= endDate; // Check if within range
      });
    }

    // Apply keyword filter
    if (filter.keywords.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.keywords.some(
          (keyword) =>
            item.ItemName.toLowerCase().includes(keyword.toLowerCase()) ||
            item.Description.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );
    }

    // Apply search filter
    if (search) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        item.ItemName.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply alphabetical sorting
    if (filter.sortAlphabetically) {
      nonPinnedItems.sort((a, b) => a.ItemName.localeCompare(b.ItemName));
    }

    // Combine pinned items with filtered non-pinned items
    setFilteredItems([...pinned, ...nonPinnedItems]);
  }, [filter, search, items, pinnedItems]);

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

      <div className="button-container">
        <Link to="/all-lost-item-requests" className="page-button">
          View Your Lost Item Requests
        </Link>
        <Link to="/help-desk" className="page-button">
          Help Desk
        </Link>
        <Link to="/map-view" className="page-button">
          View Map
        </Link>
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
                <button
                  className={`pin-button ${
                    pinnedItems.includes(item.ItemID) ? "pinned" : ""
                  }`}
                  onClick={() => handlePinItem(item.ItemID)}
                >
                  {pinnedItems.includes(item.ItemID) ? "Unpin" : "Pin"}
                </button>
                <div className="buttons-container">
                  <Link to={`/item-view-student/${item.ItemID}`}>
                    <button className="button view-button">View</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>

      <div className="lost-item-request-container">
        <Link to="/report-lost-item">
          <button className="lost-item-request-button">
            Can't find your item? Put in a lost item request
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AllItemsPage;
