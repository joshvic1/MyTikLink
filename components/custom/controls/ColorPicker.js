// controls/ColorPicker.js
import { Pipette } from "lucide-react";
import styles from "./colorpicker.module.css";

const PRESET_COLORS = [
  "#111827",
  "#6b7280",
  "#e5e7eb",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      {/* PRESET COLORS */}
      <div className={styles.palette}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className={`${styles.swatch} ${
              value === color ? styles.active : ""
            }`}
            style={{ background: color }}
            onClick={() => onChange(color)}
          />
        ))}

        {/* CUSTOM PICKER */}
        <label className={styles.custom}>
          <Pipette size={16} />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
