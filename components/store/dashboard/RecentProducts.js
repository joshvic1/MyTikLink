"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

import styles from "../styles/recentProducts.module.css";

import { getRecentProducts } from "@/services/productService";

import { getRecentOrders } from "@/services/orderService";
export default function RecentProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const data = await getRecentOrders(token);

      setOrders(data || []);
    } catch (err) {
      console.log(err);
    }
  };
  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const data = await getRecentProducts(token);

      setProducts(data || []);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);
  return (
    <div className={styles.sections}>
      {/* =========================
          RECENT ORDERS
      ========================= */}
      <section className={styles.wrapper}>
        <div className={styles.top}>
          <h2>Recent Orders</h2>

          <Link href="/store/orders">
            <button>View All</button>
          </Link>
        </div>

        <div className={styles.list}>
          {orders.map((item) => (
            <div
              key={item._id}
              className={styles.order}
              onClick={() => router.push(`/store/orders`)}
            >
              <div className={styles.left}>
                <img
                  src={item.items?.[0]?.image || "/placeholder.png"}
                  alt=""
                />

                <div>
                  <h3>{item.orderNumber}</h3>

                  <p>{item.customerName}</p>
                </div>
              </div>

              <div className={styles.right}>
                <span className={`${styles.status} ${styles[item.status]}`}>
                  {item.status}
                </span>

                <strong>₦{Number(item.subtotal || 0).toLocaleString()}</strong>
              </div>

              <ChevronRight size={18} />
            </div>
          ))}
          {!orders.length && <div className={styles.empty}>No orders yet</div>}
        </div>
      </section>

      {/* =========================
          RECENT PRODUCTS
      ========================= */}
      <section className={styles.wrapper}>
        <div className={styles.top}>
          <h2>Recent Products</h2>

          <Link href="/store/products">
            <button>View All</button>
          </Link>
        </div>

        <div className={styles.list}>
          {products.map((item) => (
            <div
              key={item._id}
              className={styles.order}
              onClick={() => router.push(`/store/products`)}
            >
              <div className={styles.left}>
                <img
                  src={item.images?.[0] || "/placeholder.png"}
                  alt={item.name}
                />

                <div>
                  <h3>{item.name}</h3>

                  <p>{item.category}</p>
                </div>
              </div>

              <div className={styles.right}>
                <strong>₦{Number(item.price).toLocaleString()}</strong>
              </div>

              <ChevronRight size={18} />
            </div>
          ))}

          {!products.length && (
            <div className={styles.empty}>No products yet</div>
          )}
        </div>
      </section>
    </div>
  );
}
