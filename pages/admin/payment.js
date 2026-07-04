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
  const [activeTab, setActiveTab] = useState("successful");
  const [remindingId, setRemindingId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [page, activeTab]);

  async function fetchPayments() {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?page=${page}&tab=${activeTab}`,
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
  async function sendReminder(paymentId) {
    try {
      setRemindingId(paymentId);

      const token = localStorage.getItem("admin_token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/payments/${paymentId}/reminder`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Reminder email sent");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send reminder");
    } finally {
      setRemindingId(null);
    }
  }
  const formatCompactMoney = (amount) => {
    const value = Number(amount || 0);

    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
    }

    if (value >= 1000) {
      return `₦${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }

    return `₦${value.toLocaleString()}`;
  };
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
              <span className={styles.statLabel}>New Subscribers</span>
              <span className={styles.statValue}>{stats.newSubscribers}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Churned Users</span>
              <span className={styles.statValue}>{stats.churnedUsers}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Retention Rate</span>
              <span className={styles.statValue}>{stats.retentionRate}%</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Churn Rate</span>
              <span className={styles.statValue}>{stats.churnRate}%</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>MRR</span>
              <span className={styles.statValue}>
                {formatCompactMoney(stats.mrr)}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>ARR</span>
              <span className={styles.statValue}>
                {formatCompactMoney(stats.arr || stats.mrr * 12)}
              </span>
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
        <div className={styles.tabs}>
          <button
            className={activeTab === "successful" ? styles.activeTab : ""}
            onClick={() => {
              setActiveTab("successful");
              setPage(1);
            }}
          >
            Successful
          </button>

          <button
            className={activeTab === "processing" ? styles.activeTab : ""}
            onClick={() => {
              setActiveTab("processing");
              setPage(1);
            }}
          >
            Processing
          </button>

          <button
            className={activeTab === "all" ? styles.activeTab : ""}
            onClick={() => {
              setActiveTab("all");
              setPage(1);
            }}
          >
            All
          </button>
        </div>
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
                {activeTab === "processing" && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "processing" ? 5 : 4}>
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "processing" ? "5" : "4"}>
                    No payments found
                  </td>
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
                            : p.status === "processing"
                              ? styles.processingBadge
                              : styles.failedBadge
                        }
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className={styles.date}>
                      {new Date(p.createdAt).toDateString()}
                    </td>
                    {activeTab === "processing" && (
                      <td>
                        <button
                          className={styles.reminderBtn}
                          onClick={() => sendReminder(p._id)}
                          disabled={remindingId === p._id}
                        >
                          {remindingId === p._id
                            ? "Sending..."
                            : "Send reminder"}
                        </button>
                      </td>
                    )}
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
