"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/pageNameSheet.module.css";

export default function PageNameSheet({
  isPro,
  onClose,
  onSave,
  initialTitle = "",
  initialRedirectUrl = "",
}) {
  const [title, setTitle] = useState(initialTitle);
  const [redirectUrl, setRedirectUrl] = useState(initialRedirectUrl);

  const [titleError, setTitleError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔥 THIS is what makes edit mode prefill work
  useEffect(() => {
    setTitle(initialTitle);
    setRedirectUrl(initialRedirectUrl);
  }, [initialTitle, initialRedirectUrl]);

  const normalizeUrl = (url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };

  const isValidUrl = (url) => {
    try {
      const finalUrl = normalizeUrl(url);
      const parsed = new URL(finalUrl);

      // must contain a dot in hostname (e.g. wa.me, google.com)
      if (!parsed.hostname.includes(".")) return false;

      // prevent short junk like wa1, abcd
      if (parsed.hostname.length < 4) return false;

      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (saving) return;

    let hasError = false;

    setTitleError("");
    setLinkError("");

    if (!title.trim()) {
      setTitleError("Please enter a page name");
      hasError = true;
    }

    if (!redirectUrl.trim()) {
      setLinkError("Please enter a redirect link");
      hasError = true;
    } else if (!isValidUrl(redirectUrl)) {
      setLinkError(
        "Please enter a valid URL (e.g. wa.me/234xxxx or https://google.com)",
      );
      hasError = true;
    }

    if (hasError) return;

    try {
      setSaving(true);

      const finalUrl = normalizeUrl(redirectUrl.trim());

      await onSave({
        title: title.trim(),
        redirectUrl: finalUrl,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        <h2 className={styles.title}>Name Your Page</h2>
        <p className={styles.subtitle}>
          Give your page a title and add a redirect URL you want leads to be
          directed to after filling this form (WhatsApp, Telegram or any link).
        </p>

        {/* TITLE */}
        <div className={styles.field}>
          <label className={styles.label}>Page title</label>
          {titleError && <span className={styles.error}>{titleError}</span>}
          <input
            className={styles.input}
            placeholder="e.g Free Whatsapp Class"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError("");
            }}
          />
        </div>

        {/* LINK */}
        <div className={styles.field}>
          <label className={styles.label}>Redirect link</label>
          {linkError && <span className={styles.error}>{linkError}</span>}
          <input
            className={styles.input}
            placeholder="https://wa.me/123456789"
            value={redirectUrl}
            onChange={(e) => {
              setRedirectUrl(e.target.value);
              setLinkError("");
            }}
          />
        </div>

        <button
          className={styles.button}
          onClick={handleSave}
          disabled={!isPro || saving}
        >
          {saving ? "Saving..." : "Save Page"}
        </button>

        {!isPro && (
          <p className={styles.upgradeText}>
            This feature is only available to Pro users.
            <span> Upgrade</span>
          </p>
        )}
      </div>
    </div>
  );
}
