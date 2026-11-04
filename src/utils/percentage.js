function parseInput(value, label) {
  if (value === "" || value === null || value === undefined) {
    throw new Error(`Enter ${label}.`);
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label} must be a valid number.`);
  return number;
}

export function calculatePercentage(type, firstInput, secondInput) {
  const first = parseInput(firstInput, "a value");
  const second = parseInput(secondInput, "a percentage or comparison value");

  switch (type) {
    case "of":
      return first * (second / 100);
    case "increase":
      return first * (1 + second / 100);
    case "decrease":
      return first * (1 - second / 100);
    case "change": {
      if (first === 0) throw new Error("Percentage change is undefined when the original value is zero.");
      return ((second - first) / Math.abs(first)) * 100;
    }
    case "what-percent":
      if (second === 0) throw new Error("The comparison value cannot be zero.");
      return (first / second) * 100;
    case "original-increase":
      if (second === -100) throw new Error("A 100% decrease cannot be reversed.");
      return first / (1 + second / 100);
    case "original-decrease":
      if (second === 100) throw new Error("A 100% decrease cannot be reversed.");
      return first / (1 - second / 100);
    default:
      throw new Error("Choose a supported percentage calculation.");
  }
}
