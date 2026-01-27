"use client";

import { ExternalLink, Copy, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import styles from "@/styles/LinksCardView.module.css";

export default function PagesCardView({
  pages,
  onEdit,
  onViewLeads,
  onDelete,
}) {
  if (!pages.length) {
    return <p className={styles.noLinks}>No pages created yet.</p>;
  }

  const getLeadsClass = (count = 0) => {
    if (count === 0) return styles.leadsZero;
    if (count < 10) return styles.leadsMid;
    return styles.leadsHigh;
  };

  return (
    <div className={styles.grid}>
      {pages.map((page) => {
        const pageUrl = `${window.location.origin}/p/${page.slug}`;

        return (
          <div key={page._id} className={styles.card}>
            {/* HEADER */}
            <div className={styles.header}>
              <h4 className={styles.title}>{page.title}</h4>
            </div>

            {/* PAGE LINK */}
            <div className={styles.row}>
              <span className={styles.label}>Page link</span>

              <div className={styles.valueInline}>
                <a href={pageUrl} target="_blank" className={styles.shortLink}>
                  {pageUrl}
                  <ExternalLink size={14} className={styles.ext} />
                </a>

                <button
                  className={styles.iconBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(pageUrl);
                    toast.success("Page link copied");
                  }}
                >
                  <Copy />
                </button>
              </div>
            </div>

            {/* 🎯 REDIRECT URL */}
            {page.redirectUrl && (
              <div className={styles.row}>
                <span className={styles.label}>Redirect Url</span>

                <a
                  href={page.redirectUrl}
                  target="_blank"
                  className={`${styles.value} ${styles.truncate}`}
                  title={page.redirectUrl}
                >
                  {page.redirectUrl}
                </a>
              </div>
            )}

            {/* ACTIONS */}
            <div className={styles.actions}>
              <button className={styles.pillBtn} onClick={() => onEdit(page)}>
                <Pencil size={14} />
                Edit
              </button>

              {/* 🔢 VIEW LEADS + COUNT */}
              <button
                className={styles.pillBtn}
                onClick={() => onViewLeads(page)}
              >
                <Users size={14} />
                View Leads
                <span
                  className={`${styles.leadsBadgeInline} ${getLeadsClass(
                    page.leadsCount || 0,
                  )}`}
                >
                  {page.leadsCount || 0}
                </span>
              </button>

              <button
                className={styles.iconDanger}
                onClick={() => onDelete(page)}
              >
                <Trash2 />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
