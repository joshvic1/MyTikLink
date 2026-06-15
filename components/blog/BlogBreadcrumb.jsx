import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import styles from "./Blog.module.css";

export default function BlogBreadcrumb({ items = [] }) {
  return (
    <div className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.label} className={styles.crumbItem}>
            <ChevronRight size={13} />
            {isLast || !item.href ? (
              <span>{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
