"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/CreateRedirectModal.module.css";

export default function TemplateCard({
  template,
  name,
  url,
  selected,
  locked,
  onSelect,
}) {
  const [reloadKey, setReloadKey] = useState(0);

  // ✅ Loop iframe animation
  useEffect(() => {
    if (!name || !url) return;

    const interval = setInterval(() => {
      setReloadKey((k) => k + 1);
    }, 6000); // match template animation duration

    return () => clearInterval(interval);
  }, [name, url]);

  return (
    <div
      className={`${styles.templateCard} ${selected ? styles.active : ""} ${
        locked ? styles.locked : ""
      }`}
      onClick={() => !locked && onSelect(template)}
    >
      <div className={styles.templatePreview}>
        {name && url ? (
          <iframe
            key={reloadKey}
            srcDoc={template.html
              .replace(/{{title}}/g, name)
              .replace(/{{deeplink}}/g, "#")
              .replace(/{{fallback}}/g, "#")}
            sandbox="allow-same-origin allow-scripts"
            className={styles.mobileSnapshot}
          />
        ) : (
          <div className={styles.skeleton}>
            Start typing a name and WhatsApp code to preview...
          </div>
        )}
      </div>

      <div className={styles.templateInfo}>
        <h4>{template.name}</h4>
        <p>{template.description}</p>
      </div>

      {locked && (
        <div className={styles.lockOverlay}>
          🔒 {template.allowedPlans.join(", ")} only
        </div>
      )}
    </div>
  );
}
