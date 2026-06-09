// components/dashboard/StoreAnnouncementModal.jsx

"use client";

import { useRouter } from "next/router";
import { Store, X, Sparkles } from "lucide-react";

import styles from "@/styles/storeAnnouncementModal.module.css";

export default function StoreAnnouncementModal({ open, onClose }) {
  const router = useRouter();

  if (!open) return null;

  const handleNeverShowAgain = () => {
    localStorage.setItem("hideStoreAnnouncement", "true");
    onClose();
  };

  const handleGetStarted = () => {
    onClose();
    router.push("/store");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button type="button" className={styles.close} onClick={onClose}>
          <X size={16} />
        </button>

        <div className={styles.imageWrap}>
          <img
            src="/image111.png"
            alt="Mytiklink Storefront"
            className={styles.image}
          />
        </div>

        <div className={styles.texts}>
          <p className={styles.eyebrow}>
            <Sparkles size={13} />
            New on Mytiklink
          </p>

          <h2>
            You can now create an <span>online store</span>
          </h2>

          <p>
            Add products, showcase your storefront, collect payments, and manage
            customer orders directly from Mytiklink.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={handleGetStarted}
          >
            Create Store
          </button>

          <button type="button" className={styles.secondary} onClick={onClose}>
            Close
          </button>
        </div>

        <button
          type="button"
          className={styles.never}
          onClick={handleNeverShowAgain}
        >
          Never show again
        </button>
      </div>
    </div>
  );
}
