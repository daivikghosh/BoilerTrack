import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ClaimRequestsPage.css";

function ClaimRequestsPage() {
  const [filter, setFilter] = useState({
    status: [], // Filter for claim status (e.g., pending, approved, denied)
    sortAlphabetically: false,
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);

  const fakeClaimRequests = [
    {
      ItemID: 1,
      ItemName: "Water Bottle",
      Status: "Pending",
      Description: "Claim request for a blue water bottle.",
      DateSubmitted: "2024-10-01",
      ImageURL: "",
    },
    {
      ItemID: 2,
      ItemName: "Laptop",
      Status: "Approved",
      Description: "Claim request for a Dell laptop.",
      DateSubmitted: "2024-10-02",
      ImageURL: "",
    },
    {
      ItemID: 3,
      ItemName: "Headphones",
      Status: "Denied",
      Description: "Claim request for red Sony headphones.",
      DateSubmitted: "2024-10-03",
      ImageURL: "",
    },
  ];

  // Fetch claim requests from the backend API
  useEffect(() => {
    const fetchClaimRequests = async () => {
      try {
        const response = await axios.get("/claim-requests");
        setItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error("Error fetching claim requests:", error);
        setItems(fakeClaimRequests);
        setFilteredItems(fakeClaimRequests);
      }
    };

    fetchClaimRequests();
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

  // Apply filters and search
  useEffect(() => {
    let nonPinnedItems = items.filter(
      (item) => !pinnedItems.includes(item.ItemID)
    );
    let pinned = items.filter((item) => pinnedItems.includes(item.ItemID));

    // Apply status filter to non-pinned items
    if (filter.status.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.status.includes(item.Status)
      );
    }

    // Apply search filter to non-pinned items
    if (search) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        item.ItemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort non-pinned items alphabetically if the checkbox is checked
    if (filter.sortAlphabetically) {
      nonPinnedItems.sort((a, b) => a.ItemName.localeCompare(b.ItemName));
    }

    // Combine pinned items (always at the top) with filtered non-pinned items
    setFilteredItems([...pinned, ...nonPinnedItems]);
  }, [filter, search, items, pinnedItems]);

  return (
    <div className="claim-requests-page">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="🔍 Search your claim requests"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="filter-container">
        <div className="status-filter">
          <label>
            <input
              type="checkbox"
              checked={filter.status.includes("Pending")}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.checked
                    ? [...filter.status, "Pending"]
                    : filter.status.filter((s) => s !== "Pending"),
                })
              }
            />
            Pending
          </label>
          <label>
            <input
              type="checkbox"
              checked={filter.status.includes("Approved")}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.checked
                    ? [...filter.status, "Approved"]
                    : filter.status.filter((s) => s !== "Approved"),
                })
              }
            />
            Approved
          </label>
          <label>
            <input
              type="checkbox"
              checked={filter.status.includes("Denied")}
              onChange={(e) =>
                handleFilterChange({
                  status: e.target.checked
                    ? [...filter.status, "Denied"]
                    : filter.status.filter((s) => s !== "Denied"),
                })
              }
            />
            Denied
          </label>
        </div>
      </div>

      <div className="main-content">
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
                <p>Status: {item.Status}</p>
                <button
                  className={`pin-button ${
                    pinnedItems.includes(item.ItemID) ? "pinned" : ""
                  }`}
                  onClick={() => handlePinItem(item.ItemID)}
                >
                  {pinnedItems.includes(item.ItemID) ? "Unpin" : "Pin"}
                </button>
                <Link to={`/item/${item.ItemID}`}>
                  <button className="view-button">View</button>
                </Link>
              </div>
            ))
          ) : (
            <p>No claim requests found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClaimRequestsPage;
