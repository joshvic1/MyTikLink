"use client";

import { useState } from "react";

import { Pencil } from "lucide-react";

import styles from "./menu.module.css";

import RenderMenu from "../shared/RenderMenu";

import EditMenuModal from "../modals/EditMenuModal";

export default function MenuElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <RenderMenu element={element} />

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

      <EditMenuModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
