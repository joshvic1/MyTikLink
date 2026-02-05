// frontend/components/PagesCardView.jsx
"use client";

import { forwardRef } from "react";
import { ExternalLink, Copy, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import styles from "@/styles/LinksCardView.module.css";

const PagesCardView = forwardRef(function PagesCardView(
  {
    pages = [],
    onEdit,
    onViewLeads,
    onDelete,
    horizontal = false, // ✅ NEW
  },
  ref,
) {
  if (!pages.length) {
    return <p className={styles.noLinks}>No pages created yet.</p>;
  }

  const getLeadsClass = (count = 0) => {
    if (count === 0) return styles.leadsZero;
    if (count < 10) return styles.leadsMid;
    return styles.leadsHigh;
  };

  return (
    <div
      ref={horizontal ? ref : null} // ✅ key fix
      className={`${styles.grid} ${horizontal ? styles.horizontalGrid : ""}`}
    >
      {pages.map((page) => {
        const pageUrl = `${window.location.origin}/p/${page.slug}`;

        return (
          <div key={page._id} className={styles.card}>
            <div className={styles.header}>
              <h4 className={styles.title}>{page.title}</h4>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Page link</span>

              <div className={styles.valueInline}>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.shortLink}
                >
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
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {page.redirectUrl && (
              <div className={styles.row}>
                <span className={styles.label}>Redirect Url</span>

                <a
                  href={page.redirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.value} ${styles.truncate}`}
                >
                  {page.redirectUrl}
                </a>
              </div>
            )}

            <div className={styles.actions}>
              <button className={styles.pillBtn} onClick={() => onEdit(page)}>
                <Pencil size={14} />
                Edit
              </button>

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
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default PagesCardView;
