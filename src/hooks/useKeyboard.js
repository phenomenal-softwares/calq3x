import { useEffect } from "react";

export default function useKeyboard({ enabled = true, onAction }) {
  useEffect(() => {
    if (!enabled) return undefined;

    function handleKeyDown(event) {
      const target = event.target;
      if (
        target instanceof Element &&
        (target.isContentEditable || target.closest("input, textarea, select, button"))
      ) {
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        onAction({ action: "append", value: event.key });
      } else if (["+", "-", "*", "/", "(", ")"].includes(event.key)) {
        event.preventDefault();
        onAction({ action: "append", value: event.key });
      } else if (event.key === ".") {
        event.preventDefault();
        onAction({ action: "decimal" });
      } else if (event.key === "%") {
        event.preventDefault();
        onAction({ action: "percent" });
      } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        onAction({ action: "calculate" });
      } else if (event.key === "Backspace") {
        event.preventDefault();
        onAction({ action: "delete" });
      } else if (event.key === "Escape") {
        event.preventDefault();
        onAction({ action: "clear" });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onAction]);
}
