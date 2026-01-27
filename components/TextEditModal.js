"use client";
import styles from "@/styles/textEditModal.module.css";

export default function TextEditModal({ field, value, onSave, onCancel }) {
  const [text, setText] = useState(value || "");

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Edit text</h3>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />

        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancel}>
            Cancel
          </button>
          <button onClick={() => onSave(text)} className={styles.save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
