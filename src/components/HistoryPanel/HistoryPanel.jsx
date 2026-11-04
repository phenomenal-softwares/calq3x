import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiCopy, FiRotateCcw, FiTrash2, FiX } from "react-icons/fi";
import styles from "./HistoryPanel.module.css";

export default function HistoryPanel({
  isOpen,
  history,
  onClose,
  onReuse,
  onDelete,
  onClear,
  onCopy,
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll(
        'button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            className={styles.backdrop}
            aria-label="Close history"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            ref={panelRef}
            className={styles.panel}
            aria-label="Calculation history"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-heading"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
          >
            <header className={styles.header}>
              <div>
                <p className={styles.eyebrow}>YOUR SESSION</p>
                <h2 id="history-heading">History <span>{history.length}</span></h2>
              </div>
              <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close history">
                <FiX aria-hidden="true" />
              </button>
            </header>

            {history.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyMark}>=</span>
                <p>Your calculations will appear here.</p>
              </div>
            ) : (
              <div className={styles.list}>
                {history.map((item) => (
                  <article className={styles.entry} key={item.id}>
                    <p className={styles.expression}>{item.expression}</p>
                    <p className={styles.value}>{item.result}</p>
                    <div className={styles.actions}>
                      {item.mode !== "percentage" && (
                        <button type="button" onClick={() => onReuse(item, "expression")} aria-label="Reuse expression">
                          <FiRotateCcw aria-hidden="true" /> Expression
                        </button>
                      )}
                      <button type="button" onClick={() => onReuse(item, "result")} aria-label="Reuse result">
                        = Result
                      </button>
                      <button type="button" onClick={() => onCopy(item.result)} aria-label="Copy result">
                        <FiCopy aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => onDelete(item.id)} aria-label="Remove calculation">
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <button type="button" className={styles.clear} onClick={onClear}>
                Clear history
              </button>
            )}
            <p className={styles.privacy}>Stored in this tab only. Refreshing clears your history.</p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
