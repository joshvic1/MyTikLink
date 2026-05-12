"use client";

import { useState } from "react";

import axios from "axios";

import styles from "@/styles/admin/createAgentModal.module.css";

export default function CreateAgentModal({ onClose, refresh }) {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents`,
        {
          name,
          email,
          password,
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
      alert(err.response?.data?.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Create Agent</h2>

        <input
          placeholder="Agent name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>
            Cancel
          </button>

          <button onClick={handleCreate} className={styles.create}>
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
