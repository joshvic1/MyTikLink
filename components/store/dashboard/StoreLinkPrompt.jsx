"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

import styles from "./storeLinkPrompt.module.css";

export default function StoreLinkPrompt({ slug }) {
  const [copied, setCopied] = useState(false);

  if (!slug) return null;

  const storeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${slug}`
      : `/s/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.icon}>
        <Link2 size={16} />
      </div>

      <div className={styles.text}>
        <h3>Share your store link</h3>
        <p>{storeUrl}</p>
      </div>

      <button type="button" className={styles.button} onClick={copyLink}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
