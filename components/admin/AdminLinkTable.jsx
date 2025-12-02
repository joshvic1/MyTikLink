"use client";

import { Eye } from "lucide-react";
import styles from "@/styles/admin/links.module.css";

export default function AdminLinkTable({ links, onOpen }) {
  return (
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
            <td>{l.title || "Untitled"}</td>
            <td>{l.linkId}</td>

            <td>
              {l.userId?.name} <br />
              <span className={styles.email}>{l.userId?.email}</span>
            </td>

            <td className={styles.type + " " + l.linkType}>{l.linkType}</td>

            <td>{l.redirectCount}</td>
            <td>{l.maxRedirects}</td>

            <td>{new Date(l.createdAt).toLocaleDateString()}</td>

            <td>
              <button className={styles.viewBtn} onClick={() => onOpen(l)}>
                <Eye size={14} /> View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
