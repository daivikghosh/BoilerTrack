import React, { useState } from "react";
import "./FilterPane.css";

function FilterPane({ onFilterChange }) {
  const [includePast, setIncludePast] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState([]);

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

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleAddKeyword = (e) => {
    if (
      e.key === "Enter" &&
      keyword.trim() !== "" &&
      !keywords.includes(keyword)
    ) {
      setKeywords([...keywords, keyword.trim()]);
      setKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter((kw) => kw !== keywordToRemove));
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

      {/* Keyword Search Bar */}
      <div className="filter-option">
        <h4>Search by Keywords</h4>
        <input
          type="text"
          placeholder="Add a keyword and press Enter"
          value={keyword}
          onChange={handleKeywordChange}
          onKeyDown={handleAddKeyword}
          style={{ width: "100%" }}
        />
        <div className="keyword-list">
          {keywords.map((kw) => (
            <span key={kw} className="keyword-tag">
              {kw} <button onClick={() => handleRemoveKeyword(kw)}>x</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterPane;
