import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FilterPane from "./FilterPane/FilterPane.js";
import "./AllItemsPage.css";
import StaffItemTemplate from "../components/StaffItemTemplate/StaffItemTemplate";

function AllItemsPage() {
  const [filter, setFilter] = useState({
    includePast: false,
    categories: [],
    keywords: [],
    sortAlphabetically: false,
    locations: [],
    dates: [],
    locationstatusToggle: false,
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const staffLocation = "hicKs";

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
    setFilter({ ...filter, ...newFilter });
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

    if (filter.categories.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.categories.some((category) =>
          item.ItemName.toLowerCase().includes(category.toLowerCase()),
        ),
      );
    }

    if (filter.locationstatusToggle) {
      nonPinnedItems = nonPinnedItems.filter(
        (item) =>
          item.LocationTurnedIn.toLowerCase() === staffLocation.toLowerCase(),
      );
    }

    if (filter.locations && filter.locations.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.locations.includes(item.LocationFound),
      );
    }

    if (filter.sortOlderThanWeek) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      nonPinnedItems = nonPinnedItems.filter((item) => {
        const itemDate = new Date(item.DateFound);
        return itemDate < oneWeekAgo;
      });
    }

    if (search) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        item.ItemName.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filter.keywords && filter.keywords.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.keywords.some((keyword) =>
          item.Description.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );
    }

    if (filter.sortAlphabetically) {
      nonPinnedItems.sort((a, b) => a.ItemName.localeCompare(b.ItemName));
    }

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
          Share to Instagram
        </Link>

        <Link to="/allitemhistory-staff" className="page-button">
          Item History Logs
        </Link>

        <Link to="/upload-qr-code" className="page-button">
          Scan Pre-registered QR code
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
                    item.ItemStatus === 1 ? "unclaimed" : "claimed"
                  }`}
                >
                  {item.ItemStatus === 1 ? "Unclaimed" : "Claimed"}
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
                <div className="keywords-container">
                  <span className="keyword">Tag1</span>
                  <span className="keyword">Tag2</span>
                </div>
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
                  <Link to={`/messages/${item.ItemID}`}>
                      <button className="button modify-button">Check Dispute Messages</button>
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
