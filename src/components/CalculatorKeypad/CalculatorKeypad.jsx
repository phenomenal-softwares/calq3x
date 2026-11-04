import { motion } from "motion/react";
import { FiDelete } from "react-icons/fi";
import styles from "./CalculatorKeypad.module.css";

const keys = [
  { label: "AC", action: "clear", kind: "clear", aria: "Clear expression" },
  { label: <FiDelete aria-hidden="true" />, text: "DEL", action: "delete", kind: "utility", aria: "Delete last character" },
  { label: "(", action: "append", value: "(", kind: "utility", aria: "Open parenthesis" },
  { label: ")", action: "append", value: ")", kind: "utility", aria: "Close parenthesis" },
  { label: "÷", action: "append", value: "/", kind: "operator", aria: "Divide" },
  { label: "7", action: "append", value: "7" },
  { label: "8", action: "append", value: "8" },
  { label: "9", action: "append", value: "9" },
  { label: "×", action: "append", value: "*", kind: "operator", aria: "Multiply" },
  { label: "%", action: "percent", kind: "utility", aria: "Percent" },
  { label: "4", action: "append", value: "4" },
  { label: "5", action: "append", value: "5" },
  { label: "6", action: "append", value: "6" },
  { label: "−", action: "append", value: "-", kind: "operator", aria: "Subtract" },
  { label: "±", action: "toggle-sign", kind: "utility", aria: "Toggle sign" },
  { label: "1", action: "append", value: "1" },
  { label: "2", action: "append", value: "2" },
  { label: "3", action: "append", value: "3" },
  { label: "+", action: "append", value: "+", kind: "operator", aria: "Add" },
  { label: "=", action: "calculate", kind: "equals", aria: "Calculate result" },
  { label: "0", action: "append", value: "0", wide: true },
  { label: ".", action: "decimal", kind: "utility", aria: "Decimal point" },
];

export default function CalculatorKeypad({ onAction }) {
  return (
    <div className={styles.keypad} aria-label="Calculator keypad">
      {keys.map((key, index) => (
        <motion.button
          key={`${key.action}-${key.value ?? key.label}-${index}`}
          type="button"
          className={[
            styles.key,
            key.kind ? styles[key.kind] : "",
            key.wide ? styles.wide : "",
          ].join(" ")}
          aria-label={key.aria ?? key.value ?? key.label}
          onClick={() => onAction(key)}
          whileTap={{ scale: 0.95, y: 1 }}
          transition={{ duration: 0.08 }}
        >
          {key.label}
        </motion.button>
      ))}
    </div>
  );
}

export { styles as keypadStyles };
