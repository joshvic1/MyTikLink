"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  CreditCard,
  Settings,
  ExternalLink,
  X,
} from "lucide-react";

import styles from "../styles/storeMenuDrawer.module.css";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Products",
    icon: ShoppingBag,
  },

  {
    label: "Orders",
    icon: Package,
  },

  {
    label: "Payments",
    icon: CreditCard,
  },

  {
    label: "Settings",
    icon: Settings,
  },
];

export default function StoreMenuDrawer({ open, onClose, store }) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        {/* TOP */}
        <div className={styles.top}>
          <div>
            <h2>{store?.name}</h2>

            <p>@{store?.slug}</p>
          </div>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* VISIT */}
        <a href={`/s/${store?.slug}`} target="_blank" className={styles.visit}>
          <ExternalLink size={18} />
          Visit Store
        </a>

        {/* ITEMS */}
        <div className={styles.items}>
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button key={item.label} className={styles.item}>
                <div className={styles.left}>
                  <div className={styles.iconWrap}>
                    <Icon size={18} />
                  </div>

                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
