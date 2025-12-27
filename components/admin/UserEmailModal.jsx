"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/admin/userEmailModal.module.css";

export default function UserEmailModal({ user, onClose }) {
  const [templateKey, setTemplateKey] = useState("");
  const [html, setHtml] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState("preview");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  async function loadTemplate(key) {
    if (!key) return;
    setLoading(true);

    const token = localStorage.getItem("admin_token");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/email/templates/preview`,
      { templateKey: key, userId: user._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSubject(res.data.subject);
    setHtml(res.data.html);
    setLoading(false);
  }

  async function handleSend() {
    setSending(true);
    const token = localStorage.getItem("admin_token");

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/email/send-user`,
      { userId: user._id, templateKey, subject, html },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSending(false);
    onClose();
    alert("Email sent");
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Send Email</h3>
        <p className={styles.sub}>To: {user.email}</p>
        <div className={styles.modalBody}>
          <select
            className={styles.input}
            value={templateKey}
            onChange={(e) => {
              setTemplateKey(e.target.value);
              loadTemplate(e.target.value);
            }}
          >
            <option value="">Select template</option>
            <option value="NO_LINKS">No Links</option>
            <option value="WELCOME_EMAIL">Welcome Email</option>
            <option value="FIRST_LINK_CREATED">First Link Created</option>
            <option value="FREE_100_CLICKS">Free 100 Clicks</option>
            <option value="FREE_200_CLICKS">Free 200 Clicks</option>
            <option value="FREE_240_CLICKS">Free 240 Clicks</option>
            <option value="LINK_EXPIRED_1">Link Expired 1</option>
            <option value="LINK_EXPIRED_3">Link Expired 3</option>
            <option value="LINK_EXPIRED_7">Link Expired 7</option>
            <option value="LINK_EXPIRED_14">Link Expired 14</option>
            <option value="PAID_EXPIRY_7_DAYS">Paid Expiry 7 DAYS</option>
            <option value="PAID_EXPIRY_1_DAY">Paid Expiry 1 DAY</option>

            <option value="STANDARD_USERS">Standard Users</option>
            <option value="PRO_USERS">Pro Users</option>
          </select>

          {loading ? (
            <p>Loading…</p>
          ) : (
            <>
              <div className={styles.modes}>
                <button
                  className={mode === "preview" ? styles.active : ""}
                  onClick={() => setMode("preview")}
                >
                  Preview
                </button>
                <button
                  className={mode === "html" ? styles.active : ""}
                  onClick={() => setMode("html")}
                >
                  HTML
                </button>
              </div>

              {mode === "preview" ? (
                <iframe srcDoc={html} className={styles.previewFrame} />
              ) : (
                <textarea
                  className={styles.textarea}
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                />
              )}
            </>
          )}

          <div className={styles.footer}>
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSend} disabled={sending}>
              {sending ? "Sending…" : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
