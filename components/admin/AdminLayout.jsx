"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import useAdminAuth from "@/hooks/useAdminAuth";
import AdminSidebar from "./AdminSidebar";
import { adminPageFor } from "./adminNavigation";
import styles from "@/styles/admin/AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  const page = adminPageFor(pathname || "/admin");

  useEffect(() => { if (!loading && !token) router.replace("/admin/login"); }, [loading, token, router]);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1000px)");
    const sync = () => { setDesktop(media.matches); setOpen(false); };
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusable = () => [...drawer.querySelectorAll('a[href],button:not([disabled])')];
    focusable()[0]?.focus();
    function onKey(event) {
      if (event.key === "Escape") { setOpen(false); menuRef.current?.focus(); }
      if (event.key === "Tab") {
        const items = focusable(), first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (loading || !token) return null;
  function toggleMenu() {
    if (window.matchMedia("(min-width: 1000px)").matches) setCollapsed((value) => !value);
    else setOpen((value) => !value);
  }
  function closeDrawer() { setOpen(false); menuRef.current?.focus(); }

  return <div className={`${styles.wrapper} ${collapsed ? styles.collapsed : ""}`}>
    <a className={styles.skipLink} href="#admin-main">Skip to content</a>
    {open && <button className={styles.overlay} aria-label="Close navigation" onClick={closeDrawer} tabIndex={-1} />}
    <aside ref={drawerRef} id="admin-navigation" className={`${styles.sidebar} ${open ? styles.open : ""}`} aria-label="Admin navigation">
      <button type="button" className={styles.closeMenu} onClick={closeDrawer} aria-label="Close navigation"><X size={21} /></button>
      <AdminSidebar closeDrawer={closeDrawer} />
    </aside>
    <div className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <button ref={menuRef} className={styles.menuBtn} onClick={toggleMenu} aria-label="Toggle navigation" aria-controls="admin-navigation" aria-expanded={desktop ? !collapsed : open}><Menu size={22} /></button>
          <span className={styles.workspaceLabel}>Workspace</span><ChevronRight size={15} className={styles.crumbDivider} /><span>{page.name}</span>
        </div>
        <span className={styles.workspaceStatus}>Admin workspace <i aria-hidden="true" /></span>
      </header>
      <main className={styles.content} id="admin-main" tabIndex={-1}>
        <div className={styles.pageHeading}>
          <div><span className={styles.eyebrow}>MYTIKLINK ADMIN</span><h1>{page.name}</h1><p>{page.description}</p></div>
          <span className={styles.pageNumber} aria-hidden="true">{page.number}</span>
        </div>
        <div className={styles.pageBody}>{children}</div>
      </main>
    </div>
  </div>;
}
