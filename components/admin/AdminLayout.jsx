"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAdminAuth from "@/hooks/useAdminAuth";
import AdminSidebar from "./AdminSidebar";
import styles from "@/styles/admin/AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { token, loading } = useAdminAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) router.push("/admin/login");
  }, [loading, token, router]);

  if (loading || !token) return null;

  return (
    <div className={styles.wrapper}>
      {/* Sidebar (Desktop) */}
      <aside className={styles.sidebar}>
        <AdminSidebar />
      </aside>

      {/* Sidebar (Mobile) */}
      <div className={`${styles.mobileSidebar} ${open ? styles.open : ""}`}>
        <AdminSidebar closeDrawer={() => setOpen(false)} />
      </div>
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} />
      )}

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setOpen(true)}>
            ☰
          </button>

          <h2 className={styles.pageTitle}>TikLink Admin</h2>

          <div className={styles.avatar}>A</div>
        </header>

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
