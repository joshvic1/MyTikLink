import BottomSheet from "../ui/BottomSheet";
import styles from "./editButton.module.css";

export default function EditButtonModal({ isOpen, onClose, element, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Edit Button</h3>

        {/* TEXT */}
        <div className={styles.field}>
          <label>Text</label>
          <input
            value={element.text}
            onChange={(e) => onSave({ text: e.target.value })}
            placeholder="Buy Now"
          />
        </div>

        {/* URL */}
        <div className={styles.field}>
          <label>Link</label>
          <input
            value={element.url}
            onChange={(e) => onSave({ url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* COLOR */}
        <div className={styles.fieldRow}>
          <label>Background</label>
          <input
            type="color"
            value={element.bg}
            onChange={(e) => onSave({ bg: e.target.value })}
          />
        </div>

        <button className={styles.done} onClick={onClose}>
          Done
        </button>
      </div>
    </BottomSheet>
  );
}
