import React, { useState } from "react";

function FilterPane({ onFilterChange }) {
  const [includePast, setIncludePast] = useState(false);
  const [claimStatus, setClaimStatus] = useState("all");
  const [colors, setColors] = useState([]);

  const handleIncludePastChange = () => {
    setIncludePast(!includePast);
    onFilterChange({ includePast: !includePast, claimStatus, colors });
  };

  const handleClaimStatusChange = (status) => {
    setClaimStatus(status);
    onFilterChange({ includePast, claimStatus: status, colors });
  };

  const handleColorChange = (color) => {
    const updatedColors = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    setColors(updatedColors);
    onFilterChange({ includePast, claimStatus, colors: updatedColors });
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

      {/* Claim Status Filter */}
      <div className="filter-option">
        <h4>Claim Status</h4>
        <div>
          <input
            type="radio"
            name="claim-status"
            id="all-status"
            checked={claimStatus === "all"}
            onChange={() => handleClaimStatusChange("all")}
          />
          <label htmlFor="all-status">All</label>
        </div>
        <div>
          <input
            type="radio"
            name="claim-status"
            id="claimed-status"
            checked={claimStatus === "claimed"}
            onChange={() => handleClaimStatusChange("claimed")}
          />
          <label htmlFor="claimed-status">Claimed</label>
        </div>
        <div>
          <input
            type="radio"
            name="claim-status"
            id="unclaimed-status"
            checked={claimStatus === "unclaimed"}
            onChange={() => handleClaimStatusChange("unclaimed")}
          />
          <label htmlFor="unclaimed-status">Unclaimed</label>
        </div>
      </div>

      {/* Color Filters */}
      <div className="filter-option">
        <h4>Filter by Color</h4>
        {["red", "orange", "yellow", "green", "blue"].map((color) => (
          <div key={color}>
            <input
              type="checkbox"
              id={color}
              value={color}
              checked={colors.includes(color)}
              onChange={() => handleColorChange(color)}
            />
            <label htmlFor={color}>{color}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FilterPane;
