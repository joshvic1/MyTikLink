"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import LeadCard from "./LeadCard";

import styles from "./agentDashboard.module.css";

export default function AgentDashboard({ agent }) {
  const [leads, setLeads] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    paidEarnings: 0,
    unpaidEarnings: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("agentToken");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/leads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLeads(res.data.leads || []);

      setStats(
        res.data.stats || {
          totalEarnings: 0,
          paidEarnings: 0,
          unpaidEarnings: 0,
        },
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Welcome, {agent.name} 👋</h1>

        <p>Assigned leads appear below</p>
      </div>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.blueCard}`}>
          <div className={styles.statTop}>
            <span>Total Earned</span>

            <div className={styles.statIcon}>₦</div>
          </div>

          <strong>₦{stats.totalEarnings}</strong>
        </div>

        <div className={`${styles.statCard} ${styles.greenCard}`}>
          <div className={styles.statTop}>
            <span>Paid</span>

            <div className={styles.statIcon}>✓</div>
          </div>

          <strong>₦{stats.paidEarnings}</strong>
        </div>

        <div className={`${styles.statCard} ${styles.orangeCard}`}>
          <div className={styles.statTop}>
            <span>Pending</span>

            <div className={styles.statIcon}>⏳</div>
          </div>

          <strong>₦{stats.unpaidEarnings}</strong>
        </div>
      </div>
      <div className={styles.grid}>
        {leads.slice(0, visibleCount).map((lead) => (
          <LeadCard key={lead._id} lead={lead} refresh={fetchLeads} />
        ))}
        {visibleCount < leads.length && (
          <button
            className={styles.loadMoreBtn}
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
