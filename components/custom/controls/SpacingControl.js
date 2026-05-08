import styles from "./spacing.module.css";

const options = [
  { label: "🚫", value: 0 },
  { label: "S", value: 8 },
  { label: "M", value: 16 },
  { label: "L", value: 24 },
  { label: "XL", value: 32 },
];

export default function SpacingControl({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
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
