import BottomSheet from "../ui/BottomSheet";
import styles from "./editSection.module.css";

export default function EditSectionModal({ isOpen, onClose, section, onSave }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h3 className={styles.title}>Edit Section</h3>

      {/* BACKGROUND */}
      <div className={styles.row}>
        <span>Background</span>
        <input
          type="color"
          value={section.bg || "#ffffff"}
          onChange={(e) => onSave({ bg: e.target.value })}
        />
      </div>

      {/* PADDING */}
      <div className={styles.row}>
        <span>Padding</span>
        <input
          type="number"
          value={section.padding || 10}
          onChange={(e) => onSave({ padding: Number(e.target.value) })}
        />
      </div>

      <button className={styles.done} onClick={onClose}>
        Done
      </button>
    </BottomSheet>
  );
}
