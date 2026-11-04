import { useState } from "react";
import { motion } from "motion/react";
import styles from "./PercentageCalculator.module.css";

const operations = [
  { id: "of", label: "Percent of a value", first: "Percentage", second: "Value" },
  { id: "increase", label: "Increase by a percent", first: "Starting value", second: "Increase" },
  { id: "decrease", label: "Decrease by a percent", first: "Starting value", second: "Decrease" },
  { id: "change", label: "Percentage change", first: "Original value", second: "New value" },
  { id: "what-percent", label: "What percent is this?", first: "Part", second: "Whole" },
  { id: "original-increase", label: "Original before increase", first: "Final value", second: "Increase" },
  { id: "original-decrease", label: "Original before decrease", first: "Final value", second: "Decrease" },
];

export default function PercentageCalculator({ onCalculate }) {
  const [operation, setOperation] = useState(operations[0].id);
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const selected = operations.find((item) => item.id === operation);

  function submit(event) {
    event.preventDefault();
    const calculation = onCalculate(operation, first, second, selected);
    if (calculation?.error) {
      setError(calculation.error);
      setResult(null);
    } else {
      setError("");
      setResult(calculation.display);
    }
  }

  function changeOperation(event) {
    setOperation(event.target.value);
    setResult(null);
    setError("");
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.selectLabel} htmlFor="percentage-operation">CALCULATION</label>
      <select id="percentage-operation" value={operation} onChange={changeOperation}>
        {operations.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
      </select>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>{selected.first}</span>
          <input
            type="number"
            inputMode="decimal"
            value={first}
            onChange={(event) => setFirst(event.target.value)}
            placeholder="0"
          />
        </label>
        <span className={styles.connector} aria-hidden="true">
          {operation === "of" ? "% of" : operation.includes("increase") || operation.includes("decrease") ? "%" : "and"}
        </span>
        <label className={styles.field}>
          <span>{selected.second}</span>
          <input
            type="number"
            inputMode="decimal"
            value={second}
            onChange={(event) => setSecond(event.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      <motion.button
        className={styles.calculate}
        type="submit"
        whileTap={{ scale: 0.98 }}
      >
        Calculate
      </motion.button>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {result !== null && (
        <div className={styles.result} aria-live="polite">
          <span>RESULT</span>
          <strong>{result}{["change", "what-percent"].includes(operation) ? "%" : ""}</strong>
        </div>
      )}
    </form>
  );
}
