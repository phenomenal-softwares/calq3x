import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./ScientificKeypad.module.css";

const groups = [
  {
    title: "Trigonometry",
    keys: [
      ["sin", "sin("], ["cos", "cos("], ["tan", "tan("],
      ["sin⁻¹", "asin("], ["cos⁻¹", "acos("], ["tan⁻¹", "atan("],
      ["sinh", "sinh("], ["cosh", "cosh("], ["tanh", "tanh("],
    ],
  },
  {
    title: "Powers, roots & logs",
    keys: [
      ["x²", "^2"], ["x³", "^3"], ["xʸ", "^"],
      ["√x", "sqrt("], ["ⁿ√x", "nth-root"], ["1/x", "reciprocal"],
      ["x!", "!"], ["log", "log("], ["ln", "ln("], ["logₐ", "log(, )"],
      ["exp", "exp("],
    ],
  },
  {
    title: "More functions",
    keys: [
      ["|x|", "abs("], ["floor", "floor("], ["ceil", "ceil("],
      ["mod", "%"], ["π", "pi"], ["e", "e"],
    ],
  },
];

export default function ScientificKeypad({ onAction }) {
  const [expanded, setExpanded] = useState("Trigonometry");

  return (
    <div className={styles.groups} aria-label="Scientific functions">
      {groups.map(({ title, keys }) => {
        const isExpanded = expanded === title;
        return (
          <section className={styles.group} key={title}>
            <button
              type="button"
              className={styles.heading}
              aria-expanded={isExpanded}
              onClick={() => setExpanded(isExpanded ? "" : title)}
            >
              <span>{title}</span>
              <FiChevronDown className={isExpanded ? styles.chevronOpen : ""} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  className={styles.grid}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {keys.map(([label, value]) => (
                    <motion.button
                      type="button"
                      key={label}
                      className={styles.functionKey}
                      aria-label={label}
                      title={label === "ⁿ√x"
                        ? "Enter the root degree first, then the value to root"
                        : undefined}
                      onClick={() =>
                        ["reciprocal", "nth-root"].includes(value)
                          ? onAction({ action: value })
                          : onAction({ action: "append", value })
                      }
                      whileTap={{ scale: 0.96 }}
                    >
                      {label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
    </div>
  );
}
