export type CountryData = {
  flag: string;
  abbreviation: string;
  fifa: string;
};

export const getCountryData = async (countryName: string): Promise<CountryData | null> => {
  const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.warn(`Country not found: ${countryName}`);
      return null;
    }

    const data = await response.json();

    return {
      flag: data[0]?.flags?.png || "",
      abbreviation: data[0]?.cca3 || "",
      fifa: data[0]?.fifa || "",
    };
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
};
