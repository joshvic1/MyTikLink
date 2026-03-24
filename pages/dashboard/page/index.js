// pages/dashboard/page/index.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";

import DashboardLayout from "@/components/DashboardLayout";
import UpgradeModal from "@/components/UpgradeModal";
import LeadsModal from "@/components/LeadsModal";
import PagesCardView from "@/components/PagesCardView";
import DeleteModal from "@/components/DeleteModal";

import styles from "@/styles/pagesDashboard.module.css";

export default function PagesDashboard() {
  const [pages, setPages] = useState([]);

  const [user, setUser] = useState({ plan: "free", name: "User" });
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLeads, setShowLeads] = useState(false);
  const [activePage, setActivePage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  const router = useRouter();
  const isPro = user.plan?.toLowerCase().includes("pro");

  /* =========================
     FETCH PAGES
  ========================= */
  const fetchPages = async (token) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(res.data);
    } catch {
      toast.error("Failed to load pages");
    }
  };

  /* =========================
     AUTH GUARD
  ========================= */
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/?auth=login");
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

        await fetchPages(token);
        setAuthorized(true);
      } catch {
        localStorage.removeItem("token");
        router.replace("/?auth=login");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  /* =========================
     DELETE FLOW
  ========================= */
  const confirmDelete = (page) => {
    setPageToDelete(page);
    setShowDeleteModal(true);
  };

  /* =========================
     CREATE PAGE
  ========================= */
  const handleCreate = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    router.push("/dashboard/page/create");
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // This is a temporary card to gather feedback from users about their landing pages. We want to understand if it's converting well, what can be improved, and any other feedback they have. The survey takes less than 1 minute to complete and will help us prioritize improvements to the landing page feature.

  function SurveyCard() {
    return (
      <div className={styles.surveyCard}>
        <div className={styles.surveyContent}>
          <div>
            <h3 className={styles.surveyTitle}>Help Us Improve TikLink 🚀</h3>
            <p className={styles.surveyText}>
              You’ve created a landing page. We’d love your honest feedback. Is
              it converting well? What should we improve?
            </p>
          </div>

          <a
            href="https://forms.gle/AH32zsUY86Wg9sqm8"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.surveyButton}
          >
            Take 1-Minute Survey →
          </a>
        </div>
      </div>
    );
  }

  function WhatsAppSupportCard() {
    return (
      <div className={styles.whatsappMiniCard}>
        <div className={styles.whatsappMiniContent}>
          <p className={styles.whatsappMiniText}>
            💬 Need a guide setting up your landing page? Have any question?{" "}
            <strong>Join our WhatsApp support (8AM–10AM)</strong>
          </p>

          <a
            href="https://chat.whatsapp.com/KPnBwqSxyIXCka5if0Tzoy?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappMiniButton}
          >
            Join →
          </a>
        </div>
      </div>
    );
  }

  /* =========================
     BLOCK UNAUTHORIZED
  ========================= */
  if (!authorized) return null;

  return (
    <DashboardLayout user={user} onUpgrade={() => setShowUpgrade(true)}>
      <div className={styles.header}>
        <h2>Pages</h2>
        <button className={styles.createBtn} onClick={handleCreate}>
          Create Page
        </button>
      </div>
      {pages.length > 0 && <WhatsAppSupportCard />}
      {pages.length === 0 ? (
        <div className={styles.empty}>
          <p>You do not have any page yet.</p>
          {!isPro && (
            <p className={styles.proNote}>
              This feature is only available to Pro users.
            </p>
          )}
        </div>
      ) : (
        <PagesCardView
          pages={pages}
          onEdit={(page) =>
            router.push(`/dashboard/page/create/edit?pageId=${page._id}`)
          }
          onViewLeads={(page) => {
            setActivePage(page);
            setShowLeads(true);
          }}
          onDelete={(page) => confirmDelete(page)}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && pageToDelete && (
        <DeleteModal
          isOpen={showDeleteModal}
          linkTitle={pageToDelete.title}
          userPlan={user.plan}
          onRequestUpgrade={() => {
            setShowDeleteModal(false);
            setShowUpgrade(true);
          }}
          onClose={() => {
            setShowDeleteModal(false);
            setPageToDelete(null);
          }}
          onConfirm={async () => {
            try {
              const token = localStorage.getItem("token");
              await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/pages/${pageToDelete._id}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );

              toast.success("Page deleted");
              fetchPages(token);
              setShowDeleteModal(false);
              setPageToDelete(null);
            } catch {
              toast.error("Failed to delete page");
            }
          }}
        />
      )}

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <UpgradeModal
          currentPlan={user.plan}
          setShowModal={setShowUpgrade}
          onUpgrade={(newPlan) => {
            setUser((u) => ({ ...u, plan: newPlan }));
            setShowUpgrade(false);
          }}
        />
      )}

      {/* LEADS MODAL */}
      {showLeads && activePage && (
        <LeadsModal page={activePage} onClose={() => setShowLeads(false)} />
      )}
    </DashboardLayout>
  );
}
