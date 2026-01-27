"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";
import PlanCard from "@/components/PlanCard";
import CreateRedirectModal from "@/components/CreateRedirectModal";
import UpgradeModal from "@/components/UpgradeModal";
import LinksCardView from "@/components/LinksCardView";

import { Plus } from "lucide-react";
import styles from "@/styles/dashboard.module.css";

import { planConfig } from "@/config/planConfig";
import EditRedirectModal from "@/components/EditRedirectModal";

export default function Dashboard() {
  const [redirects, setRedirects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [user, setUser] = useState({ name: "User", plan: "free" });
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [editing, setEditing] = useState(null);

  const paidProPlans = ["pro_monthly", "pro_yearly"];
  const isPro = paidProPlans.includes(user.plan);

  const router = useRouter();

  const getPlanLimit = (plan) => {
    return planConfig[plan]?.maxLinks ?? 1;
  };

  const fetchRedirects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // ⬅️ send them to homepage and trigger login
        router.push("/?auth=login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/?auth=login");
        return;
      }

      const data = await res.json();
      setRedirects(data);
    } catch (err) {
      console.error("Error fetching redirects:", err);
      toast.error("Failed to load redirects");
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // ⬅️ unauthenticated: go home + show login modal
        router.push("/?auth=login");
        setAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setUser({
          name: res.data.name || "User",
          plan: res.data.plan || "free",
          planExpiry: res.data.planExpiry || null,
        });

        await fetchRedirects();
        setAuthorized(true);
      } catch (err) {
        console.error("Auth failed:", err);
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        router.push("/?auth=login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleCreateClick = () => {
    const limit = getPlanLimit(user.plan);

    if (redirects.length >= limit) {
      toast.error(
        `You've reached your ${
          limit === Infinity ? "" : limit
        } link limit for the ${user.plan} plan.`,
      );
      setShowUpgrade(true);
      return;
    }

    setShowCreate(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    router.push("/?auth=login");
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} aria-label="Loading dashboard" />
      </div>
    );
  }

  if (!authorized) return null;

  const limit = getPlanLimit(user.plan);
  const used = redirects.length;

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again.");
        router.push("/?auth=login");
        return;
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/links/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Link deleted!");
      fetchRedirects();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete link.");
    }
  };

  return (
    <DashboardLayout
      user={user}
      onCreate={handleCreateClick}
      onUpgrade={() => setShowUpgrade(true)}
      onLogout={handleLogout}
    >
      {/* ACTION BAR */}
      <div className={styles.actionsBar}>
        <h2 className={styles.actionsTitle}>My Links</h2>

        <button className={styles.createBtn} onClick={handleCreateClick}>
          <Plus size={16} className={styles.plusIcon} />
          Create Link
        </button>
      </div>

      <LinksCardView
        redirects={redirects}
        userPlan={user.plan}
        onDelete={handleDelete}
        onEdit={(link) => setEditing(link)}
      />

      {editing && (
        <EditRedirectModal
          link={editing}
          setShowModal={() => setEditing(null)}
          onUpdated={fetchRedirects}
          userPlan={user.plan}
        />
      )}

      {/* MODALS */}
      {showCreate && (
        <CreateRedirectModal
          setShowModal={setShowCreate}
          onSuccess={fetchRedirects}
          userPlan={user.plan}
          onRequestUpgrade={() => setShowUpgrade(true)}
        />
      )}

      {showUpgrade && (
        <UpgradeModal
          currentPlan={user.plan}
          setShowModal={setShowUpgrade}
          onUpgrade={(newPlan) => {
            setUser((prev) => ({ ...prev, plan: newPlan }));
            setShowUpgrade(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
