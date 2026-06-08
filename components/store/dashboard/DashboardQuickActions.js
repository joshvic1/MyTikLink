"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { Plus, ShoppingBag, Tag, Settings } from "lucide-react";

import styles from "../styles/dashboardActions.module.css";

export default function DashboardQuickActions({ onAddProduct }) {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/store/orders");

    router.prefetch("/store/settings");
  }, []);
  const actions = [
    {
      label: "Add Product",
      icon: Plus,
      color: "purple",

      action: () => {
        onAddProduct?.();
      },
    },

    {
      label: "View Orders",
      icon: ShoppingBag,
      color: "blue",

      action: () => {
        router.push("/store/order");
      },
    },

    {
      label: "Discounts",
      icon: Tag,
      color: "green",

      disabled: true,
    },

    {
      label: "Store Settings",
      icon: Settings,
      color: "orange",

      action: () => {
        router.push("/store/settings");
      },
    },
  ];

  return (
    <section className={styles.wrapper}>
      <h2>Quick Actions</h2>

      <div className={styles.grid}>
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <button
              type="button"
              key={index}
              className={`${styles.card} ${
                action.disabled ? styles.disabled : ""
              }`}
              onClick={action.action}
              disabled={action.disabled}
            >
              {" "}
              <div className={`${styles.iconWrap} ${styles[action.color]}`}>
                <Icon size={18} />
              </div>
              <span>{action.label}</span>
              {action.disabled && <small>Coming Soon</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
