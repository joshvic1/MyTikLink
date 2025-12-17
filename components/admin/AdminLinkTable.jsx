"use client";

import { Eye } from "lucide-react";
import styles from "@/styles/admin/links.module.css";

export default function AdminLinkTable({ links, onOpen }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Link ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Clicks</th>
            <th>Max</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {links.map((l) => (
            <tr key={l._id}>
              {/* TITLE */}
              <td className={styles.titleCell}>{l.title || "Untitled"}</td>

              {/* LINK ID */}
              <td className={styles.linkId}>{l.linkId}</td>

              {/* USER */}
              <td>
                <div className={styles.userCell}>
                  <span className={styles.userName}>
                    {l.userId?.name || "—"}
                  </span>
                  <span className={styles.email}>{l.userId?.email || ""}</span>
                </div>
              </td>

              {/* TYPE */}
              <td>
                <span className={`${styles.type} ${styles[l.linkType]}`}>
                  {l.linkType}
                </span>
              </td>

              {/* CLICKS */}
              <td>{l.redirectCount}</td>

              {/* MAX */}
              <td>{l.maxRedirects}</td>

              {/* CREATED */}
              <td className={styles.date}>
                {new Date(l.createdAt).toLocaleDateString()}
              </td>

              {/* ACTION */}
              <td>
                <button className={styles.viewBtn} onClick={() => onOpen(l)}>
                  <Eye size={14} />
                  <span>View</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
