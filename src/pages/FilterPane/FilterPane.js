import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./FilterPane.css";
import building_codes from "../../buildingdata"; // Assuming this file contains building codes and names

function FilterPane({ onFilterChange }) {
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedDates, setSelectedDates] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [locations, setLocations] = useState([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Handle sorting toggle
  const handleSortToggle = () => {
    const newState = !sortAlphabetically;
    setSortAlphabetically(newState);
    onFilterChange({ sortAlphabetically: newState });
  };

  // Handle time filter selection
  const handleTimeFilterChange = (e) => {
    const selected = e.target.value;
    setTimeFilter(selected);
    const filterDate = new Date();
    switch (selected) {
      case "24hrs":
        filterDate.setDate(filterDate.getDate() - 1);
        break;
      case "week":
        filterDate.setDate(filterDate.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(filterDate.getMonth() - 1);
        break;
      default:
        filterDate.setTime(0); // All Time
    }
    onFilterChange({ timeFilter: selected, filterDate });
  };

  // Handle date selection from calendar
  const handleDateChange = (range) => {
    if (range && range.length === 2) {
      // Ensure start and end dates are selected
      const formattedDates = range.map(
        (date) => date.toISOString().split("T")[0],
      ); // Format to 'YYYY-MM-DD'
      setSelectedDates(formattedDates); // Update local state
      onFilterChange({ dates: formattedDates }); // Pass to parent
    } else {
      setSelectedDates([]);
      onFilterChange({ dates: [] }); // Clear date filter in parent
    }
  };

  // Handle keyword input and addition
  const handleKeywordInput = (e) => {
    setKeywordInput(e.target.value);
  };

  const handleAddKeyword = (e) => {
    if (
      e.key === "Enter" &&
      keywordInput.trim() !== "" &&
      !keywords.includes(keywordInput)
    ) {
      const updatedKeywords = [...keywords, keywordInput.trim()];
      setKeywords(updatedKeywords);
      setKeywordInput("");
      onFilterChange({ keywords: updatedKeywords });
    }
  };

  const handleRemoveKeyword = (keyword) => {
    const updatedKeywords = keywords.filter((kw) => kw !== keyword);
    setKeywords(updatedKeywords);
    onFilterChange({ keywords: updatedKeywords });
  };

  // Handle location filter
  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };
  const handleAddLocation = (locationCode) => {
    if (!locations.includes(locationCode)) {
      const updatedLocations = [...locations, locationCode];
      setLocations(updatedLocations);
      onFilterChange({ locations: updatedLocations });
    }
    setIsLocationDropdownOpen(false); // Close dropdown after selection
  };

  const handleLocationToggle = (location) => {
    if (!locations.includes(locationCode)) {
      const updatedLocations = [...locations, locationCode];
      setLocations(updatedLocations);
      onFilterChange({ locations: updatedLocations });
    }
    setIsLocationDropdownOpen(false); // Close dropdown after selection
  };

  const handleRemoveLocation = (locationCode) => {
    const updatedLocations = locations.filter((code) => code !== locationCode);
    setLocations(updatedLocations);
    onFilterChange({ locations: updatedLocations });
  };

  return (
    <div className="filter-pane">
      <h3>Filters</h3>

      {/* Sort Alphabetically */}
      <div className="filter-option">
        <label className="switch">
          <input
            type="checkbox"
            checked={sortAlphabetically}
            onChange={handleSortToggle}
          />
          <span className="slider"></span>
        </label>
        <span>Sort Alphabetically</span>
      </div>

      {/* Time Filter */}
      <div className="filter-option">
        <h4>Show Items Turned In-</h4>
        <select value={timeFilter} onChange={handleTimeFilterChange}>
          <option value="24hrs">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div className="filter-option">
        <h4>Select Date Range</h4>
        <Calendar
          selectRange
          onChange={(range) =>
            handleDateChange(range instanceof Array ? range : [range])
          }
        />
      </div>

      {/* Keywords */}
      <div className="filter-option">
        <h4>Search by Keywords</h4>
        <input
          type="text"
          placeholder="Add a keyword and press Enter"
          value={keywordInput}
          onChange={handleKeywordInput}
          onKeyDown={handleAddKeyword}
        />
        <div className="keyword-list">
          {keywords.map((kw) => (
            <span key={kw} className="keyword-tag">
              {kw} <button onClick={() => handleRemoveKeyword(kw)}>x</button>
            </span>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div className="filter-option">
        <h4>Filter by Location</h4>
        <div className="dropdown">
          <button className="dropdown-toggle" onClick={toggleLocationDropdown}>
            {locations.length > 0
              ? "Select another location"
              : "Select Location"}
          </button>
          {isLocationDropdownOpen && (
            <div className="dropdown-menu">
              {Object.entries(building_codes).map(([code, building]) => (
                <div
                  key={code}
                  className="dropdown-item"
                  onClick={() => handleAddLocation(code)}
                >
                  {building.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="location-list">
          {locations.map((code) => (
            <span key={code} className="location-tag">
              {code}
              <button onClick={() => handleRemoveLocation(code)}>x</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterPane;
