import styles from "./range.module.css";

export default function RangeSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}) {
  return (
    <div className={styles.wrapper}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.range}
      />

      <div className={styles.value}>
        {value}
        {unit}
      </div>
    </div>
  );
}
