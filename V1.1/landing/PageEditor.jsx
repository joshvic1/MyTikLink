"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { canUseLandingPages } from "@/V1.1/lib/pageAccess.js";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

import TemplateEditor from "@/components/TemplateEditor";
import PageNameSheet from "@/V1.1/landing/PageNameSheet.js";
import styles from "@/styles/pageEditor.module.css";
import UpgradeModal from "@/components/UpgradeModal";

export default function PageEditor() {
  const router = useRouter();
  const pathname = usePathname();
  const returnPath = pathname?.startsWith("/v1-1") ? "/v1-1/pages" : "/dashboard/page";

  const searchParams = useSearchParams();

  const templateId = searchParams.get("templateId");
  const pageId = searchParams.get("pageId");
  const [template, setTemplate] = useState(null);
  const [config, setConfig] = useState({});
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("");
  const [pageRedirectUrl, setPageRedirectUrl] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  /* =========================
     AUTH
  ========================= */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/?auth=login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      try {
        // ✅ fetch user
        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setUser(userRes.data);

        let tplRes;
        let initialConfig = {};

        if (pageId) {
          const pageRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/v1-1/pages/${pageId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          tplRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/page-templates/${pageRes.data.templateId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          initialConfig = pageRes.data.config || {};
          setPageRedirectUrl(pageRes.data.redirectUrl || "");
          setPageTitle(pageRes.data.title || "");
        } else if (templateId) {
          // ===== CREATE MODE =====
          tplRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/page-templates/${templateId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          tplRes.data.editableSchema.fields.forEach((f) => {
            initialConfig[f.key] = f.defaultValue || "";
          });
        } else {
          return;
        }

        setTemplate(tplRes.data);
        setConfig(initialConfig);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load editor");
        router.push(returnPath);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token, templateId, pageId, router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} /> Loading editor...
      </div>
    );
  }

  if (!template || !user) return null;

  const isPro = canUseLandingPages(user);

  return (
    <>
      <div className={styles.editorSafeArea}>
        <TemplateEditor
          template={template}
          config={config}
          onChange={setConfig}
        />
      </div>

      {/* 🔥 BOTTOM SHEET */}
      <div className={styles.bottomSheet}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          className={styles.nextBtn}
          onClick={() => setShowNameSheet(true)}
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>

      {showNameSheet && (
        <PageNameSheet
          isPro={isPro}
          onUpgrade={() => setShowUpgradeModal(true)}
          initialTitle={pageTitle}
          initialRedirectUrl={pageRedirectUrl}
          onClose={() => setShowNameSheet(false)}
          onSave={async ({ title, redirectUrl }) => {
            if (!isPro) return;

            try {
              if (pageId) {
                await axios.put(
                  `${process.env.NEXT_PUBLIC_API_URL}/v1-1/pages/${pageId}`,
                  { title, redirectUrl, config },
                  { headers: { Authorization: `Bearer ${token}` } },
                );
                toast.success("Page updated");
              } else {
                await axios.post(
                  `${process.env.NEXT_PUBLIC_API_URL}/v1-1/pages`,
                  { templateId: template._id, title, redirectUrl, config },
                  { headers: { Authorization: `Bearer ${token}` } },
                );
                toast.success("Page created");
              }

              router.push(returnPath);
            } catch {
              toast.error("Failed to save page");
            }
          }}
        />
      )}
      {showUpgradeModal && <UpgradeModal setShowModal={setShowUpgradeModal} />}
    </>
  );
}
