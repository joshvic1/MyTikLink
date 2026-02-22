"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/payment.module.css";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [page]);

  async function fetchPayments() {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPayments(res.data.payments);
      setStats(res.data.stats);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Payment Analytics</h2>

        {/* ============================= */}
        {/* STATS CARDS */}
        {/* ============================= */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active Subscribers</span>
              <span className={styles.statValue}>
                {stats.activeSubscribers}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Lifetime Paying Users</span>
              <span className={styles.statValue}>
                {stats.lifetimePayingUsers}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Retention Rate</span>
              <span className={styles.statValue}>{stats.retentionRate}%</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Churn Rate</span>
              <span className={styles.statValue}>{stats.churnRate}%</span>
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* REVENUE BREAKDOWN */}
        {/* ============================= */}
        {/* {stats?.revenueByPlan?.length > 0 && (
          <div className={styles.revenueWrap}>
            <h3 className={styles.sectionTitle}>Revenue by Plan</h3>
            <div className={styles.revenueGrid}>
              {stats.revenueByPlan.map((r) => (
                <div key={r._id} className={styles.revenueCard}>
                  <span className={styles.planName}>{r._id}</span>
                  <span className={styles.revenueAmount}>
                    ₦{(r.totalRevenue || 0).toLocaleString()}
                  </span>
                  <span className={styles.smallText}>{r.count} payments</span>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* ============================= */}
        {/* PAYMENTS TABLE */}
        {/* ============================= */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="4">No payments found</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td className={styles.userCell}>
                      <span className={styles.userName}>
                        {p.user?.name || "Unknown"}
                      </span>
                      <span className={styles.email}>{p.user?.email}</span>
                    </td>

                    <td>{p.plan}</td>

                    <td>
                      <span
                        className={
                          p.status === "successful"
                            ? styles.successBadge
                            : styles.failedBadge
                        }
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className={styles.date}>
                      {new Date(p.createdAt).toDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ============================= */}
        {/* PAGINATION */}
        {/* ============================= */}
        <div className={styles.paginationWrap}>
          <button
            className={styles.navBtn}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span className={styles.pageIndicator}>
            Page {page} of {totalPages}
          </span>

          <button
            className={styles.navBtn}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
