export type CountryData = {
  flag: string;
  abbreviation: string;
  fifa: string;
};

export const getCountryData = async (countryName: string): Promise<CountryData | null> => {
  try {
    // Guard: ignore empty/short inputs
    const q = (countryName || "").trim();
    if (!q || q.length < 2) return null;

    const fields = "fields=flags,cca3,fifa";

    // Try lookup by country name first
    const byNameUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?${fields}`;
    let response = await fetch(byNameUrl);

    // If not found, try by capital (location might be a city)
    if (!response.ok) {
      const byCapitalUrl = `https://restcountries.com/v3.1/capital/${encodeURIComponent(q)}?${fields}`;
      response = await fetch(byCapitalUrl);
      if (!response.ok) return null;
    }

    const data = await response.json();
    const first = Array.isArray(data) ? data[0] : undefined;
    if (!first) return null;

    return {
      flag: first?.flags?.png || "",
      abbreviation: first?.cca3 || "",
      fifa: first?.fifa || "",
    };
  } catch (error) {
    console.error("Error fetching country data:", error);
    return null;
  }
};
