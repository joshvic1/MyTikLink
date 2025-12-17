"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/emailSegments.module.css";

export default function AdminEmailIndexPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments();
  }, []);

  async function fetchSegments() {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSegments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch segments", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Email Segments</h2>
        <p className={styles.subTitle}>
          Target users based on behaviour, activity & lifecycle
        </p>

        {loading ? (
          <p className={styles.loading}>Loading segments...</p>
        ) : (
          <div className={styles.grid}>
            {segments.map((seg) => (
              <div key={seg.key} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.segmentKey}>{seg.key}</span>
                  <span className={styles.countBadge}>{seg.count}</span>
                </div>

                <h3 className={styles.cardTitle}>{seg.label}</h3>

                <Link
                  href={`/admin/email/segments/${seg.key}`}
                  className={styles.viewBtn}
                >
                  View users →
                </Link>
              </div>
            ))}

            {segments.length === 0 && (
              <div className={styles.empty}>No segments found</div>
            )}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
