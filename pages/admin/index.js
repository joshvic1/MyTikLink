"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  const [tutorialSignupCount, setTutorialSignupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutorialSignupCount();
  }, []);

  const fetchTutorialSignupCount = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/tutorial-signups/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTutorialSignupCount(res.data.count || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>

      <div
        style={{
          marginTop: "24px",
          padding: "20px",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "16px",
          background: "#fff",
          maxWidth: "320px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Tutorial Signups
        </p>

        <h2
          style={{
            margin: "8px 0 0",
            color: "#0f172a",
            fontSize: "34px",
            fontWeight: 900,
          }}
        >
          {loading ? "..." : tutorialSignupCount.toLocaleString()}
        </h2>
      </div>
    </AdminLayout>
  );
}
