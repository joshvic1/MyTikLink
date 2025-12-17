"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/emailLogs.module.css";
import Link from "next/link";

export default function EmailLogsPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/logs?page=${page}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("LOG FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [page]);

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Email Logs</h2>

        {loading ? (
          <p className={styles.loading}>Loading logs...</p>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Template</th>
                  <th>Subject</th>
                  <th>Segment</th>
                  <th>Count</th>
                  <th>Status</th>
                  <th>View</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.templateId?.name}</td>
                    <td>{log.templateId?.subject}</td>
                    <td>{log.segment}</td>
                    <td>{log.count}</td>
                    <td>{log.status}</td>
                    <td>
                      <Link
                        href={`/admin/email/log/${log._id}`}
                        className={styles.viewBtn}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.paginationWrap}>
              <button
                disabled={page <= 1}
                className={styles.navBtn}
                onClick={() => setPage(page - 1)}
              >
                ← Prev
              </button>

              <span className={styles.pageIndicator}>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                className={styles.navBtn}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
