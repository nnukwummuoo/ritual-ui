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

export function formatTourLabel(state: string, countryCode: string, startDate: string | Date, endDate: string | Date): string {
  return `${state}, ${countryCode}. ${formatTourDateRange(startDate, endDate)}`;
}