export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDistance(distanceKm: number | null): string {
  if (distanceKm === null) return "Distance unavailable";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}

export function formatBudget(min: number, max: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  });
  return `₹${formatter.format(min)}–₹${formatter.format(max)}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}

export function formatDuration(hours: number): string {
  if (hours === 1) return "1 hour";
  return `${hours} hours`;
}

export function priceLevelLabel(level: number): string {
  if (level <= 1) return "Budget-friendly";
  if (level === 2) return "Moderate";
  if (level === 3) return "Premium";
  return "Luxury";
}
