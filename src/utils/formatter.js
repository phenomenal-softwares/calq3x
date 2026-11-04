const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 10,
  useGrouping: true,
});

const scientificFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 10,
  notation: "scientific",
});

export function formatResult(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError("Only finite real numbers can be formatted.");
  }

  if (Object.is(value, -0) || value === 0) return "0";
  const magnitude = Math.abs(value);

  return magnitude >= 1e15 || magnitude < 1e-7
    ? scientificFormatter.format(value)
    : formatter.format(value);
}
