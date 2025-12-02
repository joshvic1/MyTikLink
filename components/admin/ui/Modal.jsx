"use client";

import styles from "@/styles/admin/modal.module.css";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className={styles.title}>{title}</h2>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
