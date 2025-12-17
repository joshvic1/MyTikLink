"use client";

import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminLayout";
import styles from "@/styles/admin/email.module.css";
import axios from "axios";
import SendToSegmentModal from "@/components/admin/SendToSegmentModal";

export default function AdminEmailPage() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW STATES FOR MODAL
  const [openModal, setOpenModal] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSegments(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className={styles.pageWrap}>
        <h2 className={styles.pageTitle}>Email Automation</h2>

        {loading ? (
          <p className={styles.loading}>Loading segments...</p>
        ) : (
          <>
            {/* Segments Grid */}
            <div className={styles.grid}>
              {segments.map((seg) => (
                <div key={seg.key} className={styles.card}>
                  <div className={styles.cardHead}>
                    <h3 className={styles.cardTitle}>{seg.title}</h3>
                    <span className={styles.count}>{seg.count}</span>
                  </div>

                  <p className={styles.desc}>{seg.description}</p>

                  <div className={styles.actions}>
                    {/* FIXED BUTTON — OPEN REAL MODAL */}
                    <button
                      className={styles.btn}
                      disabled={seg.count === 0}
                      onClick={() => {
                        setActiveSegment(seg.key);
                        setOpenModal(true);
                      }}
                    >
                      Email All
                    </button>

                    <button
                      className={styles.secondary}
                      onClick={() => alert("Show users list (pagination)")}
                    >
                      View Users →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL RENDERING */}
            {openModal && (
              <SendToSegmentModal
                segmentKey={activeSegment}
                onClose={() => setOpenModal(false)}
              />
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
