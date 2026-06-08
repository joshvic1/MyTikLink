"use client";

import { Plus } from "lucide-react";

import styles from "../styles/addProductButton.module.css";

export default function AddProductButton({ onClick }) {
  return (
    <button className={styles.fab} onClick={onClick}>
      <Plus size={28} />
    </button>
  );
}
