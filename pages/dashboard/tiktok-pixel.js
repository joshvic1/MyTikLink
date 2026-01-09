"use client";
import { useEffect, useState } from "react";
import DashhboardLayout from "@/components/DashboardLayout";
import styles from "@/styles/TiktokPixel.module.css";

export default function TikTokPixelPage() {
  const [pixelInput, setPixelInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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
        }
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

  return (
    <DashhboardLayout>
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>TikTok Pixel</h1>
          <p className={styles.subtitle}>
            Paste your TikTok Pixel ID or full pixel code (Pro users only)
          </p>

          <textarea
            className={styles.input}
            rows={5}
            placeholder="Paste Pixel ID or full TikTok pixel code here"
            value={pixelInput}
            onChange={(e) => setPixelInput(e.target.value)}
          />

          <button
            className={styles.button}
            onClick={savePixel}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Pixel"}
          </button>

          {status && <p className={styles.status}>{status}</p>}
        </div>
      </div>
    </DashhboardLayout>
  );
}
