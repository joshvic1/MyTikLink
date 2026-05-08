import styles from "./segmentControl.module.css";

export default function SegmentControl({ options, value, onChange }) {
  return (
    <div className={styles.segment}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? styles.active : ""}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
