export type Range = "24h" | "7d" | "30d" | "all";

export const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export type AggEntry = { value: string; count: number };