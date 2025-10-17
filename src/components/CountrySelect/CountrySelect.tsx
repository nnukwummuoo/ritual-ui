"use client";

import React, { useState } from "react";
import { countryList } from "../CountrySelect/countryList";


interface Props {
  onSelectCountry?: (country: string) => void;
}

const CountrySelect: React.FC<Props> = ({ onSelectCountry }) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const filteredCountries = countryList.filter((country) =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: string) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearch("");
    onSelectCountry?.(country);
  };

  return (
    <div style={{ position: "relative", width: "100%", textAlign: "left" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          cursor: "pointer",
          background: "transparent",
          borderRadius: "4px",
          color: selectedCountry ? "white" : "gray",
        }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedCountry || "Select a country"}
      </div>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#0c0f27",
            border: "1px solid #bec8fa",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          <input
            type="text"
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            name="country"
            style={{
              width: "95%",
              margin: "5px auto",
              padding: "8px",
              boxSizing: "border-box",
              borderBottom: "1px solid #ccc",
              color: "white",
            }}
          />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filteredCountries.map((country) => (
              <li
                key={country}
                onClick={() => handleSelect(country)}
                style={{
                  padding: "5px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  textAlign: "left",
                  color: "white",
                }}
              >
                {country}
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li style={{ padding: "8px", color: "#888" }}>
                No countries found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
