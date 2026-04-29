import BottomSheet from "../ui/BottomSheet";
import styles from "./editText.module.css";
import { AlignLeft, AlignCenter, AlignRight, Bold } from "lucide-react";

export default function EditTextModal({ isOpen, onClose, element, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h3 className={styles.title}>Edit Text</h3>

      {/* TEXT */}
      <textarea
        className={styles.input}
        value={element.content}
        onChange={(e) => onSave({ content: e.target.value })}
      />

      {/* FONT SIZE */}
      <div className={styles.control}>
        <label>Font Size</label>
        <input
          type="range"
          min="12"
          max="60"
          value={element.fontSize}
          onChange={(e) => onSave({ fontSize: Number(e.target.value) })}
        />
      </div>

      {/* FONT WEIGHT */}
      <div className={styles.control}>
        <label>Bold</label>
        <button
          className={`${styles.toggle} ${
            element.fontWeight > 500 ? styles.active : ""
          }`}
          onClick={() =>
            onSave({
              fontWeight: element.fontWeight > 500 ? 400 : 700,
            })
          }
        >
          <Bold size={16} />
        </button>
      </div>

      {/* ALIGN */}
      <div className={styles.control}>
        <label>Alignment</label>

        <div className={styles.alignRow}>
          <button
            className={element.align === "left" ? styles.active : ""}
            onClick={() => onSave({ align: "left" })}
          >
            <AlignLeft size={16} />
          </button>

          <button
            className={element.align === "center" ? styles.active : ""}
            onClick={() => onSave({ align: "center" })}
          >
            <AlignCenter size={16} />
          </button>

          <button
            className={element.align === "right" ? styles.active : ""}
            onClick={() => onSave({ align: "right" })}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      {/* COLOR */}
      <div className={styles.control}>
        <label>Text Color</label>
        <input
          type="color"
          value={element.color}
          onChange={(e) => onSave({ color: e.target.value })}
        />
      </div>

      {/* LINE HEIGHT */}
      <div className={styles.control}>
        <label>Line Height</label>
        <input
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={element.lineHeight}
          onChange={(e) => onSave({ lineHeight: Number(e.target.value) })}
        />
      </div>

      {/* LETTER SPACING */}
      <div className={styles.control}>
        <label>Letter Spacing</label>
        <input
          type="range"
          min="0"
          max="10"
          value={element.letterSpacing}
          onChange={(e) => onSave({ letterSpacing: Number(e.target.value) })}
        />
      </div>

      <button className={styles.done} onClick={onClose}>
        Done
      </button>
    </BottomSheet>
  );
}
