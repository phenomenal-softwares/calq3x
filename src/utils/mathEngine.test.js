import { describe, expect, it } from "vitest";
import { formatExpression } from "./expressionFormatter.js";
import { formatResult } from "./formatter.js";
import { evaluateExpression } from "./mathEngine.js";
import { calculatePercentage } from "./percentage.js";

describe("evaluateExpression", () => {
  it("respects arithmetic precedence, parentheses, and negative numbers", () => {
    expect(evaluateExpression("2 + 3 * 4")).toBe(14);
    expect(evaluateExpression("(2 + 3) * 4")).toBe(20);
    expect(evaluateExpression("-8 / 2 + 1")).toBe(-3);
    expect(evaluateExpression("2pi")).toBeCloseTo(2 * Math.PI);
  });

  it("formats ordinary decimal arithmetic without floating-point noise", () => {
    expect(formatResult(evaluateExpression("0.1 + 0.2"))).toBe("0.3");
  });

  it("handles scientific functions in both angle modes", () => {
    expect(evaluateExpression("sin(30)", "DEG")).toBeCloseTo(0.5);
    expect(evaluateExpression("sin(pi / 6)", "RAD")).toBeCloseTo(0.5);
    expect(evaluateExpression("asin(0.5)", "DEG")).toBeCloseTo(30);
    expect(evaluateExpression("log(100)")).toBeCloseTo(2);
    expect(evaluateExpression("log(8, 2)")).toBeCloseTo(3);
    expect(evaluateExpression("ln(e)")).toBeCloseTo(1);
    expect(evaluateExpression("sqrt(144)")).toBe(12);
    expect(evaluateExpression("2^8")).toBe(256);
    expect(evaluateExpression("5!")).toBe(120);
    expect(evaluateExpression("17 % 5")).toBe(2);
    expect(evaluateExpression("root(-27, 3)")).toBeCloseTo(-3);
    expect(evaluateExpression("root(8, 3)")).toBe(2);
  });

  it("closes unmatched parentheses when the expression ends with a value", () => {
    expect(evaluateExpression("log(120")).toBeCloseTo(Math.log10(120));
    expect(evaluateExpression("sin(30")).toBeCloseTo(0.5);
    expect(evaluateExpression("((2 + 3")).toBe(5);
  });

  it("keeps incomplete operations invalid", () => {
    expect(() => evaluateExpression("log(120+")).toThrow(/syntax/);
    expect(() => evaluateExpression("2 +")).toThrow(/syntax/);
  });

  it("formats expression syntax for display without changing its source", () => {
    expect(formatExpression("sqrt(9) + 5^2 + asin(0.5) + pi"))
      .toBe("√(9) + 5² + sin⁻¹(0.5) + π");
    expect(formatExpression("2^2.5 - 3^-2")).toBe("2^2.5 − 3⁻²");
  });

  it.each([
    ["1 / 0", /real-number range/],
    ["2 +", /syntax/],
    ["sqrt(-1)", /negative/],
    ["(-1)!", /Factorial requires/],
    ["2.5!", /non-negative integer/],
    ["1000000!", /Factorial supports/],
    ["ln(0)", /greater than zero/],
    ["log(-2)", /greater than zero/],
    ["", /Enter an expression/],
    ["2 ** 3", /syntax|operator/],
    ["x + 1", /Unknown value/],
    ["import('fs')", /not supported/],
  ])("rejects invalid or unsupported expression %s", (expression, message) => {
    expect(() => evaluateExpression(expression)).toThrow(message);
  });

  it("formats negative halves and small non-zero values consistently", () => {
    expect(formatResult(-1.23456789005)).toBe("-1.2345678901");
    expect(formatResult(1e-12)).toBe("1E-12");
    expect(formatResult(1e18)).toBe("1E18");
  });

  it("limits expression length before parsing", () => {
    expect(() => evaluateExpression("1".repeat(513))).toThrow(/512 characters/);
  });
});

describe("calculatePercentage", () => {
  it("calculates the supported percentage operations", () => {
    expect(calculatePercentage("of", 15, 200)).toBe(30);
    expect(calculatePercentage("of", 200, 15)).toBe(30);
    expect(calculatePercentage("increase", 200, 15)).toBeCloseTo(230);
    expect(calculatePercentage("decrease", 200, 15)).toBeCloseTo(170);
    expect(calculatePercentage("change", 200, 250)).toBe(25);
    expect(calculatePercentage("what-percent", 30, 200)).toBe(15);
    expect(calculatePercentage("original-increase", 230, 15)).toBeCloseTo(200);
    expect(calculatePercentage("original-decrease", 170, 15)).toBeCloseTo(200);
  });

  it("rejects missing input and zero denominators", () => {
    expect(() => calculatePercentage("of", "", 15)).toThrow(/Enter/);
    expect(() => calculatePercentage("change", 0, 20)).toThrow(/zero/);
    expect(() => calculatePercentage("what-percent", 30, 0)).toThrow(/zero/);
    expect(() => calculatePercentage("original-decrease", 30, 100)).toThrow(/reversed/);
  });
});
