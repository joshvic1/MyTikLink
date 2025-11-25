"use client";
import { X } from "lucide-react";
import styles from "@/styles/modal.module.css";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.title}>{title}</h2>

        {children}
      </div>
    </div>
  );
}
