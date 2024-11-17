import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./FilterPane.css";

function FilterPane({ onFilterChange }) {
  const [includePast, setIncludePast] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  const [locationstatusToggle, setLocationToggle] = useState(false);

  const [sortOlderThanWeek, setSortOlderThanWeek] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]); // State for selected dates
  const dropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleIncludePastChange = () => {
    setIncludePast(!includePast);
    onFilterChange({
      includePast: !includePast,
      categories,
      keywords,
      sortAlphabetically,
      locations,
      dates: selectedDates,
    });
  };

  const handleCategoryChange = (category) => {
    const updatedCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setCategories(updatedCategories);
    onFilterChange({
      includePast,
      categories: updatedCategories,
      keywords,
      sortAlphabetically,
      locations,
      dates: selectedDates,
    });
  };

  const handleLocationChange = (location) => {
    const updatedLocations = locations.includes(location)
      ? locations.filter((l) => l !== location)
      : [...locations, location];
    setLocations(updatedLocations);
    onFilterChange({
      includePast,
      categories,
      keywords,
      sortAlphabetically,
      locations: updatedLocations,
      dates: selectedDates,
    });
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleAddKeyword = (e) => {
    if (
      e.key === "Enter" &&
      keyword.trim() !== "" &&
      !keywords.includes(keyword)
    ) {
      const updatedKeywords = [...keywords, keyword.trim()];
      setKeywords(updatedKeywords);
      setKeyword("");
      onFilterChange({
        includePast,
        categories,
        keywords: updatedKeywords,
        sortAlphabetically,
        locations,
        dates: selectedDates,
      });
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    const updatedKeywords = keywords.filter((kw) => kw !== keywordToRemove);
    setKeywords(updatedKeywords);
    onFilterChange({
      includePast,
      categories,
      keywords: updatedKeywords,
      sortAlphabetically,
      locations,
      dates: selectedDates,
    });
  };

  const handleWeekOlderChange = () => {
    setSortOlderThanWeek(!sortOlderThanWeek);
    onFilterChange({
      includePast,
      categories,
      keywords,
      sortAlphabetically,
      locations,
      dates: selectedDates,
      sortOlderThanWeek: !sortOlderThanWeek,
    });
  };

  const handleSortChange = () => {
    setSortAlphabetically(!sortAlphabetically);
    onFilterChange({
      includePast,
      categories,
      keywords,
      sortAlphabetically: !sortAlphabetically,
      locations,
      dates: selectedDates,
    });
  };

  const handleLocationToggleChange = () => {
    setLocationToggle(!locationstatusToggle);
    onFilterChange({
      includePast,
      categories,
      keywords,
      sortAlphabetically,
      locations,
      dates: selectedDates,
      locationstatusToggle: !locationstatusToggle, // Pass the toggle state
    });
  };

  const handleDateClick = (date) => {
    const dateString = date.toISOString().split("T")[0]; // Get date string in 'YYYY-MM-DD' format
    let updatedDates;
    if (selectedDates.includes(dateString)) {
      // Date is already selected, remove it
      updatedDates = selectedDates.filter((d) => d !== dateString);
    } else {
      // Add date to selectedDates
      updatedDates = [...selectedDates, dateString];
    }
    setSelectedDates(updatedDates);
    onFilterChange({
      includePast,
      categories,
      keywords,
      sortAlphabetically,
      locations,
      dates: updatedDates,
    });
  };

  return (
    <div className="filter-pane">
      <h3>Filters</h3>

      {/* Include past items */}
      <div className="filter-option">
        <label className="switch">
          <input
            type="checkbox"
            checked={includePast}
            onChange={handleIncludePastChange}
          />
          <span className="slider"></span>
        </label>
        <span>Include past items</span>
      </div>

      {/* Sort Alphabetically */}
      <div className="filter-option">
        <label className="switch">
          <input
            type="checkbox"
            checked={sortAlphabetically}
            onChange={handleSortChange}
          />
          <span className="slider"></span>
        </label>
        <span>Sort items alphabetically</span>
      </div>

      {/* New Location + Status Toggle */}
      <div className="filter-option">
        <label className="switch">
          <input
            type="checkbox"
            checked={locationstatusToggle}
            onChange={handleLocationToggleChange}
          />
          <span className="slider"></span>
        </label>
        <span>Item Status at your Location</span>
      </div>

      {/* Sort by Older than a Week*/}
      <div className="filter-option">
        <label className="switch">
          <input
            type="checkbox"
            checked={sortOlderThanWeek}
            onChange={handleWeekOlderChange}
          />
          <span className="slider"></span>
        </label>
        <span>Show only items older than 1 week</span>
      </div>

      {/* Keyword Search Bar */}
      <div className="filter-option">
        <h4>Search by Keywords</h4>
        <input
          type="text"
          placeholder="Add a keyword and press Enter"
          value={keyword}
          onChange={handleKeywordChange}
          onKeyDown={handleAddKeyword}
          style={{ width: "92%" }}
        />
        <div className="keyword-list">
          {keywords.map((kw) => (
            <span key={kw} className="keyword-tag">
              {kw} <button onClick={() => handleRemoveKeyword(kw)}>x</button>
            </span>
          ))}
        </div>
      </div>

      {/* Category Filters with Dropdown */}
      <div className="filter-option">
        <h4>Filter by Category</h4>
        <div className="dropdown" ref={dropdownRef}>
          <div
            className="dropdown-header"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {categories.length > 0
              ? categories.join(", ")
              : "Select Categories"}
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {["bottle", "laptop", "headphone", "wallet"].map((category) => (
                <div key={category} className="dropdown-item">
                  <input
                    type="checkbox"
                    id={category}
                    value={category}
                    checked={categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <label htmlFor={category}>{category}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location Filters with Dropdown */}
      <div className="filter-option">
        <h4>Filter by Location Found</h4>
        <div className="dropdown" ref={locationDropdownRef}>
          <div
            className="dropdown-header"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          >
            {locations.length > 0 ? locations.join(", ") : "Select Locations"}
          </div>
          {isLocationDropdownOpen && (
            <div className="dropdown-menu">
              {[
                "Library",
                "Study Hall",
                "Gym",
                "Cafeteria",
                "Computer Lab",
                "Gym Locker Room",
              ].map((location) => (
                <div key={location} className="dropdown-item">
                  <input
                    type="checkbox"
                    id={location}
                    value={location}
                    checked={locations.includes(location)}
                    onChange={() => handleLocationChange(location)}
                  />
                  <label htmlFor={location}>{location}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Filter with Calendar */}
      <div className="filter-option">
        <h4>Filter by Date Found</h4>
        <Calendar
          onClickDay={handleDateClick}
          tileClassName={({ date, view }) => {
            if (selectedDates.includes(date.toISOString().split("T")[0])) {
              return "selected-date";
            }
          }}
        />
      </div>
    </div>
  );
}

export default FilterPane;
