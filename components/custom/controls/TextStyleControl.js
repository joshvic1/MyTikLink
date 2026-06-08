// controls/TextStyleControl.js
import styles from "./textstyle.module.css";
import { Bold, Italic, Underline } from "lucide-react";

export default function TextStyleControl({ element, onChange }) {
  return (
    <div className={styles.wrapper}>
      <button
        className={element.bold ? styles.active : ""}
        onClick={() => onChange({ bold: !element.bold })}
      >
        <Bold size={14} />
      </button>

      <button
        className={element.italic ? styles.active : ""}
        onClick={() => onChange({ italic: !element.italic })}
      >
        <Italic size={14} />
      </button>

      <button
        className={element.underline ? styles.active : ""}
        onClick={() => onChange({ underline: !element.underline })}
      >
        <Underline size={14} />
      </button>
    </div>
  );
}
