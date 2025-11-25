"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import styles from "@/styles/paymentHistory.module.css";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch payment history");

      const data = await res.json();
      setPayments(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Payment History</h1>

      {loading ? (
        <p>Loading...</p>
      ) : payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Plan</th>
              <th>Amount (₦)</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td>{p.plan}</td>
                <td>{p.amount}</td>
                <td
                  className={
                    p.status === "successful"
                      ? styles.success
                      : p.status === "failed"
                      ? styles.failed
                      : styles.processing
                  }
                >
                  {p.status}
                </td>
                <td>{p.paymentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
