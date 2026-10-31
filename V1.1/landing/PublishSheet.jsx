"use client";

import { useState, useEffect } from "react";

import { Modal, Button } from "../components/UI";

import styles from "@/components/custom/modals/publishSheet.module.css";

import { Rocket, Loader2 } from "lucide-react";

export default function PublishSheet({
  isOpen,
  onClose,
  onPublish,
  hasContent,
  isPro,
  onUpgrade,
  initialTitle = "",
}) {
  const [title, setTitle] = useState(initialTitle);
  useEffect(() => {
    setTitle(initialTitle || "");
  }, [initialTitle, isOpen]);
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title.trim()) return;
    if (!isPro) { onUpgrade?.(); return; }

    try {
      setLoading(true);

      await onPublish({
        title,
      });
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  if (!hasContent) {
    return (
      <Modal tone="teal" title="Publish Page" onClose={onClose}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>

          <h2 className={styles.emptyTitle}>Nothing to publish yet</h2>

          <p className={styles.emptyText}>
            You haven’t added any elements to this page yet.
          </p>

          <Button className={styles.closeBtn} onClick={onClose}>
            Continue Editing
          </Button>
        </div>
      </Modal>
    );
  }
  return (
    <Modal tone="teal" title="Publish Page" onClose={onClose}>
      <div className={styles.container}>


        <p className={styles.subtitle}>Give your page a name</p>

        <input
          type="text"
          placeholder="e.g My business Page"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <p className={styles.urlPreview}>
          {(process.env.NEXT_PUBLIC_SITE_URL || "https://mytik.link").replace(/\/$/, "")}/v1-1/p/
          <span>
            {(title || "my-awesome-page").toLowerCase().replace(/\s+/g, "-")}
          </span>
        </p>
        {!isPro && (
          <p className={styles.upgradeText}>
            Publishing requires an active Pro plan.
            <span
              className={styles.upgradeLink}
              onClick={() => {
                if (onUpgrade) onUpgrade();
              }}
            >
              Choose a plan
            </span>
          </p>
        )}
        <Button
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={loading || !title.trim()}
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
        </Button>
      </div>
    </Modal>
  );
}
