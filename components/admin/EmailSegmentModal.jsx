import { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/admin/emailModal.module.css";

export default function EmailSegmentModal({ segmentKey, onClose }) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [body, setBody] = useState(""); // editable body only
  const [mode, setMode] = useState("preview"); // preview | text | html
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load preview from backend
  useEffect(() => {
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments/${segmentKey}/preview`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      )
      .then((res) => {
        setSubject(res.data.subject);
        setHtml(res.data.html);

        // 🔑 Extract BODY only (safe editable area)
        const match = res.data.html.match(
          /<div style="font-size:15px[\s\S]*?>([\s\S]*?)<\/div>/
        );
        setBody(match?.[1] || "");

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [segmentKey]);
  function renderPreview(html) {
    return html
      .replace(/{{{FIRST_NAME\|there}}}/g, "John")
      .replace(/{{{PLAN}}}/g, "free")
      .replace(/{{{LINK_COUNT}}}/g, "2")
      .replace(/{{{TOTAL_CLICKS}}}/g, "137");
  }

  async function handleSend() {
    setSending(true);

    // 🔑 Re-inject edited body back into HTML
    const finalHtml =
      mode === "text"
        ? html.replace(
            /<div style="font-size:15px[\s\S]*?<\/div>/,
            `<div style="font-size:15px;line-height:1.6;color:#e6e6e6;">${body}</div>`
          )
        : html;

    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments/${segmentKey}/send`,
      {
        subject,
        html: finalHtml,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      }
    );

    setSending(false);
    onClose();
    alert("Emails sent successfully");
  }

  if (loading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER */}
        <header className={styles.header}>
          <h3>Email Segment</h3>
          <span className={styles.segment}>{segmentKey}</span>
        </header>
        <div className={styles.modalBody}>
          {/* MODE SWITCH */}
          <div className={styles.modes}>
            <button
              className={mode === "preview" ? styles.active : ""}
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
            <button
              className={mode === "text" ? styles.active : ""}
              onClick={() => setMode("text")}
            >
              Edit
            </button>
            <button
              className={mode === "html" ? styles.active : ""}
              onClick={() => setMode("html")}
            >
              HTML
            </button>
          </div>

          {/* SUBJECT */}
          <label className={styles.label}>Subject</label>
          <input
            className={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {/* PREVIEW MODE */}
          {mode === "preview" && (
            <div className={styles.preview}>
              <iframe
                title="Email Preview"
                srcDoc={renderPreview(html)}
                className={styles.previewFrame}
              />
            </div>
          )}

          {/* TEXT MODE (SAFE EDIT) */}
          {mode === "text" && (
            <>
              <label className={styles.label}>Email Content</label>
              <textarea
                className={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Edit email message content…"
              />
            </>
          )}

          {/* HTML MODE */}
          {mode === "html" && (
            <>
              <label className={styles.label}>HTML</label>
              <textarea
                className={styles.textarea}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
            </>
          )}
        </div>
        {/* FOOTER */}
        <footer className={styles.footer}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.send}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "Sending..." : "Confirm & Email All"}
          </button>
        </footer>
      </div>
    </div>
  );
}
