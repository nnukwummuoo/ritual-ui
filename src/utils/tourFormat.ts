export function formatTourDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  const sameYear = startYear === endYear;

  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });

  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

export function formatTourLabel(city: string, stateCode: string, countryCode: string, startDate: string | Date, endDate: string | Date): string {
  const locationParts = [city, stateCode, countryCode].filter(Boolean);
  return `${locationParts.join(", ")}. ${formatTourDateRange(startDate, endDate)}`;
}