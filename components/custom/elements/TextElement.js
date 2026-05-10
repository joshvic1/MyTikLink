"use client";

import styles from "./text.module.css";
import { useState } from "react";
import EditTextModal from "../modals/EditTextModal";
import { Pencil } from "lucide-react";
import RenderText from "../shared/RenderText";

export default function TextElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [showEdit, setShowEdit] = useState(false);

  const Tag = element.tag || "p";

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.content}>
          {/* TEXT */}
          <div className={styles.text}>
            <RenderText element={element} />
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            <button
              className={styles.edit}
              onClick={() => {
                onSelectSection(section);
                setShowEdit(true);
              }}
            >
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
    </div>
  );
}
