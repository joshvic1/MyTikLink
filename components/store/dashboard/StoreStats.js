"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";

import styles from "../styles/storeStats.module.css";

import { getStoreStats } from "@/services/storeService";

import toast from "react-hot-toast";
import {
  getLowStockProducts,
  updateProductStock,
} from "@/services/productService";
import LowStockModal from "./LowStockModal";
import RevenueChart from "./RevenueChart";
export default function StoreStats({ range }) {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const data = await getStoreStats(token, range);
        setStats(data);
      } catch (err) {
        console.log(err);
      }
    };

    loadStats();
  }, [range]);
  const loadLowStockProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const data = await getLowStockProducts(token);

      console.log("LOW STOCK:", data);

      setLowStockProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  const cards = [
    {
      title: "Total Orders",
      value: stats?.orders || 0,
      growth: stats?.ordersGrowth || 0,
      icon: ShoppingBag,
      color: "purple",
      type: "growth",
    },

    {
      title: "Products",
      value: stats?.products || 0,
      icon: Package,
      color: "blue",
      type: "products",
    },

    {
      title: "Customers",
      value: stats?.customers || 0,
      growth: stats?.customerGrowth || 0,
      icon: Users,
      color: "orange",
      type: "growth",
    },

    {
      title: "Low Stock",
      value: stats?.lowStock || 0,
      icon: AlertTriangle,
      color: "green",
      type: "lowstock",
    },
  ];
  const handleStockUpdate = async (product, amount) => {
    try {
      const token = localStorage.getItem("token");

      await updateProductStock(product._id, Number(amount), token);

      toast.success("Stock updated");

      await loadLowStockProducts();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update stock");
    }
  };
  return (
    <section className={styles.section}>
      {/* REVENUE */}
      <div className={styles.revenueCard}>
        <div className={styles.revenueTop}>
          <div>
            <p className={styles.small}>Total Earnings</p>

            <h2>₦{Number(stats?.revenue || 0).toLocaleString()}</h2>

            <div
              className={stats?.revenueGrowth >= 0 ? styles.up : styles.down}
            >
              {stats?.revenueGrowth >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}

              <span>{Math.abs(stats?.revenueGrowth || 0)}%</span>

              <small>vs previous period</small>
            </div>
          </div>

          <div className={styles.rangeBadge}>{range}</div>
        </div>

        <div className={styles.graphWrap}>
          <RevenueChart
            data={stats?.revenueChart || []}
            positive={stats?.revenueGrowth >= 0}
          />
        </div>
      </div>

      {/* STATS */}
      <div className={styles.grid}>
        {cards.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className={styles.card}>
              <div className={`${styles.iconWrap} ${styles[item.color]}`}>
                <Icon size={18} />
              </div>

              <p>{item.title}</p>

              <h3>{item.value}</h3>

              {item.type === "growth" ? (
                <span className={item.growth >= 0 ? styles.up : styles.down}>
                  {item.growth >= 0 ? (
                    <TrendingUp size={13} />
                  ) : (
                    <TrendingDown size={13} />
                  )}
                  {Math.abs(item.growth)}%
                </span>
              ) : item.type === "products" ? (
                <button
                  className={styles.linkBtn}
                  onClick={() => router.push("/store/products")}
                >
                  View All
                  <ArrowUpRight size={13} />
                </button>
              ) : (
                <button
                  className={styles.linkBtn}
                  onClick={async () => {
                    await loadLowStockProducts();

                    setLowStockOpen(true);
                  }}
                >
                  View Items
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <LowStockModal
        open={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        products={lowStockProducts}
        onEdit={handleStockUpdate}
      />
    </section>
  );
}
