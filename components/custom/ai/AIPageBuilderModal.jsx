"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";

import styles from "./AIPageBuilderModal.module.css";

const initialForm = {
  businessName: "",
  pageGoal: "",
  audience: "",
  offer: "",
  ctaText: "Message me now",
  redirectUrl: "",
  leadMode: "form",
  mainColor: "",
};

const isValidRedirectLink = (value) => {
  const clean = value.trim();

  if (!clean) return false;

  try {
    const url = new URL(clean.startsWith("http") ? clean : `https://${clean}`);

    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
};

export default function AIPageBuilderModal({ open, onClose, token }) {
  const router = useRouter();
  const [step, setStep] = useState("brief");
  const [form, setForm] = useState(initialForm);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinue = useMemo(() => {
    return (
      form.businessName.trim() &&
      form.pageGoal.trim() &&
      form.audience.trim() &&
      form.offer.trim() &&
      form.redirectUrl.trim()
    );
  }, [form]);

  if (!open) return null;

  const update = (key, value) => {
    setError("");

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getQuestions = async () => {
    if (!canContinue) {
      setError("Please fill the important details first.");
      return;
    }

    if (!isValidRedirectLink(form.redirectUrl)) {
      setError(
        "Please enter a valid redirect link, like https://wa.me/2348123456789 or https://example.com.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("/api/ai-page-builder", {
        mode: "questions",
        brief: form,
      });

      const nextQuestions = Array.isArray(res.data.questions)
        ? res.data.questions.slice(0, 5)
        : [];

      setQuestions(nextQuestions);
      setStep("questions");
    } catch (err) {
      console.error(err);
      setError("AI could not prepare questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateAndSave = async () => {
    try {
      setLoading(true);
      setError("");

      const aiRes = await axios.post("/api/ai-page-builder", {
        mode: "generate",
        brief: form,
        answers,
      });

      const page = aiRes.data.page;

      if (!page?.title || !Array.isArray(page.customContent)) {
        setError("AI returned an invalid page. Please try again.");
        return;
      }

      const saveRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/pages`,
        {
          builderType: "custom",
          title: page.title,
          redirectUrl: form.redirectUrl,
          customContent: page.customContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("AI page created");
      router.push(`/dashboard/page/create/custom?pageId=${saveRes.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to create AI page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.brandIcon}>
            <Sparkles size={18} />
          </div>

          <div>
            <p>AI Landing Page Builder</p>
            <h2>Build a page from your idea</h2>
          </div>

          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {step === "brief" && (
          <div className={styles.body}>
            <div className={styles.field}>
              <label>Business name</label>
              <input
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                placeholder="Enter your business/brand name"
              />
            </div>

            <div className={styles.field}>
              <label>What is this page about?</label>
              <textarea
                value={form.pageGoal}
                onChange={(e) => update("pageGoal", e.target.value)}
                placeholder="Tell AI what you want the landing page to sell, promote, explain, or collect."
              />
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Target audience</label>
                <input
                  value={form.audience}
                  onChange={(e) => update("audience", e.target.value)}
                  placeholder="Business owners, students..."
                />
              </div>

              <div className={styles.field}>
                <label>Main offer</label>
                <input
                  value={form.offer}
                  onChange={(e) => update("offer", e.target.value)}
                  placeholder="Free class, course, product..."
                />
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Button text</label>
                <input
                  value={form.ctaText}
                  onChange={(e) => update("ctaText", e.target.value)}
                  placeholder="Message me now"
                />
              </div>

              <div className={styles.field}>
                <label>Redirect link</label>
                <input
                  value={form.redirectUrl}
                  onChange={(e) => update("redirectUrl", e.target.value)}
                  placeholder="WhatsApp, Telegram, checkout link..."
                />
              </div>
            </div>

            <div className={styles.optionBox}>
              <div>
                <h3>
                  Do you want a form on your page that collects name and
                  WhatsApp number?
                </h3>
                <p>
                  Choose Yes if you want leads saved first. Choose No if you
                  only want a direct button.
                </p>
              </div>

              <div className={styles.choiceGrid}>
                <button
                  type="button"
                  className={
                    form.leadMode === "form" ? styles.activeChoice : ""
                  }
                  onClick={() => update("leadMode", "form")}
                >
                  <CheckCircle2 size={15} />
                  Yes
                </button>

                <button
                  type="button"
                  className={
                    form.leadMode === "button" ? styles.activeChoice : ""
                  }
                  onClick={() => update("leadMode", "button")}
                >
                  <Rocket size={15} />
                  No
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label>Page main color</label>
              <input
                value={form.mainColor}
                onChange={(e) => update("mainColor", e.target.value)}
                placeholder="Enter your most preferred color"
              />
            </div>
          </div>
        )}

        {step === "questions" && (
          <div className={styles.body}>
            <div className={styles.notice}>
              AI wants a little more context so the page feels more personal.
            </div>

            {questions.map((question, index) => (
              <div className={styles.field} key={question}>
                <label>{question}</label>
                <textarea
                  value={answers[index] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }
                  placeholder="Type your answer here"
                />
              </div>
            ))}
          </div>
        )}

        {error && <div className={styles.inlineError}>{error}</div>}

        <div className={styles.footer}>
          {step === "questions" ? (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setStep("brief")}
              disabled={loading}
            >
              <ArrowLeft size={15} />
              Back
            </button>
          ) : (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={step === "brief" ? getQuestions : generateAndSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spin} />
                Working...
              </>
            ) : step === "brief" ? (
              <>
                Continue
                <Sparkles size={15} />
              </>
            ) : (
              <>
                Generate page
                <Rocket size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
