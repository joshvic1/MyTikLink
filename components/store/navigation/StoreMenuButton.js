"use client";

import { Menu } from "lucide-react";

import styles from "../styles/storeMenuButton.module.css";

export default function StoreMenuButton({ onClick }) {
  return (
    <button className={styles.button} onClick={onClick}>
      <Menu size={24} />
    </button>
  );
}
