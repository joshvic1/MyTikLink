"use client";

import { useState } from "react";

import { Pencil } from "lucide-react";

import styles from "./hero.module.css";

import RenderHero from "../shared/RenderHero";

import EditHeroModal from "../modals/EditHeroModal";

export default function HeroElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <RenderHero element={element} />

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

      <EditHeroModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
