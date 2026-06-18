"use client";

import { useRouter } from "next/router";

import {
  X,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  BarChart3,
  ExternalLink,
  LogOut,
  ChevronRight,
  Paintbrush,
  Activity,
  BookOpenText,
} from "lucide-react";

import styles from "../styles/storeMenu.module.css";

export default function StoreMenu({ open, onClose, store }) {
  const router = useRouter();

  if (!open) return null;

  const items = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      action: () => router.push("/store"),
    },

    {
      icon: Package,
      label: "Products",
      action: () => router.push("/store/products"),
    },

    {
      icon: ShoppingBag,
      label: "Orders",
      action: () => router.push("/store/orders"),
    },

    {
      icon: BarChart3,
      label: "Analytics",
      action: () => router.push("#"),
    },

    {
      icon: Settings,
      label: "Settings",
      action: () => router.push("/store/settings"),
    },
    {
      icon: Paintbrush,
      label: "Store Design",
      action: () => router.push("/store/editTemplate"),
    },
    {
      icon: Activity,
      label: "Pixel/Events",
      action: () => router.push("/dashboard/tiktok-pixel"),
    },

    {
      icon: BookOpenText,
      label: "Knowledge Base",
      action: () => router.push("/blog?categoryslug=online-store"),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");

    router.push("/?auth=login");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <p className={styles.small}>Your Store</p>

            <h2>{store?.name || "My Store"}</h2>
          </div>

          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* NAV */}
        <div className={styles.nav}>
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <button key={index} className={styles.link} onClick={item.action}>
                <div className={styles.linkLeft}>
                  <Icon size={18} />

                  <span>{item.label}</span>
                </div>

                <ChevronRight size={15} />
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button
            className={styles.secondaryBtn}
            onClick={() => window.open(`/s/${store?.slug}`, "_blank")}
          >
            <ExternalLink size={17} />

            <span>Visit Store</span>
          </button>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={17} />

            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
