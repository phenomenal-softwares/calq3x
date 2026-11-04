import { parse } from "mathjs/number";
const allowedFunctions = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "log",
  "log10",
  "ln",
  "sqrt",
  "root",
  "nthRoot",
  "abs",
  "exp",
  "floor",
  "ceil",
]);
const operators = new Set(["+", "-", "*", "/", "^", "%", "!"]);
const functionArities = {
  sin: [1],
  cos: [1],
  tan: [1],
  asin: [1],
  acos: [1],
  atan: [1],
  sinh: [1],
  cosh: [1],
  tanh: [1],
  log: [1, 2],
  log10: [1],
  ln: [1],
  sqrt: [1],
  root: [2],
  nthRoot: [2],
  abs: [1],
  exp: [1],
  floor: [1],
  ceil: [1],
};

function normalizeExpression(expression) {
  return expression
    .replace(/[×·]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/π/g, "pi");
}

function closeTrailingParentheses(expression) {
  const trimmed = expression.trim();
  let depth = 0;

  for (const character of trimmed) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
  }

  if (depth <= 0 || !/(?:\d|[a-zπe)!%])$/i.test(trimmed)) return trimmed;
  return `${trimmed}${")".repeat(depth)}`;
}

function validateNode(node) {
  switch (node.type) {
    case "ConstantNode":
      if (typeof node.value !== "number") {
        throw new Error("Only numeric values are supported.");
      }
      return;
    case "SymbolNode":
      if (node.name !== "pi" && node.name !== "e") {
        throw new Error(`Unknown value: ${node.name}.`);
      }
      return;
    case "ParenthesisNode":
      validateNode(node.content);
      return;
    case "OperatorNode":
      if (!operators.has(node.op)) {
        throw new Error(`The operator "${node.op}" is not supported.`);
      }
      node.args.forEach(validateNode);
      return;
    case "FunctionNode": {
      if (node.fn.type !== "SymbolNode" || !allowedFunctions.has(node.fn.name)) {
        throw new Error("That function is not supported.");
      }
      const name = node.fn.name;
      if (!functionArities[name].includes(node.args.length)) {
        throw new Error(`Check the number of arguments for ${name}().`);
      }
      node.args.forEach(validateNode);
      return;
    }
    default:
      throw new Error("That expression contains unsupported syntax.");
  }
}

function validateFactorials(node, scope) {
  if (node.args) node.args.forEach((child) => validateFactorials(child, scope));
  if (node.content) validateFactorials(node.content, scope);

  if (node.type === "OperatorNode" && node.op === "!") {
    const value = node.args[0].compile().evaluate(scope);
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Factorial requires a non-negative integer.");
    }
    if (value > 170) {
      throw new Error("Factorial supports non-negative integers up to 170.");
    }
  }
}

function realNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return number;
}

function createScope(angleMode) {
  const toRadians = (value) => (angleMode === "DEG" ? (value * Math.PI) / 180 : value);
  const fromRadians = (value) =>
    angleMode === "DEG" ? (value * 180) / Math.PI : value;
  const positiveLogInput = (value, label) => {
    if (value <= 0) throw new Error(`${label} requires a value greater than zero.`);
    return value;
  };
  const positiveRootDegree = (degree) => {
    if (degree === 0) throw new Error("The root degree cannot be zero.");
    return degree;
  };

  return {
    pi: Math.PI,
    e: Math.E,
    sin: (value) => Math.sin(toRadians(realNumber(value, "sin"))),
    cos: (value) => Math.cos(toRadians(realNumber(value, "cos"))),
    tan: (value) => Math.tan(toRadians(realNumber(value, "tan"))),
    asin: (value) => fromRadians(Math.asin(realNumber(value, "asin"))),
    acos: (value) => fromRadians(Math.acos(realNumber(value, "acos"))),
    atan: (value) => fromRadians(Math.atan(realNumber(value, "atan"))),
    sinh: (value) => Math.sinh(realNumber(value, "sinh")),
    cosh: (value) => Math.cosh(realNumber(value, "cosh")),
    tanh: (value) => Math.tanh(realNumber(value, "tanh")),
    log: (...values) => {
      const number = positiveLogInput(realNumber(values[0], "log"), "log");
      if (values.length === 1) return Math.log10(number);
      const base = positiveLogInput(realNumber(values[1], "log base"), "log");
      if (base === 1) throw new Error("A logarithm base cannot be 1.");
      return Math.log(number) / Math.log(base);
    },
    log10: (value) =>
      Math.log10(positiveLogInput(realNumber(value, "log"), "log")),
    ln: (value) => Math.log(positiveLogInput(realNumber(value, "ln"), "ln")),
    sqrt: (value) => {
      const number = realNumber(value, "sqrt");
      if (number < 0) throw new Error("Square roots of negative numbers are not supported.");
      return Math.sqrt(number);
    },
    root: (value, degree) => {
      const number = realNumber(value, "root");
      const rootDegree = positiveRootDegree(realNumber(degree, "Root degree"));
      if (number < 0 && Number.isInteger(rootDegree) && Math.abs(rootDegree % 2) === 1) {
        return -Math.pow(-number, 1 / rootDegree);
      }
      if (number < 0) throw new Error("This root is not a real number.");
      return Math.pow(number, 1 / rootDegree);
    },
    nthRoot: (value, degree) => createScope(angleMode).root(value, degree),
    abs: (value) => Math.abs(realNumber(value, "abs")),
    exp: (value) => Math.exp(realNumber(value, "exp")),
    floor: (value) => Math.floor(realNumber(value, "floor")),
    ceil: (value) => Math.ceil(realNumber(value, "ceil")),
  };
}

export function evaluateExpression(expression, angleMode = "DEG") {
  if (typeof expression !== "string" || !expression.trim()) {
    throw new Error("Enter an expression to calculate.");
  }
  if (expression.length > 512) {
    throw new Error("Expressions are limited to 512 characters.");
  }
  if (angleMode !== "DEG" && angleMode !== "RAD") {
    throw new Error("Choose DEG or RAD angle mode.");
  }

  let node;
  try {
    node = parse(closeTrailingParentheses(normalizeExpression(expression)));
  } catch {
    throw new Error("Check the expression syntax.");
  }

  validateNode(node);
  const scope = createScope(angleMode);
  validateFactorials(node, scope);

  let result;
  try {
    result = node.compile().evaluate(scope);
  } catch (error) {
    if (error instanceof Error && /non-negative|integer/i.test(error.message)) {
      throw new Error("Factorial requires a non-negative integer.");
    }
    if (error instanceof Error && !/mathjs|undefined|Cannot read/.test(error.message)) {
      throw error;
    }
    throw new Error("This expression cannot be calculated.");
  }

  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("The result is outside the supported real-number range.");
  }
  return result;
}
