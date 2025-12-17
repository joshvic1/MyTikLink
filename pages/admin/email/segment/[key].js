"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/segmentUsers.module.css";
import SendToSegmentModal from "@/components/admin/SendToSegmentModal";
import toast from "react-hot-toast";

export default function SegmentUsersPage() {
  const router = useRouter();
  const { key } = useParams();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const segmentMap = {
    no_links: "Users With No Links",
    click_20: "Users with 20+ Clicks",
    click_100: "Users with 100+ Clicks",
    click_200: "Users with 200+ Clicks",
    click_240: "Users Near Expiry (240 Clicks)",
    expiring_7days: "Paid Users Expiring Soon",
    expired: "Expired Users",
  };

  async function loadUsers() {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segment/${key}/users?page=${page}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(res.data.users);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Segment users load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [key, page]);

  return (
    <AdminDashboardLayout>
      <button className={styles.sendBtn} onClick={() => setShowSendModal(true)}>
        Send Email to All Users
      </button>

      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>
          {segmentMap[key]} <span className={styles.count}>({total})</span>
        </h2>

        {loading ? (
          <p className={styles.loading}>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found in this segment.</p>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.plan || "free"}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
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
      {showSendModal && (
        <SendToSegmentModal
          segmentKey={key}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </AdminDashboardLayout>
  );
}
