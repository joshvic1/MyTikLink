"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/pages.module.css";

export default function AdminPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPages();
  }, [page, search]);

  async function fetchPages() {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/pages`,
        {
          params: { page, limit: 20, search },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPages(res.data.pages || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch pages error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>
          Pages <span className={styles.count}>({total})</span>
        </h2>

        <div className={styles.filters}>
          <input
            className={styles.input}
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className={styles.loading}>Loading pages...</p>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>User</th>
                    <th>Template</th>
                    <th>Date</th>
                    <th>View</th>
                  </tr>
                </thead>

                <tbody>
                  {pages.map((p) => (
                    <tr key={p._id}>
                      <td className={styles.titleCell}>{p.title}</td>
                      <td className={styles.linkId}>{p.slug}</td>
                      <td className={styles.userCell}>
                        <span className={styles.userName}>
                          {p.user?.name || "—"}
                        </span>
                        <span className={styles.email}>{p.user?.email}</span>
                      </td>
                      <td>{p.templateId?.name || "—"}</td>
                      <td className={styles.date}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <a
                          className={styles.viewBtn}
                          href={`/p/${p.slug}`}
                          target="_blank"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.paginationWrap}>
              <button
                className={styles.navBtn}
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Prev
              </button>

              <span className={styles.pageIndicator}>
                Page {page} of {totalPages}
              </span>

              <button
                className={styles.navBtn}
                disabled={page >= totalPages}
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
