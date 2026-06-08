// elements/ImageElement
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import EditImageModal from "../modals/EditImageModal";
import styles from "./image.module.css";
import RenderImage from "../shared/RenderImage";

export default function ImageElement({
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

  const content = element.src ? (
    <div
      style={{
        padding: element.padding || 0,
        margin: element.margin || 0,
      }}
    >
      <RenderImage element={element} />
    </div>
  ) : (
    <div className={styles.placeholder} onClick={() => setOpen(true)}>
      Click to upload image
    </div>
  );

  return (
    <div
      className={styles.wrapper}
      style={{
        textAlign: element.align || "center",
      }}
    >
      {/* LINK WRAP */}
      {element.linkEnabled ? (
        <a
          href={element.url || "#"}
          target={element.newTab ? "_blank" : "_self"}
        >
          {content}
        </a>
      ) : (
        content
      )}

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
      <EditImageModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
