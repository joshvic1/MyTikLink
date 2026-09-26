"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Users, BadgeCheck, Wallet, GraduationCap, RefreshCw, ArrowUpRight, Mail, Link2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/overview.module.css";

export default function AdminDashboard() {
  const [snapshot, setSnapshot] = useState({ users: null, signups: null, stats: null, payments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    const token = localStorage.getItem("admin_token");
    if (!token) { setLoading(false); return; }
    const options = { headers: { Authorization: `Bearer ${token}` } };
    const base = process.env.NEXT_PUBLIC_API_URL;
    const results = await Promise.allSettled([
      axios.get(`${base}/admin/users?page=1&limit=1`, options),
      axios.get(`${base}/admin/tutorial-signups/count`, options),
      axios.get(`${base}/admin/payments?page=1&tab=all`, options),
    ]);
    const data = results.map((result) => result.status === "fulfilled" ? result.value.data : null);
    setSnapshot({ users: data[0]?.totalUsers ?? null, signups: data[1]?.count ?? null, stats: data[2]?.stats ?? null, payments: data[2]?.payments?.slice(0, 6) || [] });
    if (results.some((result) => result.status === "rejected")) setError("Some records could not be loaded. Refresh to try again.");
    setUpdated(new Date()); setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const count = (value) => loading ? "…" : value == null ? "—" : Number(value).toLocaleString();
  const metrics = [
    { label: "Active subscribers", value: count(snapshot.stats?.activeSubscribers), note: "Customers with an active plan", icon: BadgeCheck },
    { label: "Monthly recurring revenue", value: snapshot.stats?.mrr == null ? count(null) : `₦${count(snapshot.stats.mrr)}`, note: "From your subscription records", icon: Wallet },
    { label: "Registered users", value: count(snapshot.users), note: "People in your MyTikLink community", icon: Users },
    { label: "Tutorial signups", value: count(snapshot.signups), note: "People learning to grow with you", icon: GraduationCap },
  ];
  return <AdminLayout>
    <div className={styles.toolbar}><span>WORKSPACE SNAPSHOT<small>{updated ? `Updated ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Your latest platform activity"}</small></span>
      <button onClick={refresh} disabled={loading}><RefreshCw size={16} className={loading ? styles.spin : ""} />{loading ? "Refreshing…" : "Refresh records"}</button></div>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.metrics}>{metrics.map(({ label, value, note, icon: Icon }, index) => <article className={`${styles.metric} ${index === 0 ? styles.featured : ""}`} key={label}>
      <div className={styles.metricLabel}>{label}<Icon size={21} strokeWidth={1.7} /></div><strong>{value}</strong><p>{note}</p>
    </article>)}</div>
    <section className={styles.panel} aria-labelledby="recent-payments-title">
      <div className={styles.panelHeader}><div><h2 id="recent-payments-title">Recent payments</h2><p>The latest subscription activity across your platform.</p></div><Link href="/admin/payment" className={styles.textLink}>View all payments<ArrowUpRight size={17} /></Link></div>
      <div className={styles.tableScroll}><table className={styles.table}><thead><tr><th>Customer</th><th>Plan</th><th>Status</th><th>Date</th></tr></thead><tbody>
        {loading ? <tr><td colSpan={4} className={styles.empty}>Loading your latest records…</td></tr> : snapshot.payments.length === 0 ? <tr><td colSpan={4} className={styles.empty}>{error ? "Payment records are currently unavailable." : "No payment records yet. New activity will appear here."}</td></tr> : snapshot.payments.map((payment) => <tr key={payment._id}>
          <td><div className={styles.customer}><span className={styles.initial}>{(payment.user?.name || "?").slice(0, 1).toUpperCase()}</span><span><b>{payment.user?.name || "Unknown customer"}</b><small>{payment.user?.email || "No email available"}</small></span></div></td>
          <td className={styles.plan}>{payment.plan?.replaceAll("_", " ") || "—"}</td><td><span className={`${styles.badge} ${payment.status === "successful" ? styles.success : payment.status === "processing" ? styles.pending : styles.failed}`}>{payment.status}</span></td>
          <td className={styles.date}>{new Date(payment.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
        </tr>)}
      </tbody></table></div>
      <div className={styles.panelFooter}><span>Showing {snapshot.payments.length} recent records</span><span>All payment statuses</span></div>
    </section>
    <div className={styles.quickLinks}>{[
      { href: "/admin/users", title: "Your community", copy: "Find customers, review plans and manage accounts.", icon: Users },
      { href: "/admin/email/segment", title: "Connect with your audience", copy: "Explore email segments and manage campaigns.", icon: Mail },
      { href: "/admin/links", title: "Platform activity", copy: "Explore the links your customers are sharing.", icon: Link2 },
    ].map(({ href, title, copy, icon: Icon }) => <Link href={href} key={href} className={styles.quickLink}><Icon size={22} strokeWidth={1.6} /><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={17} /></Link>)}</div>
  </AdminLayout>;
}
