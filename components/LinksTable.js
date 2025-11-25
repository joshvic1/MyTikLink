"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import styles from "@/styles/LinksTable.module.css";

export default function LinksTable({ redirects, onDelete, onEdit }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!Array.isArray(redirects) || redirects.length === 0)
    return <p className={styles.noLinks}>No links created yet.</p>;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Short Link</th>
            <th>Target URL</th>
            <th>Clicks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {redirects.map((link) => {
            // compute values safely
            const shortLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL.replace(
              "/api",
              ""
            )}/r/${link.linkId}`;

            const targetLink =
              link.linkType === "group"
                ? `https://chat.whatsapp.com/${link.whatsappCode}`
                : `https://wa.me/${link.whatsappCode.replace(/\D/g, "")}`;

            return (
              <tr key={link._id}>
                <td>{link.title || "Untitled"}</td>
                <td>
                  <a
                    href={shortLink}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    {shortLink}
                  </a>
                </td>
                <td>{targetLink}</td>
                <td>{link.redirectCount || 0}</td>
                <td className={styles.actions}>
                  <button
                    className={`${styles.tableButton} ${styles.copyBtn}`}
                    onClick={() => handleCopy(shortLink)}
                  >
                    {copiedId === shortLink ? "Copied!" : "Copy"}
                  </button>
                  <button
                    className={`${styles.tableButton} ${styles.editBtn}`}
                    onClick={() => onEdit && onEdit(link)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.tableButton} ${styles.deleteBtn}`}
                    onClick={() => onDelete && onDelete(link._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
