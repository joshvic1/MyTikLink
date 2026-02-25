"use client";
import { useEffect, useState } from "react";
import DashhboardLayout from "@/components/DashboardLayout";
import styles from "@/styles/TiktokPixel.module.css";

export default function TikTokPixelPage() {
  const [pixelInput, setPixelInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [metaPixelInput, setMetaPixelInput] = useState("");
  const [metaStatus, setMetaStatus] = useState("");
  const [metaLoading, setMetaLoading] = useState(false);

  // 🔹 Fetch saved pixel on page load
  useEffect(() => {
    const fetchPixel = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        if (data.user?.tiktokPixelId) {
          setPixelInput(data.user.tiktokPixelId);
        }
        if (data.user?.metaPixelId) {
          setMetaPixelInput(data.user.metaPixelId);
        }
      } catch (err) {
        console.error("Failed to load TikTok pixel", err);
      }
    };

    fetchPixel();
  }, []);

  const savePixel = async () => {
    if (!pixelInput.trim()) {
      setStatus("Please enter a TikTok Pixel ID or code");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/tiktok-pixel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ pixelId: pixelInput }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setStatus("✅ TikTok Pixel saved successfully");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus("Server error. Try again.");
      setLoading(false);
    }
  };
  const saveMetaPixel = async () => {
    if (!metaPixelInput.trim()) {
      setMetaStatus("Please enter a Meta Pixel ID or code");
      return;
    }

    try {
      setMetaLoading(true);
      setMetaStatus("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/meta-pixel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ pixelId: metaPixelInput }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMetaStatus(data.message || "Something went wrong");
        setMetaLoading(false);
        return;
      }

      setMetaStatus("✅ Meta Pixel saved successfully");
      setMetaLoading(false);
    } catch (err) {
      console.error(err);
      setMetaStatus("Server error. Try again.");
      setMetaLoading(false);
    }
  };
  return (
    <DashhboardLayout>
      <div className={styles.page}>
        <div className={styles.wrapper}>
          {/* TikTok Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>TikTok Pixel</h2>
            <p className={styles.cardSubtitle}>
              Paste your TikTok Pixel ID or full code (Pro users only)
            </p>
            <textarea
              className={styles.input}
              rows={5}
              placeholder="Paste TikTok Pixel ID or full code"
              value={pixelInput}
              onChange={(e) => setPixelInput(e.target.value)}
            />
            <button
              className={styles.button}
              onClick={savePixel}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save TikTok Pixel"}
            </button>
            {status && (
              <div className={styles.statusBox}>
                <span className={styles.statusIcon}>✓</span>
                <span>{status}</span>
              </div>
            )}
          </div>

          {/* Meta Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Meta (Facebook) Pixel</h2>
            <p className={styles.cardSubtitle}>
              Paste your Meta Pixel ID or full code (Pro users only)
            </p>

            <textarea
              className={styles.input}
              rows={5}
              placeholder="Paste Meta Pixel ID or full code"
              value={metaPixelInput}
              onChange={(e) => setMetaPixelInput(e.target.value)}
            />

            <button
              className={styles.button}
              onClick={saveMetaPixel}
              disabled={metaLoading}
            >
              {metaLoading ? "Saving..." : "Save Meta Pixel"}
            </button>
            {metaStatus && (
              <div className={styles.statusBox}>
                <span className={styles.statusIcon}>✓</span>
                <span>{metaStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashhboardLayout>
  );
}
