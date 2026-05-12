"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import LeadCard from "./LeadCard";

import styles from "./agentDashboard.module.css";

export default function AgentDashboard({ agent }) {
  const [leads, setLeads] = useState([]);

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

      setLeads(res.data);
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

      <div className={styles.grid}>
        {leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} refresh={fetchLeads} />
        ))}
      </div>
    </div>
  );
}
