"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/adminPaymentAnalytics.module.css";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const averageRevenue = useMemo(() => {
    if (!analytics?.paymentsCount) return 0;
    return analytics.totalRevenue / analytics.paymentsCount;
  }, [analytics]);

  const revenuePerUser = useMemo(() => {
    if (!analytics?.usersRegistered) return 0;
    return analytics.totalRevenue / analytics.usersRegistered;
  }, [analytics]);

  const formatMoney = (amount) =>
    `₦${Number(amount || 0).toLocaleString("en-NG")}`;

  return (
    <AdminDashboardLayout>
      <main className={styles.pageWrap}>
        <section className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>Admin analytics</span>
            <h1>Payment Analytics</h1>
            <p>
              Monitor revenue, payment volume, user growth, and financial
              performance across Mytiklink.
            </p>
          </div>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? styles.spin : ""} />
            Refresh
          </button>
        </section>

        <section className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <label>Quick range</label>
            <select
              value={days}
              onChange={(e) => {
                setDays(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
            >
              <option value={1}>Today</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          <div className={styles.dateGroup}>
            <label>Start date</label>
            <div>
              <CalendarDays size={16} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.dateGroup}>
            <label>End date</label>
            <div>
              <CalendarDays size={16} />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.applyBtn}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            Apply filter
          </button>
        </section>

        {loading && (
          <section className={styles.loadingGrid}>
            <div />
            <div />
            <div />
            <div />
          </section>
        )}

        {!loading && analytics && (
          <>
            <section className={styles.todayPanel}>
              <div>
                <span>Today</span>
                <h2>{formatMoney(analytics.today?.revenue)}</h2>
                <p>
                  {analytics.today?.payments || 0} payment(s) from{" "}
                  {analytics.today?.users || 0} user(s)
                </p>
              </div>

              <div className={styles.todayIcon}>
                <Zap size={22} />
              </div>
            </section>

            <section className={styles.statsGrid}>
              <StatCard
                label="Total Revenue"
                value={formatMoney(analytics.totalRevenue)}
                icon={<Wallet size={19} />}
                tone="purple"
              />

              <StatCard
                label="Total Payments"
                value={analytics.paymentsCount}
                icon={<CreditCard size={19} />}
                tone="blue"
              />

              <StatCard
                label="New Users"
                value={analytics.usersRegistered}
                icon={<Users size={19} />}
                tone="green"
              />

              <StatCard
                label="Avg. Payment"
                value={formatMoney(averageRevenue)}
                icon={<TrendingUp size={19} />}
                tone="dark"
              />

              <StatCard
                label="Revenue Per User"
                value={formatMoney(revenuePerUser)}
                icon={<Users size={19} />}
                tone="amber"
              />

              <StatCard
                label="Today Revenue"
                value={formatMoney(analytics.today?.revenue)}
                icon={<Zap size={19} />}
                tone="pink"
              />
            </section>

            <section className={styles.insightGrid}>
              <div className={styles.insightCard}>
                <div className={styles.cardTop}>
                  <div>
                    <h3>Revenue health</h3>
                    <p>How much of this period’s activity came from revenue.</p>
                  </div>
                  <Wallet size={18} />
                </div>

                <div className={styles.bigMetric}>
                  {formatMoney(analytics.totalRevenue)}
                </div>

                <div className={styles.progressTrack}>
                  <span
                    style={{
                      width: `${Math.min(
                        (analytics.totalRevenue / 100000) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <small>Target marker: ₦100,000</small>
              </div>

              <div className={styles.insightCard}>
                <div className={styles.cardTop}>
                  <div>
                    <h3>User growth</h3>
                    <p>New registrations within the selected period.</p>
                  </div>
                  <Users size={18} />
                </div>

                <div className={styles.bigMetric}>
                  {analytics.usersRegistered}
                </div>

                <div className={styles.miniStats}>
                  <div>
                    <span>{analytics.today?.users || 0}</span>
                    <p>Today</p>
                  </div>

                  <div>
                    <span>{analytics.paymentsCount}</span>
                    <p>Payments</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {!loading && !analytics && (
          <div className={styles.empty}>
            <CreditCard size={34} />
            <h3>No analytics found</h3>
            <p>Try refreshing or selecting another date range.</p>
          </div>
        )}
      </main>
    </AdminDashboardLayout>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className={`${styles.statCard} ${styles[tone]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
