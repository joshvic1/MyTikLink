"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import EditHtmlModal from "../modals/EditHtmlModal";
import RenderHtml from "../shared/RenderHtml";
import styles from "./html.module.css";

export default function HtmlElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.preview}>
        <RenderHtml element={element} />
      </div>

      <div className={styles.actions}>
        <button className={styles.edit} onClick={() => setOpen(true)}>
          <Pencil size={14} />
        </button>

        <button
          className={styles.delete}
          onClick={() => onDeleteElement(sectionId, element.id)}
        >
          x
        </button>
      </div>

      <EditHtmlModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
