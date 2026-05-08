"use client";

import { useState } from "react";

import BottomSheet from "../ui/BottomSheet";

import styles from "./publishSheet.module.css";

import { Rocket, Loader2 } from "lucide-react";

export default function PublishSheet({
  isOpen,
  onClose,
  onPublish,
  hasContent,
  isPro,
  onUpgrade,
}) {
  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);

      await onPublish({
        title,
      });
    } finally {
      setLoading(false);
    }
  };
  if (!hasContent) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>

          <h2 className={styles.emptyTitle}>Nothing to publish yet</h2>

          <p className={styles.emptyText}>
            You haven’t added any elements to this page yet.
          </p>

          <button className={styles.closeBtn} onClick={onClose}>
            Continue Editing
          </button>
        </div>
      </BottomSheet>
    );
  }
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2 className={styles.title}>Publish Page</h2>

        <p className={styles.subtitle}>Give your page a name</p>

        <input
          type="text"
          placeholder="e.g My business Page"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <p className={styles.urlPreview}>
          https://mytiklink.com/p/
          <span>
            {(title || "my-awesome-page").toLowerCase().replace(/\s+/g, "-")}
          </span>
        </p>
        {!isPro && (
          <p className={styles.upgradeText}>
            Pages can only be created by Pro users.
            <span
              className={styles.upgradeLink}
              onClick={() => {
                if (onUpgrade) onUpgrade();
              }}
            >
              Upgrade to Pro
            </span>
          </p>
        )}
        <button
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={loading || !title.trim() || !isPro}
        >
          {loading ? (
            <>
              <Loader2 size={18} className={styles.spin} />
              Publishing...
            </>
          ) : (
            <>
              <Rocket size={18} />
              Publish
            </>
          )}
        </button>
      </div>
    </BottomSheet>
  );
}
