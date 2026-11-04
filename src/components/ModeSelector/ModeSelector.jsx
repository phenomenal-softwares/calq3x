import { motion } from "motion/react";
import styles from "./ModeSelector.module.css";

const modes = [
  { id: "standard", label: "Standard" },
  { id: "scientific", label: "Scientific" },
  { id: "percentage", label: "Percent" },
];

export default function ModeSelector({ mode, onChange }) {
  return (
    <nav className={styles.selector} aria-label="Calculator mode">
      {modes.map(({ id, label }) => (
        <motion.button
          key={id}
          type="button"
          className={`${styles.option} ${mode === id ? styles.active : ""}`}
          aria-current={mode === id ? "page" : undefined}
          onClick={() => onChange(id)}
          whileTap={{ scale: 0.96 }}
        >
          {label}
        </motion.button>
      ))}
    </nav>
  );
}
