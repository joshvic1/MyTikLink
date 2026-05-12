"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import AgentLoginModal from "@/components/agent/AgentLoginModal";
import AgentDashboard from "@/components/agent/AgentDashboard";

export default function AgentPage() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("agentToken");

    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/agents/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAgent(res.data);
      })
      .catch(() => {
        localStorage.removeItem("agentToken");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  if (!agent) {
    return <AgentLoginModal onSuccess={(agent) => setAgent(agent)} />;
  }

  return <AgentDashboard agent={agent} />;
}
