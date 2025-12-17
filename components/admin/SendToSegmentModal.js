"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/admin/sendModal.module.css";

export default function SendToSegmentModal({ segmentKey, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/templates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTemplates(res.data);
    }

    loadTemplates();
  }, []);

  async function sendEmail() {
    if (!templateId) return alert("Select a template first");

    setSending(true);

    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/send-to-segment`,
        { segmentKey, templateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Queued! ${res.data.total} emails will begin sending shortly.`);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Send Email to Segment</h3>

        <p className={styles.label}>Choose email template:</p>

        <select
          className={styles.input}
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Select template</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.send}
            disabled={sending}
            onClick={sendEmail}
          >
            {sending ? "Sending..." : "Send to All Users"}
          </button>
        </div>
      </div>
    </div>
  );
}
