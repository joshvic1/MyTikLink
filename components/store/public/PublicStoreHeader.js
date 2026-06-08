"use client";

import { ShoppingBag, Search } from "lucide-react";

import styles from "../styles/publicStoreHeader.module.css";

export default function PublicStoreHeader({ store }) {
  return (
    <div className={styles.header}>
      <div className={styles.top}>
        <div>
          <h1>{store.name}</h1>

          <p>@{store.slug}</p>
        </div>

        <button>
          <ShoppingBag size={22} />
        </button>
      </div>

      <div className={styles.search}>
        <Search size={18} />

        <input placeholder="Search products..." />
      </div>
    </div>
  );
}
