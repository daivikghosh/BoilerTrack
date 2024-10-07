import React, { useState } from "react";

function FilterPane({ onFilterChange }) {
  const [includePast, setIncludePast] = useState(false);
  const [categories, setCategories] = useState([]); // Only categories

  const handleIncludePastChange = () => {
    setIncludePast(!includePast);
    onFilterChange({ includePast: !includePast, categories });
  };

  const handleCategoryChange = (category) => {
    const updatedCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setCategories(updatedCategories);
    onFilterChange({ includePast, categories: updatedCategories });
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

      {/* Category Filters */}
      <div className="filter-option">
        <h4>Filter by Category</h4>
        {["bottle", "laptop", "headphone", "wallet"].map((category) => (
          <div key={category}>
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
    </div>
  );
}

export default FilterPane;