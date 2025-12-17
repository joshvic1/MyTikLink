"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/emailSend.module.css";

export default function SendEmailToSegmentPage() {
  const [segments, setSegments] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  const [recipientCount, setRecipientCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch all segments + templates
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("admin_token");

        const [segRes, tplRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/segments`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/templates`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        setSegments(segRes.data);
        setTemplates(tplRes.data);
      } catch (err) {
        console.error("LOAD DATA ERROR:", err);
      }
    }

    loadData();
  }, []);

  // Fetch preview HTML when template is selected
  useEffect(() => {
    async function loadPreview() {
      if (!selectedTemplate) return;
      try {
        const token = localStorage.getItem("admin_token");

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/templates/${selectedTemplate}/preview`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPreviewHtml(res.data.html);
      } catch (err) {
        console.error("PREVIEW ERROR:", err);
      }
    }

    loadPreview();
  }, [selectedTemplate]);

  // Fetch recipient count when segment changes
  useEffect(() => {
    async function loadCount() {
      if (!selectedSegment) return;

      setLoadingCount(true);

      try {
        const token = localStorage.getItem("admin_token");

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/segments/${selectedSegment}/count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRecipientCount(res.data.count);
      } catch (err) {
        console.error("COUNT ERROR:", err);
      } finally {
        setLoadingCount(false);
      }
    }

    loadCount();
  }, [selectedSegment]);

  // Send email to segment
  async function handleSend() {
    if (!selectedSegment || !selectedTemplate) {
      alert("Please select a segment and template.");
      return;
    }
    if (recipientCount === 0) {
      alert("No users in this segment.");
      return;
    }

    if (!confirm("Are you sure you want to send this email now?")) return;

    setSending(true);

    try {
      const token = localStorage.getItem("admin_token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/send`,
        {
          segment: selectedSegment,
          templateId: selectedTemplate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Email queued successfully!");
    } catch (err) {
      console.error("SEND ERROR:", err);
      alert("Failed to queue email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Send Email to Segment</h2>

        {/* Select Segment */}
        <div className={styles.field}>
          <label>Choose Segment</label>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className={styles.input}
          >
            <option value="">Select segment…</option>
            {segments.map((seg) => (
              <option key={seg._id} value={seg._id}>
                {seg.name}
              </option>
            ))}
          </select>

          {loadingCount ? (
            <span className={styles.info}>Loading count…</span>
          ) : selectedSegment ? (
            <span className={styles.info}>
              {recipientCount} users in this segment
            </span>
          ) : null}
        </div>

        {/* Select Template */}
        <div className={styles.field}>
          <label>Select Template</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className={styles.input}
          >
            <option value="">Select template…</option>
            {templates.map((tpl) => (
              <option key={tpl._id} value={tpl._id}>
                {tpl.name} — ({tpl.subject})
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {previewHtml && (
          <div className={styles.previewWrap}>
            <h3>Email Preview</h3>
            <iframe
              className={styles.previewFrame}
              srcDoc={previewHtml}
            ></iframe>
          </div>
        )}

        {/* Send Button */}
        <button
          className={styles.sendBtn}
          disabled={sending || !selectedSegment || !selectedTemplate}
          onClick={handleSend}
        >
          {sending ? "Sending..." : "Send Email"}
        </button>
      </div>
    </AdminDashboardLayout>
  );
}
