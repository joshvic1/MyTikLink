"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import EditButtonModal from "../modals/EditButtonModal";

import styles from "./button.module.css";
import RenderButton from "../shared/RenderButton";
export default function ButtonElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  const shadowMap = {
    none: "none",
    light: "0 4px 10px rgba(0,0,0,0.08)",
    medium: "0 8px 20px rgba(0,0,0,0.12)",
    large: "0 12px 30px rgba(0,0,0,0.18)",
  };

  const radiusMap = {
    rectangle: 6,
    rounded: 14,
    pill: 999,
  };

  const sizeMap = {
    small: "10px 18px",
    medium: "14px 24px",
    large: "18px 32px",
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.inner}
        style={{
          textAlign: element.align || "center",

          padding: element.padding || 3,

          margin: element.margin || 0,
        }}
      >
        <a
          href={element.url || "#"}
          target={element.newTab ? "_blank" : "_self"}
          className={styles.link}
        >
          <RenderButton element={element} />
        </a>

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
        <EditButtonModal
          isOpen={open}
          onClose={() => setOpen(false)}
          element={element}
          onSave={(data) => onUpdateElement(sectionId, element.id, data)}
        />
      </div>
    </div>
  );
}
