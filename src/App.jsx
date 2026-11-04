import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiClock, FiCommand } from "react-icons/fi";
import CalculatorDisplay from "./components/CalculatorDisplay/CalculatorDisplay.jsx";
import CalculatorKeypad from "./components/CalculatorKeypad/CalculatorKeypad.jsx";
import HistoryPanel from "./components/HistoryPanel/HistoryPanel.jsx";
import ModeSelector from "./components/ModeSelector/ModeSelector.jsx";
import PercentageCalculator from "./components/PercentageCalculator/PercentageCalculator.jsx";
import ScientificKeypad from "./components/ScientificKeypad/ScientificKeypad.jsx";
import useKeyboard from "./hooks/useKeyboard.js";
import { formatResult } from "./utils/formatter.js";
import { evaluateExpression } from "./utils/mathEngine.js";
import { calculatePercentage } from "./utils/percentage.js";
import styles from "./App.module.css";

export default function App() {
  const [mode, setMode] = useState("standard");
  const [angleMode, setAngleMode] = useState("DEG");
  const [expression, setExpression] = useState("0");
  const [result, setResult] = useState(null);
  const [numericResult, setNumericResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const calculated = useRef(false);
  const entryId = useRef(0);
  const historyTriggerRef = useRef(null);
  const rootRadicandActive = useRef(false);

  const addHistory = useCallback((item) => {
    const newItem = { ...item, id: `calculation-${++entryId.current}` };
    setHistory((entries) => [newItem, ...entries].slice(0, 30));
  }, []);
  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
    historyTriggerRef.current?.focus();
  }, []);

  const calculate = useCallback((source = expression) => {
    try {
      const value = evaluateExpression(source, angleMode);
      const formatted = formatResult(value);
      setResult(formatted);
      setNumericResult(value);
      setError("");
      calculated.current = true;
      addHistory({ expression: source, result: formatted, value, mode });
    } catch (calculationError) {
      setError(calculationError.message);
      setResult(null);
      setNumericResult(null);
      calculated.current = false;
    }
  }, [addHistory, angleMode, expression, mode]);

  const handleAction = useCallback((key) => {
    setError("");

    switch (key.action) {
      case "clear":
        setExpression("0");
        rootRadicandActive.current = false;
        setResult(null);
        setNumericResult(null);
        calculated.current = false;
        return;
      case "delete":
        {
          if (rootRadicandActive.current && expression.includes("□")) {
            const enteredValue = expression.match(/(\d+(?:\.\d*)?)□/);
            if (enteredValue) {
              const trimmed = enteredValue[1].slice(0, -1);
              setExpression(expression.replace(
                `${enteredValue[1]}□`,
                `${trimmed}□`,
              ));
            } else {
              const previousDegree = expression.match(/^root\(□,\((.+)\)\)$/);
              if (previousDegree) {
                setExpression(previousDegree[1]);
                rootRadicandActive.current = false;
              }
            }
            setResult(null);
            setNumericResult(null);
            return;
          }
          const source = calculated.current && numericResult !== null
            ? String(numericResult)
            : expression;
          const next = source.slice(0, -1);
          setExpression(next && next !== "-" ? next : "0");
          calculated.current = false;
        }
        setResult(null);
        setNumericResult(null);
        return;
      case "decimal":
        {
          if (rootRadicandActive.current && expression.includes("□")) {
            const enteredValue = expression.match(/(\d+(?:\.\d*)?)□/);
            if (enteredValue) {
              if (!enteredValue[1].includes(".")) {
                setExpression(expression.replace(
                  `${enteredValue[1]}□`,
                  `${enteredValue[1]}.□`,
                ));
              }
            } else {
              setExpression(expression.replace("□", "0.□"));
            }
            setResult(null);
            setNumericResult(null);
            return;
          }
          const base = calculated.current ? "0" : expression;
          const segment = base.split(/[+\-*/%(,]/).at(-1) ?? "";
          if (!segment.includes(".")) {
            setExpression(base === "0"
              ? "0."
              : segment
                ? `${base}.`
                : `${base}0.`);
          }
          calculated.current = false;
        }
        setResult(null);
        setNumericResult(null);
        return;
      case "append": {
        const value = key.value;
        if (rootRadicandActive.current && expression.includes("□") && /^\d$/.test(value)) {
          setExpression(expression.replace("□", `${value}□`));
          setResult(null);
          setNumericResult(null);
          return;
        }
        if (rootRadicandActive.current && expression.includes("□")) {
          setExpression(expression.replace("□", ""));
          rootRadicandActive.current = false;
        }
        const isOperator = /^[+\-*/%^!]$/.test(value) || value.startsWith("^");
        let base = calculated.current
          ? isOperator && numericResult !== null ? String(numericResult) : "0"
          : expression;
        calculated.current = false;
        if (/^\d$/.test(value) && base === "0") {
          setExpression(value);
        } else if (["+", "*", "/", "%"].includes(value) && /[+\-*/%(,]$/.test(base)) {
          setExpression(`${base.slice(0, -1)}${value}`);
        } else {
          const startsAtom = /^[a-z(]/i.test(value);
          const endsAtom = /(?:\d|\)|pi|e)$/i.test(base);
          const prefix = startsAtom && endsAtom && base !== "0" ? "*" : "";
          setExpression(`${base === "0" && startsAtom ? "" : base}${prefix}${value}`);
        }
        setResult(null);
        setNumericResult(null);
        return;
      }
      case "toggle-sign":
        setExpression(calculated.current && numericResult !== null
          ? `-(${numericResult})`
          : expression === "0"
            ? "-"
            : expression.startsWith("-")
              ? expression.slice(1)
              : `-(${expression})`);
        calculated.current = false;
        setResult(null);
        setNumericResult(null);
        return;
      case "percent":
        try {
          const value = evaluateExpression(expression, angleMode);
          setExpression(`(${value})/100`);
          setResult(null);
          setNumericResult(null);
          calculated.current = false;
        } catch (calculationError) {
          setError(calculationError.message);
        }
        return;
      case "reciprocal":
        setExpression(`1/(${calculated.current && numericResult !== null ? numericResult : expression})`);
        setResult(null);
        setNumericResult(null);
        calculated.current = false;
        return;
      case "calculate":
        if (rootRadicandActive.current && expression.includes("□")) {
          const valueExpression = expression.replace("□", "");
          if (/root\(\s*□\s*,/.test(expression)) {
            setError("Enter the value whose root you want to calculate.");
            return;
          }
          rootRadicandActive.current = false;
          setExpression(valueExpression);
          calculate(valueExpression);
          return;
        }
        calculate();
        return;
      case "nth-root":
        if (expression === "0" || !expression.trim()) {
          setError("Enter the root degree first, then choose ⁿ√x.");
          return;
        }
        rootRadicandActive.current = true;
        setExpression(`root(□,(${calculated.current && numericResult !== null ? numericResult : expression}))`);
        setResult(null);
        setNumericResult(null);
        calculated.current = false;
        return;
      default:
        return;
    }
  }, [angleMode, calculate, expression, numericResult]);

  useKeyboard({ enabled: mode !== "percentage" && !historyOpen, onAction: handleAction });

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function calculatePercent(operation, first, second, selected) {
    try {
      const value = calculatePercentage(operation, first, second);
      if (!Number.isFinite(value)) throw new Error("The result is outside the supported number range.");
      const formatted = formatResult(value);
      addHistory({
        expression: `${selected.label}: ${selected.first} ${first} · ${selected.second} ${second}`,
        result: formatted,
        value,
        mode: "percentage",
      });
      return { display: formatted };
    } catch (calculationError) {
      return { error: calculationError.message };
    }
  }

  async function copyResult(value) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Result copied");
    } catch {
      setNotice("Could not copy result");
    }
  }

  function reuseHistory(item, type) {
    setMode(item.mode === "percentage" ? "standard" : item.mode);
    if (type === "result") {
      setExpression(String(item.value));
      setResult(item.result);
      setNumericResult(item.value);
      calculated.current = true;
    } else {
      setExpression(item.expression);
      setResult(null);
      setNumericResult(null);
      calculated.current = false;
    }
    setError("");
    closeHistory();
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.calculator} aria-label={`${mode} calculator`}>
          <header className={styles.deviceHeader}>
            <a className={styles.brand} href="#" aria-label="CALQ3x calculator">
              <span className={styles.brandMark}><FiCommand aria-hidden="true" /></span>
              <span>CALQ<span className={styles.brandThree}>3</span><span className={styles.brandX}>x</span></span>
            </a>
            <button
              ref={historyTriggerRef}
              className={styles.historyTrigger}
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label={`Open calculation history, ${history.length} entries`}
            >
              <FiClock aria-hidden="true" />
              <span>History</span>
              {history.length > 0 && <span className={styles.historyCount}>{history.length}</span>}
            </button>
          </header>
          <ModeSelector mode={mode} onChange={changeMode} />
          <AnimatePresence mode="wait" initial={false}>
            {mode === "percentage" ? (
              <motion.div
                key="percentage"
                className={styles.percentageWrap}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <PercentageCalculator onCalculate={calculatePercent} />
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                className={styles.standardWrap}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <CalculatorDisplay
                  expression={expression}
                  result={result}
                  error={error}
                  angleMode={mode === "scientific" ? angleMode : undefined}
                  onAngleModeChange={mode === "scientific"
                    ? () => setAngleMode((current) => current === "DEG" ? "RAD" : "DEG")
                    : undefined}
                />
                {mode === "scientific" && <ScientificKeypad onAction={handleAction} />}
                <CalculatorKeypad onAction={handleAction} />
                <div className={styles.keyboardHint}>
                  <span><kbd>Enter</kbd> calculate</span>
                  <span><kbd>⌫</kbd> delete</span>
                  <span><kbd>Esc</kbd> clear</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <p className={styles.footerNote}>
          <span className={styles.statusDot} />
          Your calculations stay in this session only
        </p>
      </main>

      <footer className={styles.companyFooter}>
        <a href="https://phenomenalproductions.com.ng" target="_blank" rel="noreferrer">
          Phenomenal<sup>®</sup>
        </a>
      </footer>

      <AnimatePresence>
        {notice && (
          <motion.div
            className={styles.notice}
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      <HistoryPanel
        isOpen={historyOpen}
        history={history}
        onClose={closeHistory}
        onReuse={reuseHistory}
        onDelete={(id) => setHistory((entries) => entries.filter((item) => item.id !== id))}
        onClear={() => setHistory([])}
        onCopy={copyResult}
      />
    </div>
  );
}
