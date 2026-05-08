import styles from "./stepper.module.css";
import { Minus, Plus } from "lucide-react";

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
}) {
  const decrease = () => {
    if (value > min) onChange(value - step);
  };

  const increase = () => {
    if (value < max) onChange(value + step);
  };

  return (
    <div className={styles.stepper}>
      <button onClick={decrease} className={styles.btns}>
        <Minus size={14} />
      </button>

      <span className={styles.value}>
        {value} {unit}
      </span>

      <button onClick={increase} className={styles.btns}>
        <Plus size={14} />
      </button>
    </div>
  );
}
