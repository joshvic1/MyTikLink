"use client";

import styles from "../styles/productGrid.module.css";
import Link from "next/link";

export default function ProductGrid({ products }) {
  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/s/${product.storeSlug || ""}/${product.slug}`}
          className={styles.card}
        >
          {" "}
        </Link>
      ))}
    </div>
  );
}
