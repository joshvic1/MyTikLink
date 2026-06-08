// elements/DividerElement.js
import { useState } from "react";
import { Pencil } from "lucide-react";
import styles from "./divider.module.css";
import EditDividerModal from "../modals/EditDividerModal";
import RenderDivider from "../shared/RenderDivider";

export default function DividerElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.dividerWrap}
        style={{
          marginTop: element.marginTop || 16,
          marginBottom: element.marginBottom || 16,

          justifyContent: element.width === "content" ? "center" : "stretch",
        }}
      >
        <RenderDivider element={element} />
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button className={styles.edit} onClick={() => setOpen(true)}>
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
      <EditDividerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
