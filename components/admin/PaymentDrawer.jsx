"use client";

import { useState } from "react";

import axios from "axios";

import { X } from "lucide-react";

import styles from "@/styles/admin/paymentDrawer.module.css";

export default function PaymentDrawer({ agent, onClose, refresh }) {
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const handlePayout = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents/${agent._id}/payout`,
        {
          amount: Number(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      refresh();

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>

        <h2>Agent Payments</h2>

        <div className={styles.stats}>
          <div className={styles.card}>
            <span>Total Earnings</span>

            <strong>₦{agent.totalEarnings}</strong>
          </div>

          <div className={styles.card}>
            <span>Paid Earnings</span>

            <strong>₦{agent.paidEarnings}</strong>
          </div>

          <div className={styles.card}>
            <span>Unpaid Earnings</span>

            <strong>₦{agent.unpaidEarnings}</strong>
          </div>
        </div>

        <div className={styles.form}>
          <label>Payout Amount</label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000"
          />

          <button disabled={loading || !amount} onClick={handlePayout}>
            {loading ? "Saving..." : "Save Payout"}
          </button>
        </div>
      </div>
    </div>
  );
}
