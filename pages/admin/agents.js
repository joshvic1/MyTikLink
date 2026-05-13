"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import AdminLayout from "@/components/admin/AdminLayout";

import styles from "@/styles/admin/agents.module.css";
import AgentLeadsDrawer from "@/components/admin/AgentLeadsDrawer";
import CreateAgentModal from "@/components/admin/CreateAgentModal";
import TransferLeadsModal from "@/components/admin/TransferLeadsModal";
import PaymentDrawer from "@/components/admin/PaymentDrawer";
export default function AgentsPage() {
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [agentLeads, setAgentLeads] = useState([]);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [transferAgent, setTransferAgent] = useState(null);

  const [showPayments, setShowPayments] = useState(false);
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAgents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const openLeads = async (agent) => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents/${agent._id}/leads`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedAgent(agent);

      setAgentLeads(res.data);

      setShowDrawer(true);
    } catch (err) {
      console.error(err);
    }
  };
  const toggleAgent = async (agent) => {
    try {
      const token = localStorage.getItem("admin_token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents/${agent._id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAgent = async (id) => {
    const confirmDelete = confirm("Delete this agent?");

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("admin_token");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/agents/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchAgents();
    } catch (err) {
      console.error(err);
    }
  };
  const openTransfer = (agent) => {
    setTransferAgent(agent);

    setShowTransfer(true);
  };
  const openPayments = (agent) => {
    setSelectedAgent(agent);

    setShowPayments(true);
  };
  return (
    <AdminLayout>
      <div className={styles.page}>
        <div className={styles.top}>
          <h1>Agents</h1>

          <button onClick={() => setShowCreate(true)}>+ Create Agent</button>
        </div>

        {loading ? (
          <p>Loading agents...</p>
        ) : agents.length === 0 ? (
          <p>No agents found.</p>
        ) : (
          <div className={styles.grid}>
            {agents.map((agent) => (
              <div key={agent._id} className={styles.card}>
                <h3>{agent.name}</h3>

                <div
                  className={`${styles.status} ${
                    agent.isActive ? styles.active : styles.inactive
                  }`}
                >
                  {agent.isActive ? "Active" : "Inactive"}
                </div>

                <div className={styles.stats}>
                  <div>
                    <strong>{agent.totalLeads}</strong>

                    <span>Leads</span>
                  </div>

                  <div>
                    <strong>{agent.contactedLeads}</strong>

                    <span>Contacted</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => openLeads(agent)}
                  >
                    View Leads
                  </button>

                  <button
                    className={
                      agent.isActive ? styles.deactivateBtn : styles.activateBtn
                    }
                    onClick={() => toggleAgent(agent)}
                  >
                    {agent.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className={styles.transferBtn}
                    onClick={() => openTransfer(agent)}
                  >
                    Transfer Leads
                  </button>
                  <button
                    className={styles.payBtn}
                    onClick={() => openPayments(agent)}
                  >
                    Payments
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteAgent(agent._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showDrawer && (
          <AgentLeadsDrawer
            agent={selectedAgent}
            leads={agentLeads}
            onClose={() => setShowDrawer(false)}
          />
        )}
        {showCreate && (
          <CreateAgentModal
            onClose={() => setShowCreate(false)}
            refresh={fetchAgents}
          />
        )}
        {showTransfer && (
          <TransferLeadsModal
            agents={agents}
            currentAgent={transferAgent}
            onClose={() => setShowTransfer(false)}
            refresh={fetchAgents}
          />
        )}
        {showPayments && (
          <PaymentDrawer
            agent={selectedAgent}
            onClose={() => setShowPayments(false)}
            refresh={fetchAgents}
          />
        )}
      </div>
    </AdminLayout>
  );
}
