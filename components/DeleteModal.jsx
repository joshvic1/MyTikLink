"use client";
import { useState } from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";
import styles from "@/styles/modal.module.css";

export default function DeleteModal({ isOpen, onClose, onConfirm, linkTitle }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm(); // wait for delete action to finish
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Link?">
      <div className={styles.verifyContainer}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <AlertTriangle size={40} color="#dc2626" />
        </div>

        <p style={{ textAlign: "center", fontSize: "15px" }}>
          Are you sure you want to delete <br />
          <b style={{ color: "#dc2626" }}>{linkTitle}</b>?
          <br />
          This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
          <button
            className={styles.submitBtn}
            onClick={handleDelete}
            disabled={loading}
            style={{
              background: "#dc2626",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>

          <button
            className={styles.cancelBtn}
            onClick={onClose}
            style={{
              background: "#e5e5e5",
              color: "#333",
            }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
