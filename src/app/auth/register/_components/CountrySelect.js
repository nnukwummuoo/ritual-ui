import React, { useState } from 'react';

export const countryList = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "DR Congo", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Republic of the Congo", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent",
  "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe"
];

const CountrySelect = ({ onSelectCountry }) => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const filteredCountries = countryList.filter(country =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearch("");
    if (onSelectCountry) onSelectCountry(country);
  };

  return (
    <div style={{ position: 'relative', width: '100%', textAlign: 'left' }}>
      <div 
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          cursor: 'pointer',
          background: 'transparent',
          borderRadius: '4px',
          color: 'gray'
        }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {selectedCountry || "Select a country"}
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#0c0f27',
          border: '1px solid #bec8fa',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10
        }}>
          <input
            type="text"
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '95%',
              margin: '5px auto',
              padding: '8px',
              boxSizing: 'border-box',
              borderBottom: '1px solid #ccc',
              color: 'white'
            }}
          />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filteredCountries.map((country) => (
              <li
                key={country}
                onClick={() => handleSelect(country)}
                style={{
                  padding: '5px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  textAlign: 'left',
                  color: 'white'
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
