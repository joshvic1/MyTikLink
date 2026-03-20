"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/payment.module.css";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      let url = `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?days=${days}`;

      if (startDate && endDate) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/admin/payments?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Analytics Overview</h2>

        {/* ============================= */}
        {/* FILTERS */}
        {/* ============================= */}
        <div className={styles.filterWrap}>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className={styles.filterSelect}
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.filterInput}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.filterInput}
          />

          <button onClick={fetchAnalytics} className={styles.filterBtn}>
            Apply
          </button>
        </div>

        {/* ============================= */}
        {/* TODAY STATS */}
        {/* ============================= */}
        {analytics && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Today Payments</span>
              <span className={styles.statValue}>
                {analytics.today.payments}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Today Users</span>
              <span className={styles.statValue}>{analytics.today.users}</span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Today Revenue</span>
              <span className={styles.statValue}>
                ₦{analytics.today.revenue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* RANGE STATS */}
        {/* ============================= */}
        {analytics && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Payments</span>
              <span className={styles.statValue}>
                {analytics.paymentsCount}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>New Users</span>
              <span className={styles.statValue}>
                {analytics.usersRegistered}
              </span>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Revenue</span>
              <span className={styles.statValue}>
                ₦{analytics.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {loading && <p>Loading analytics...</p>}
      </div>
    </AdminDashboardLayout>
  );
}
