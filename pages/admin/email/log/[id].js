"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/emailLogDetail.module.css";

export default function EmailLogDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [log, setLog] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadLog() {
    if (!id) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/email/logs/${id}?page=${page}&limit=30`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLog(res.data);
    } catch (e) {
      console.error("Log detail fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLog();
  }, [id, page]);

  if (!log) {
    return (
      <AdminDashboardLayout>
        <p className={styles.loading}>Loading...</p>
      </AdminDashboardLayout>
    );
  }

  const { pagination } = log;

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Back
        </button>

        <h2 className={styles.title}>Email Log Details</h2>

        {/* Email Overview */}
        <div className={styles.card}>
          <p>
            <b>Template:</b> {log.templateId?.name}
          </p>
          <p>
            <b>Subject:</b> {log.templateId?.subject}
          </p>
          <p>
            <b>Segment:</b> {log.segment}
          </p>
          <p>
            <b>Status:</b> {log.status}
          </p>
          <p>
            <b>Total Recipients:</b> {pagination.totalUsers}
          </p>
          <p>
            <b>Sent on:</b> {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Email Preview */}
        <div className={styles.previewWrap}>
          <h3>Email Preview</h3>
          <iframe className={styles.previewFrame} srcDoc={log.renderedHtml} />
        </div>

        {/* Users List */}
        <div className={styles.usersWrap}>
          <h3>
            Recipients (Page {pagination.page} of {pagination.totalPages})
          </h3>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
              </tr>
            </thead>

            <tbody>
              {log.users.map((u, index) => (
                <tr key={index}>
                  <td>{u.email}</td>
                  <td>{u.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.paginationWrap}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage(page - 1)}
              className={styles.navBtn}
            >
              ← Prev
            </button>

            <span className={styles.pageIndicator}>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className={styles.navBtn}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
