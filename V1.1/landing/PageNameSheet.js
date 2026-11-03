"use client";

import {notify} from "../components/Notifications";
import { Modal, Button } from "../components/UI";
import { useState, useEffect } from "react";
import styles from "./EditorDialogs.module.css";

export default function PageNameSheet({
  isPro,
  onClose,
  onSave,
  onUpgrade,
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

  const normalizeUrl = (url = "") => {
    if (typeof url !== "string") return "";

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }

    return url;
  };

  const isValidUrl = (url) => {
    if (!url || typeof url !== "string") return false;

    try {
      const finalUrl = normalizeUrl(url);
      const parsed = new URL(finalUrl);

      if (!parsed.hostname.includes(".")) return false;
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

    if (!redirectUrl || !redirectUrl.trim()) {
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

      const cleaned = redirectUrl?.trim() || "";
      const finalUrl = normalizeUrl(cleaned);

      await onSave({
        title: title.trim(),
        redirectUrl: finalUrl,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal tone="lime" title="Name Your Page" description="Give your page a title and add a redirect URL for after the form is filled." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose} disabled={saving}>Back</Button><Button onClick={()=>isPro?handleSave():(notify.warning("Upgrade your account first to publish this page"),onUpgrade?.())} disabled={saving}>{saving ? "Saving..." : "Save Page"}</Button></>}>
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
            value={redirectUrl || ""}
            onChange={(e) => {
              setRedirectUrl(e.target.value);
              setLinkError("");
            }}
          />
        </div>


    </Modal>
  );
}
