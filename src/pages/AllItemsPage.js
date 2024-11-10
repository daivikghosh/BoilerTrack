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
    locations: [],
    dates: [], // Added dates to filter state
  });
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]); // New state for pinned items
  const [userEmail, setUserEmail] = useState(""); // Add state to store user email

  // Fetch user email from the backend
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get("/get-user-email");
        setUserEmail(response.data.user_email);
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    fetchUserEmail();
  }, []);

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
      DateFound: "2024-10-01",
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
      DateFound: "2024-10-02",
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
      DateFound: "2024-10-03",
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
      DateFound: "2024-10-04",
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
      DateFound: "2024-10-05",
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
      DateFound: "2024-10-06",
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
      DateFound: "2024-10-07",
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

    // Apply category filter to non-pinned items
    if (filter.categories.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.categories.some((category) =>
          item.ItemName.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    // Apply location filter
    if (filter.locations && filter.locations.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.locations.includes(item.LocationFound)
      );
    }

    // Apply date filter to non-pinned items
    if (filter.dates && filter.dates.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.dates.includes(item.Date)
      );
    }

    // Apply search filter to non-pinned items
    if (search) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        item.ItemName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply keyword filter to non-pinned items
    if (filter.keywords && filter.keywords.length > 0) {
      nonPinnedItems = nonPinnedItems.filter((item) =>
        filter.keywords.some((keyword) =>
          item.Description.toLowerCase().includes(keyword.toLowerCase())
        )
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
    <div className="all-items-page">
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="🔍 Search for items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />

        <Link to="/all-lost-item-requests">
          <button className="view-requests-button">
            View Your Lost Item Requests
          </button>
        </Link>

        <Link to={`/allclaim-requests-student/${userEmail}`}>
          <button className="view-claims-button">
            View Your Claim Requests
          </button>
        </Link>

        <Link to="/FeedbackForm">
          <button className="feedback-button">
            Leave Feedback
          </button>
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
                <Link to={`/item-view-student/${item.ItemID}`}>
                  <button className="view-button">View</button>
                </Link>
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