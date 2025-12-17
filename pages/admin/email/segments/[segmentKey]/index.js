import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/segmentUsers.module.css";
import EmailSegmentModal from "@/components/admin/EmailSegmentModal";

export default function SegmentUsersPage() {
  const router = useRouter();
  const { segmentKey } = router.query;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (!segmentKey) return;
    setPage(1); // reset pagination when segment changes
  }, [segmentKey]);

  useEffect(() => {
    if (!segmentKey) return;
    fetchUsers();
  }, [segmentKey, page]);

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments/${segmentKey}`,
        {
          params: { page, limit },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch segment users error:", err);
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    const token = localStorage.getItem("admin_token");

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments/${segmentKey}/export`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${segmentKey}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert("Failed to download CSV"));
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <div className={styles.header}>
          <h2 className={styles.title}>Segment: {segmentKey}</h2>

          <div className={styles.actions}>
            <button className={styles.exportBtn} onClick={downloadCSV}>
              Download CSV
            </button>

            <button
              className={styles.emailBtn}
              onClick={() => setShowModal(true)}
            >
              Email All
            </button>
            <button
              className={styles.exportBtn}
              onClick={() =>
                router.push(`/admin/email/segments/${segmentKey}/logs`)
              }
            >
              Email History
            </button>
          </div>
        </div>

        {showModal && (
          <EmailSegmentModal
            segmentKey={segmentKey}
            onClose={() => setShowModal(false)}
          />
        )}

        {loading ? (
          <p className={styles.loading}>Loading users…</p>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.plan}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.paginationWrap}>
              <button
                className={styles.navBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>

              <span className={styles.pageIndicator}>
                Page {page} of {totalPages}
              </span>

              <button
                className={styles.navBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
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
