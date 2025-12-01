"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/DeleteModal";
import DashboardLayout from "@/components/DashboardLayout";
import PlanCard from "@/components/PlanCard";
import CreateRedirectModal from "@/components/CreateRedirectModal";
import UpgradeModal from "@/components/UpgradeModal";
import LinksCardView from "@/components/LinksCardView";

import { Plus } from "lucide-react";
import styles from "@/styles/dashboard.module.css";

import { planConfig } from "@/config/planConfig";
import EditRedirectModal from "@/components/EditRedirectModal";
import TutorialModal from "@/components/TutorialModal";

export default function Dashboard({ userPlan }) {
  const [redirects, setRedirects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [user, setUser] = useState({ name: "User", plan: "free" });
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

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
          { headers: { Authorization: `Bearer ${token}` } }
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
        `You can only create ${limit === Infinity ? "" : limit} link on the ${
          user.plan
        } plan, Upgrade to increase your limit.`
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
      {/* TOP SECTION */}
      <div className={styles.topSection}>
        <div className={styles.welcomeCard}>
          <h2>Welcome back, {user.name} 👋</h2>

          <p>
            You’re currently on the <strong>{user.plan}</strong> plan
            {user.planExpiry && (
              <span className={styles.expiryDate}>
                {" "}
                (expires {new Date(user.planExpiry).toLocaleDateString()})
              </span>
            )}
          </p>

          {user.plan !== "free" &&
            user.planExpiry &&
            new Date(user.planExpiry) - Date.now() <
              3 * 24 * 60 * 60 * 1000 && (
              <p className={styles.expiryWarning}>
                ⚠️ Your plan expires in less than 3 days.
              </p>
            )}
          <div
            className={styles.tutorialBannerDesktop}
            onClick={() => setShowTutorial(true)}
          >
            <div className={styles.youtubeIcon}>▶</div>
            <p>
              <strong>How TikLink Works:</strong> Watch quick 1-minute guide
            </p>
          </div>
        </div>

        <PlanCard
          userPlan={user.plan}
          redirectsUsed={used}
          redirectLimit={limit}
          onUpgrade={() => setShowUpgrade(true)}
        />
      </div>
      {/* TUTORIAL ALERT BANNER */}

      <div
        className={styles.tutorialBannerMobile}
        onClick={() => setShowTutorial(true)}
      >
        <div className={styles.youtubeIcon}>▶</div>
        <p>
          <strong>How TikLink Works:</strong> Watch quick 1-minute guide
        </p>
      </div>

      {/* MOBILE TOP SECTION */}
      <div className={styles.mobileTopSection}>
        <div className={styles.mergedCard}>
          <h2 className={styles.mergedTitle}>Welcome back, {user.name} 👋</h2>

          <p className={styles.mergedText}>
            You’re on the <strong>{user.plan}</strong> plan
            {user.planExpiry && (
              <span className={styles.expiryDate}>
                {" "}
                (expires {new Date(user.planExpiry).toLocaleDateString()})
              </span>
            )}
          </p>

          <div className={styles.mergedStats}>
            <div className={styles.progressRow}>
              <span className={styles.redirectsText}>
                <strong>{used}</strong> / {limit === Infinity ? "∞" : limit}{" "}
                links created
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width:
                      limit === Infinity
                        ? "100%"
                        : `${Math.min(100, (used / limit) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {isPro ? (
              <div className={styles.activeBadge}>Pro Plan Active ✅</div>
            ) : (
              <button
                className={styles.upgradeBtn}
                onClick={() => setShowUpgrade(true)}
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      </div>

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
        onDelete={(link) => {
          setDeleteTarget(link);
          setShowDelete(true);
        }}
        onEdit={(link) => setEditing(link)}
        onUpgrade={() => setShowUpgrade(true)}
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

      {showDelete && (
        <DeleteModal
          isOpen={true}
          linkTitle={deleteTarget?.title || "Untitled Link"}
          onClose={() => setShowDelete(false)}
          userPlan={userPlan}
          onRequestUpgrade={() => setShowUpgrade(true)}
          onConfirm={async () => {
            await handleDelete(deleteTarget._id);

            setShowDelete(false);
          }}
        />
      )}
      {showTutorial && <TutorialModal setShowModal={setShowTutorial} />}
    </DashboardLayout>
  );
}
