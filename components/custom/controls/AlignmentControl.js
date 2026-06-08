// controls/AlignmentControls.js
import styles from "./alignment.module.css";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const options = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
];

export default function AlignmentControl({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      {options.map((opt) => {
        const Icon = opt.icon;

        return (
          <button
            key={opt.value}
            className={value === opt.value ? styles.active : ""}
            onClick={() => onChange(opt.value)}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
