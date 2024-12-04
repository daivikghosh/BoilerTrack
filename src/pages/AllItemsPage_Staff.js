import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";
import StaffItemTemplate from "../components/StaffItemTemplate/StaffItemTemplate";

function AllItemsPage() {
  const [filter, setFilter] = useState({
    sortAlphabetically: false,
    locations: [],
    locationsTurnedIn: [],
    dates: [],
    keywords: [],
    timeFilter: "all", // New time filter state
    filterDate: null, // Date reference for time-based filtering
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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
      ImageURL: "",
      DateFound: "2023-10-01",
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
      DateFound: "2023-10-02",
    },
    // Additional fake items...
  ];

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
    console.log("Filter change detected:", newFilter);
    setFilter((prevFilter) => ({ ...prevFilter, ...newFilter }));
  };

  const handlePinItem = (itemID) => {
    if (pinnedItems.includes(itemID)) {
      setPinnedItems(pinnedItems.filter((id) => id !== itemID)); // Unpin the item
    } else {
      setPinnedItems([...pinnedItems, itemID]); // Pin the item
    }
  };

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

    if (filter.locationsTurnedIn.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.locationsTurnedIn.includes(item.LocationTurnedIn),
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
      {/* Render StaffItemTemplate as a modal-like component */}
      {selectedItem && (
        <div className="overlay">
          <div className="modal">
            <StaffItemTemplate
              item={selectedItem}
              goBack={() => setSelectedItem(null)} // Clear selectedItem on back
            />
          </div>
        </div>
      )}

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
        <Link to="/StaffInputForm" className="page-button">
          Add New Item
        </Link>
        <Link to="/all-request-staff" className="page-button">
          All Claim Requests
        </Link>
        <Link to="/processed-claims" className="page-button">
          View Processed Claims
        </Link>
        <Link to="/AllFeedback" className="page-button">
          View Feedback
        </Link>
        <Link to="/unclaimed-item-template" className="page-button">
          Post weekly Update
        </Link>

        <Link to="/allitemhistory-staff" className="page-button">
          Item History Logs
        </Link>

        <Link to="/upload-qr-code" className="page-button">
          Scan Pre-registered QR code
        </Link>

        <Link to="/lost-items-staff" className="page-button">
          All Lost Item Requests
        </Link>
      </div>

      <div className="main-content">
        <FilterPane onFilterChange={handleFilterChange} />
        <div className="items-container">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.ItemID} className="item-card">
                <div
                  className={`item-status-badge ${
                    item.ItemStatus === 3 ? "claimed" : "unclaimed"
                  }`}
                >
                  {item.ItemStatus === 3 ? "Claimed" : "Unclaimed"}
                </div>
                <button
                  className={`pin-button ${
                    pinnedItems.includes(item.ItemID) ? "pinned" : ""
                  }`}
                  onClick={() => handlePinItem(item.ItemID)}
                >
                  {pinnedItems.includes(item.ItemID) ? "Unpin" : "Pin"}
                </button>
                <img
                  src={`data:image/jpeg;base64,${item.ImageURL}`}
                  alt={item.ItemName}
                  className="item-image"
                />
                <h3>{item.ItemName}</h3>
                <p>{item.Description}</p>
                <p>{item.LocationTurnedIn}</p>
                {/* <div className="keywords-container">
                  <span className="keyword">Tag1</span>
                  <span className="keyword">Tag2</span>
                </div> */}
                <div className="buttons-container-2">
                  <Link to={`/item/${item.ItemID}`}>
                    <button className="button view-button">View</button>
                  </Link>
                  <Link to={`/modify-item/${item.ItemID}`}>
                    <button className="button modify-button">Modify</button>
                  </Link>
                  <Link
                    to={`/template/${item.ItemID}`}
                    state={{ item }} // Pass the item as state
                    className="button generate-template-button"
                  >
                    Template
                  </Link>
                </div>
                <div className="buttons-container-2"></div>
                <Link to={`/staff-messages/${item.ItemID}`}>
                  <button className="button modify-button">
                    Check Dispute Messages
                  </button>
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
