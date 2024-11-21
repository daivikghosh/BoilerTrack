import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import building_codes from "../../buildingdata";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css"; // Add custom CSS for styling
import axios from "axios";

// Fix missing marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapView = () => {
  const centerPosition = [40.4237, -86.9212]; // Purdue University coordinates
  const [foundItems, setFoundItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Buildings");

  // Fetch data from the backend
  useEffect(() => {
    fetch("http://localhost:5000/found-items")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Items:", data); // Print response to the console
        setFoundItems(data);
      })
      .catch((error) => console.error("Error fetching found items:", error));
  }, []);

  // Group items by building code
  const itemsByBuilding = foundItems.reduce((acc, item) => {
    const buildingCode = item.LocationTurnedIn;
    const building = building_codes[buildingCode];
    if (building && building.coordinates.lat && building.coordinates.lng) {
      if (!acc[buildingCode]) {
        acc[buildingCode] = [];
      }
      acc[buildingCode].push(item);
    }
    return acc;
  }, {});

  // Filtered results based on active tab
  const filteredResults =
    activeTab === "Buildings"
      ? Object.entries(itemsByBuilding).filter(([code, items]) => {
          const buildingName = building_codes[code]?.name || "";
          return buildingName.toLowerCase().includes(searchQuery.toLowerCase());
        })
      : foundItems.filter((item) =>
          item.ItemName.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <div className="map-container">
      <div className="side-pane">
        <h2>Buildings with Pinned Items</h2>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "Buildings" ? "active" : ""}`}
            onClick={() => setActiveTab("Buildings")}
          >
            Buildings
          </button>
          <button
            className={`tab ${activeTab === "Items" ? "active" : ""}`}
            onClick={() => setActiveTab("Items")}
          >
            Items
          </button>
        </div>

        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {activeTab === "Buildings" ? (
          <ul>
            {filteredResults.length > 0 ? (
              filteredResults.map(([code, items]) => (
                <li key={code}>
                  <strong>{building_codes[code].name}</strong>
                  <ul>
                    {items.map((item) => (
                      <li key={item.ItemID}>
                        <a
                          href={`/item-view-student/${item.ItemID}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.ItemName} - {item.Color}{" "}
                          {item.Brand ? `(${item.Brand})` : ""}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            ) : (
              <li>No buildings found.</li>
            )}
          </ul>
        ) : (
          <ul>
            {filteredResults.length > 0 ? (
              filteredResults.map((item) => (
                <li key={item.ItemID}>
                  <strong>{building_codes[item.LocationTurnedIn]?.name}</strong>
                  <ul>
                    <li>
                      <a
                        href={`/item-view-student/${item.ItemID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.ItemName} - {item.Color}{" "}
                        {item.Brand ? `(${item.Brand})` : ""}
                      </a>
                    </li>
                  </ul>
                </li>
              ))
            ) : (
              <li>No items found.</li>
            )}
          </ul>
        )}
      </div>

      <MapContainer
        center={centerPosition}
        zoom={15}
        style={{ height: "100vh", width: "100%" }}
        className="map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Display markers for buildings with valid coordinates and items */}
        {Object.entries(itemsByBuilding).map(([code, items], index) => {
          const building = building_codes[code];
          return (
            <Marker
              key={index}
              position={[building.coordinates.lat, building.coordinates.lng]}
            >
              <Popup>
                <strong>{building.name}</strong>
                <ul>
                  {items.map((item) => (
                    <li key={item.ItemID}>
                      <a
                        href={`/item-view-student/${item.ItemID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.ItemName} - {item.Color}{" "}
                        {item.Brand ? `(${item.Brand})` : ""}
                      </a>
                    </li>
                  ))}
                </ul>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
