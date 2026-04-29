import styles from "../styles/section.module.css";
import ElementRenderer from "./ElementRenderer";
import { useState } from "react";
import AddElementModal from "../modals/AddElementModal";
import { Trash2, Pencil, X, Plus } from "lucide-react";
import EditSectionModal from "../modals/EditSectionModal";

export default function Section({
  section,
  onAddElement,
  openAddElement,
  onDeleteElement,
  onDeleteSection,
  onUpdateElement,
  onUpdateSection,
}) {
  const [showEdit, setShowEdit] = useState(false);
  return (
    <div
      className={styles.section}
      style={{
        background: section.bg || "#fff",
        padding: section.padding || 12,
      }}
    >
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.label}>Section</div>

        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => setShowEdit(true)}>
            <Pencil size={16} />
          </button>

          <button
            className={styles.iconBtnDanger}
            onClick={() => onDeleteSection(section.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ELEMENTS */}
      <div className={styles.inner}>
        {section.elements.map((el) => (
          <div key={el.id} className={styles.elementBox}>
            <ElementRenderer
              element={el}
              sectionId={section.id}
              onUpdateElement={onUpdateElement}
              onDeleteElement={onDeleteElement}
            />
            {/* DELETE ELEMENT */}
            {/* <button
              className={styles.deleteSmall}
              onClick={() => onDeleteElement(section.id, el.id)}
            >
              <X size={14} />
            </button> */}
          </div>
        ))}
      </div>

      {/* ADD ELEMENT */}
      <button
        className={styles.add}
        onClick={() => openAddElement("inside", section.id)}
      >
        <Plus size={16} style={{ marginRight: 6 }} />
        Add Element
      </button>
      {/* MODAL */}

      <EditSectionModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        section={section}
        onSave={(data) => onUpdateSection(section.id, data)}
      />
    </div>
  );
}
