"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "../context/CartContext";

import styles from "../styles/floatingCart.module.css";

export default function FloatingCart({ onOpen }) {
  const { totalItems, subtotal } = useCart();

  if (totalItems < 1) return null;

  return (
    <button className={styles.fab} onClick={onOpen}>
      <div className={styles.left}>
        <ShoppingBag size={18} />

        <span>{totalItems}</span>
      </div>

      <strong>₦{subtotal.toLocaleString()}</strong>
    </button>
  );
}
