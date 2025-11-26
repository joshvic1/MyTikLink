"use client";
import { useState } from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";
import styles from "@/styles/modal.module.css";

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  linkTitle,
  userPlan = "free", // <-- add plan here
  onRequestUpgrade, // <-- optional callback to open upgrade modal
}) {
  const [loading, setLoading] = useState(false);

  const isPro =
    typeof userPlan === "string" &&
    (userPlan.includes("pro") || userPlan.includes("standard"));

  const handleDelete = async () => {
    if (!isPro) {
      // User is not allowed to delete
      if (onRequestUpgrade) onRequestUpgrade();
      return;
    }

    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Link?">
      <div className={styles.verifyContainer}>
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <AlertTriangle size={40} color="#dc2626" />
        </div>

        {!isPro ? (
          <>
            <p
              style={{
                textAlign: "center",
                fontSize: "15px",
                color: "#dc2626",
              }}
            >
              Delete option is only available for Pro users.
              <br />
              <b>Upgrade to get access to this feature.</b>
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                className={styles.submitBtn}
                style={{
                  background: "linear-gradient(90deg,#6D4AFF,#8E2DE2)",
                }}
                onClick={onClose}
              >
                UPGRADE
              </button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </Modal>
  );
}
