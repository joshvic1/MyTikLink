"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { adminNavigation, adminPageFor } from "./adminNavigation";
import styles from "@/styles/admin/AdminLayout.module.css";
import useAdminAuth from "@/hooks/useAdminAuth";

export default function AdminSidebar({ closeDrawer }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();
  const current = adminPageFor(pathname || "/admin");
  return <nav className={styles.sidebarInner} aria-label="Admin workspace">
    <Link href="/admin" className={styles.brand} onClick={closeDrawer}>
      <span className={styles.brandMark}>m<span>.</span></span>
      <span><strong>MyTikLink</strong><small>BUSINESS WORKSPACE</small></span>
    </Link>
    <span className={styles.navLabel}>WORKSPACE</span>
    <ul className={styles.menuList}>{adminNavigation.map(({ name, href, icon: Icon }) => <li key={href}>
      <Link href={href} onClick={closeDrawer} aria-current={current.href === href ? "page" : undefined} className={`${styles.menuItem} ${current.href === href ? styles.active : ""}`}>
        <Icon size={21} strokeWidth={1.7} /><span>{name}</span>
      </Link>
    </li>)}</ul>
    <div className={styles.sidebarFooter}><span className={styles.adminIdentity}><ShieldCheck size={19} /><span>Administrator<small>Manage your workspace</small></span></span>
      <button className={styles.logoutBtn} onClick={() => { logout(); router.replace("/admin/login"); }}><LogOut size={18} />Sign out</button>
    </div>
  </nav>;
}
