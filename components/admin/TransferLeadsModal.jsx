"use client";

import { useState } from "react";

import axios from "axios";

import styles from "@/styles/admin/transferLeads.module.css";

export default function TransferLeadsModal({
  agents,
  currentAgent,
  onClose,
  refresh,
}) {
  const [selectedAgent, setSelectedAgent] = useState("");

  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!selectedAgent) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents/${currentAgent._id}/transfer`,
        {
          targetAgentId: selectedAgent,
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
      alert("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Transfer Leads</h2>

        <p>
          Move all leads from <strong>{currentAgent.name}</strong>
        </p>

        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
        >
          <option value="">Select target agent</option>

          {agents
            .filter((a) => a._id !== currentAgent._id)
            .map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name}
              </option>
            ))}
        </select>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>

          <button className={styles.transfer} onClick={handleTransfer}>
            {loading ? "Transferring..." : "Transfer Leads"}
          </button>
        </div>
      </div>
    </div>
  );
}
