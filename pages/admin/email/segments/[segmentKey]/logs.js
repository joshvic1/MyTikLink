"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboardLayout from "@/components/admin/AdminLayout";

export default function SegmentEmailLogsPage() {
  const router = useRouter();
  const { segmentKey } = router.query;

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!segmentKey) return;

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/email/segments/${segmentKey}/logs?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      )
      .then((res) => setLogs(res.data.logs))
      .catch(console.error);
  }, [segmentKey, page]);

  return (
    <AdminDashboardLayout>
      <h2>Email History — {segmentKey}</h2>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Status</th>
            <th>Recipients</th>
            <th>Sent At</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.subject}</td>
              <td>{log.status}</td>
              <td>{log.recipientsCount}</td>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>
                <button
                  onClick={() => router.push(`/admin/email/log/${log._id}`)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminDashboardLayout>
  );
}
