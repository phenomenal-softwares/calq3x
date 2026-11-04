import { motion } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";
import { formatExpression } from "../../utils/expressionFormatter.js";
import styles from "./CalculatorDisplay.module.css";

export default function CalculatorDisplay({
  expression,
  result,
  error,
  angleMode,
  onAngleModeChange,
}) {
  const displayExpression = formatExpression(expression || "0");

  return (
    <section className={styles.display} aria-label="Calculator display" aria-live="polite">
      <div className={styles.displayTop}>
        <span className={styles.displayLabel}>CURRENT EXPRESSION</span>
        {onAngleModeChange && (
          <button
            type="button"
            className={styles.angle}
            onClick={onAngleModeChange}
            aria-label={`Angle mode ${angleMode}; switch to ${angleMode === "DEG" ? "RAD" : "DEG"}`}
            title="Switch angle mode"
          >
            {angleMode}
            <FiArrowUpRight aria-hidden="true" />
          </button>
        )}
      </div>
      <div className={styles.expression} title={displayExpression}>
        {displayExpression}
      </div>
      {error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : (
        <motion.div
          key={result ?? "empty"}
          className={styles.result}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <span className={styles.resultEquals}>=</span>
          <span>{result ?? "0"}</span>
        </motion.div>
      )}
    </section>
  );
}
