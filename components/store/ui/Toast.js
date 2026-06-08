"use client";

import styles from "./toast.module.css";

export default function Toast({ show, text, type = "success" }) {
  if (!show) return null;

  return (
    <div
      className={`${styles.toast} ${
        type === "error" ? styles.error : styles.success
      }`}
    >
      {text}
    </div>
  );
}
