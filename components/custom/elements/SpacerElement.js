"use client";

import { useState } from "react";

import { Pencil } from "lucide-react";

import EditSpacerModal from "../modals/EditSpacerModal";

import styles from "./spacer.module.css";
import RenderSpacer from "../shared/RenderSpacer";

export default function SpacerElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  const shadowMap = {
    none: "none",
    small: "0 2px 6px rgba(0,0,0,0.06)",
    medium: "0 6px 14px rgba(0,0,0,0.10)",
    large: "0 10px 24px rgba(0,0,0,0.14)",
  };

  const radiusMap = {
    none: 0,
    small: 8,
    medium: 14,
    large: 20,
    full: 999,
  };

  const marginMap = {
    none: 0,
    small: 12,
    medium: 24,
    large: 40,
  };

  return (
    <div
      className={styles.wrapper}
      style={{
        marginTop: marginMap[element.margin] || 0,
        marginBottom: marginMap[element.margin] || 0,
      }}
    >
      {/* VISUAL */}
      <div className={styles.spacer}>
        <RenderSpacer element={element} />

        <span className={styles.label}>{element.height || 80}px spacer</span>
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
      <EditSpacerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
