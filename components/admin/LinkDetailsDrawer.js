"use client";

import styles from "@/styles/admin/linkDrawer.module.css";
import { X } from "lucide-react";

export default function LinkDetailsDrawer({ link, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <div className={styles.header}>
          <h2>Link Details</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <p>
            <strong>Title:</strong> {link.title}
          </p>
          <p>
            <strong>Link ID:</strong> {link.linkId}
          </p>
          <p>
            <strong>Type:</strong> {link.linkType}
          </p>
          <p>
            <strong>Clicks:</strong> {link.redirectCount}
          </p>
          <p>
            <strong>Max Redirects:</strong> {link.maxRedirects}
          </p>
          <p>
            <strong>Whatsapp Code:</strong> {link.whatsappCode}
          </p>
          <p>
            <strong>Prefill:</strong> {link.prefill || "-"}
          </p>

          <hr />

          <p>
            <strong>User:</strong> {link.userId?.name} <br />
            <span className={styles.email}>{link.userId?.email}</span>
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {new Date(link.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
