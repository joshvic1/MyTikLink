"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight } from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import styles from "@/styles/pageCreate.module.css";

export default function CreatePage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/page-templates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTemplates(res.data);
      } catch {
        toast.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleNext = () => {
    if (!selected) return;
    router.push(`/dashboard/page/create/edit?templateId=${selected}`);
  };

  const handleBack = () => {
    router.back();
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

  return (
    <DashboardLayout>
      <div className={styles.wrapper}>
        <h2>Create Page</h2>
        <p className={styles.sub}>
          Select a template and click on <b>NEXT</b>
        </p>

        <div className={styles.grid}>
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className={`${styles.card} ${
                selected === tpl._id ? styles.active : ""
              }`}
              onClick={() => setSelected(tpl._id)}
            >
              <img src={tpl.thumbnailUrl} alt={tpl.name} />
              <span>{tpl.name}</span>
            </div>
          ))}

          <div className={styles.customCard}>
            <div className={styles.plus}>+</div>
            <span>Create your own template</span>
          </div>
        </div>
      </div>

      {/* STICKY ACTION BAR */}
      <div className={styles.bottomBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          className={`${styles.nextBtn} ${!selected ? styles.disabledBtn : ""}`}
          onClick={handleNext}
          disabled={!selected}
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </DashboardLayout>
  );
}
