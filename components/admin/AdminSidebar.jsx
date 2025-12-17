"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid,
  Users,
  Link as LinkIcon,
  CreditCard,
  Settings,
  LogOut,
  Mail,
} from "lucide-react";
import styles from "@/styles/admin/AdminLayout.module.css";
import useAdminAuth from "@/hooks/useAdminAuth";

export default function AdminSidebar({ closeDrawer }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const nav = [
    { name: "Dashboard", href: "/admin", icon: <Grid size={18} /> },
    { name: "Users", href: "/admin/users", icon: <Users size={18} /> },
    { name: "Links", href: "/admin/links", icon: <LinkIcon size={18} /> },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: <CreditCard size={18} />,
    },

    {
      name: "Email Segment",
      href: "/admin/email/segment",
      icon: <Mail size={18} />,
    },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
  ];

  return (
    <nav className={styles.sidebarInner}>
      <h1 className={styles.logo}>TikLink Admin</h1>

      <ul className={styles.menuList}>
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => closeDrawer?.()}
              className={`${styles.menuItem} ${
                pathname === item.href ? styles.active : ""
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      <button className={styles.logoutBtn} onClick={logout}>
        <LogOut size={16} />
        Logout
      </button>
    </nav>
  );
}
