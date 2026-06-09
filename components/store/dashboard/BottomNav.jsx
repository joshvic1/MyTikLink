"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { House, ShoppingBag, Plus, Package, Ellipsis } from "lucide-react";

import styles from "../styles/bottomNav.module.css";

export default function BottomNav({ onAddProduct }) {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/store/order");
    router.prefetch("/store/orders");
    router.prefetch("/store/settings");
  }, [router]);
  const pathname = router.pathname;

  return (
    <nav className={styles.nav}>
      {/* HOME */}
      <button
        className={pathname === "/store" ? styles.active : ""}
        onClick={() => router.push("/store")}
      >
        <House size={20} />
        <span>Home</span>
      </button>

      {/* ORDERS */}
      <button
        className={pathname === "/store/orders" ? styles.active : ""}
        onClick={() => router.push("/store/orders")}
      >
        <ShoppingBag size={20} />
        <span>Orders</span>
      </button>

      {/* ADD PRODUCT */}
      <button className={styles.centerBtn} onClick={() => onAddProduct?.()}>
        <Plus size={26} />
      </button>

      {/* PRODUCTS */}
      <button
        className={pathname === "/store/products" ? styles.active : ""}
        onClick={() => router.push("/store/products")}
      >
        <Package size={20} />
        <span>Products</span>
      </button>

      {/* MORE */}
      <button
        className={pathname === "/store/settings" ? styles.active : ""}
        onClick={() => router.push("/store/settings")}
      >
        <Ellipsis size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
