"use client";

import Link from "next/link";
import { BookOpen, FileText, LayoutGrid, Menu, X } from "lucide-react";
import { useState } from "react";
import styles from "./Blog.module.css";

const items = [
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Documentation", href: "/documentation", icon: FileText },
  { label: "Features", href: "/features", icon: LayoutGrid },
];

export default function BlogNav({ current = "Blog" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.blogNav}>
      <Link href="/" className={styles.brand}>
        MyTikLink
      </Link>

      <nav className={styles.desktopNav} aria-label="Blog navigation">
        {items.map((item) => {
          const Icon = item.icon;
          const active = current === item.label;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navLink} ${active ? styles.activeNav : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className={styles.menuButton}
        aria-label="Open blog menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <nav className={styles.mobileNav} aria-label="Mobile blog navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const active = current === item.label;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${
                  active ? styles.activeNav : ""
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
