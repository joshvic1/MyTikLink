"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import LeadCard from "./LeadCard";

import styles from "./agentDashboard.module.css";

export default function AgentDashboard({ agent }) {
  const [leads, setLeads] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [filter, setFilter] = useState("all");
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
  const filteredLeads = leads.filter((lead) => {
    const revealed = new Date(lead.revealAt) <= new Date();

    switch (filter) {
      case "contacted":
        return lead.contacted;

      case "not_contacted":
        return !lead.contacted && !lead.userUpgradedBeforeContact;

      case "countdown":
        return !revealed && !lead.userUpgradedBeforeContact;

      case "ready":
        return (
          revealed &&
          !lead.userUpgradedBeforeContact &&
          !!lead.user?.whatsappNumber &&
          !lead.contacted
        );

      case "upgraded":
        return lead.userUpgradedBeforeContact;

      case "earned":
        return lead.totalEarned > 0;

      case "no_number":
        return !lead.user?.whatsappNumber && !lead.userUpgradedBeforeContact;

      default:
        return true;
    }
  });
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
      <div className={styles.filters}>
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? styles.activeFilter : ""}
        >
          All
        </button>

        <button
          onClick={() => setFilter("contacted")}
          className={filter === "contacted" ? styles.activeFilter : ""}
        >
          Contacted
        </button>
        <button
          onClick={() => setFilter("ready")}
          className={filter === "ready" ? styles.activeFilter : ""}
        >
          Ready to contact
        </button>
        <button
          onClick={() => setFilter("not_contacted")}
          className={filter === "not_contacted" ? styles.activeFilter : ""}
        >
          Not Contacted
        </button>

        <button
          onClick={() => setFilter("countdown")}
          className={filter === "countdown" ? styles.activeFilter : ""}
        >
          Countdown
        </button>

        <button
          onClick={() => setFilter("upgraded")}
          className={filter === "upgraded" ? styles.activeFilter : ""}
        >
          Upgraded
        </button>

        <button
          onClick={() => setFilter("earned")}
          className={filter === "earned" ? styles.activeFilter : ""}
        >
          Earned
        </button>

        <button
          onClick={() => setFilter("no_number")}
          className={filter === "no_number" ? styles.activeFilter : ""}
        >
          No Number
        </button>
      </div>
      <div className={styles.grid}>
        {filteredLeads.slice(0, visibleCount).map((lead) => (
          <LeadCard key={lead._id} lead={lead} refresh={fetchLeads} />
        ))}
        {visibleCount < filteredLeads.length && (
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
