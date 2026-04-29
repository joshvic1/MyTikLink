import styles from "./text.module.css";
import { useState } from "react";
import EditTextModal from "../modals/EditTextModal";
import { Pencil } from "lucide-react";

export default function TextElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {/* TEXT */}
        <div
          className={styles.text}
          style={{
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            textAlign: element.align,
            color: element.color,
            lineHeight: element.lineHeight,
            letterSpacing: `${element.letterSpacing}px`,
          }}
        >
          {element.content}
        </div>

        {/* EDIT BUTTON */}
        <div className={styles.actions}>
          <button className={styles.edit} onClick={() => setShowEdit(true)}>
            <Pencil size={14} />
          </button>

          <button
            className={styles.delete}
            onClick={() => onDeleteElement(sectionId, element.id)}
          >
            ✕
          </button>
        </div>

        {/* MODAL */}
        <EditTextModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          element={element}
          onSave={(data) => onUpdateElement(sectionId, element.id, data)}
        />
      </div>
    </div>
  );
}
