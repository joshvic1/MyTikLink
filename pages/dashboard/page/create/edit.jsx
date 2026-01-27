"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

import TemplateEditor from "@/components/TemplateEditor";
import PageNameSheet from "@/components/PageNameSheet";
import styles from "@/styles/pageEditor.module.css";

export default function PageEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [template, setTemplate] = useState(null);
  const [config, setConfig] = useState({});
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const templateId = searchParams.get("templateId");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/?auth=login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token || !templateId) return;

    const init = async () => {
      try {
        const [tplRes, userRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/page-templates/${templateId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/plan`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTemplate(tplRes.data);
        setUser(userRes.data);

        const initialConfig = {};
        tplRes.data.editableSchema.fields.forEach((f) => {
          initialConfig[f.key] = f.defaultValue || "";
        });

        setConfig(initialConfig);
      } catch (err) {
        toast.error("Failed to load editor");
        router.push("/dashboard/page");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token, templateId, router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!template || !user) return null;

  const isPro = user.plan?.toLowerCase().includes("pro");

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
          onClose={() => setShowNameSheet(false)}
          onSave={async ({ title, redirectUrl }) => {
            if (!isPro) return;

            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/pages`,
                {
                  templateId: template._id,
                  title,
                  redirectUrl,
                  config,
                },
                { headers: { Authorization: `Bearer ${token}` } },
              );

              toast.success("Page created");
              router.push("/dashboard/page");
            } catch {
              toast.error("Failed to save page");
            }
          }}
        />
      )}
    </>
  );
}
