"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Facebook,
  KeyRound,
  Save,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";

import DashhboardLayout from "@/components/DashboardLayout";
import styles from "@/styles/TiktokPixel.module.css";
import { FaTiktok } from "react-icons/fa";

export default function TikTokPixelPage() {
  const [pixelInput, setPixelInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [metaPixelInput, setMetaPixelInput] = useState("");
  const [metaStatus, setMetaStatus] = useState("");
  const [metaLoading, setMetaLoading] = useState(false);

  const [tiktokApiEnabled, setTiktokApiEnabled] = useState(false);
  const [tiktokApiToken, setTiktokApiToken] = useState("");
  const [tiktokApiStatus, setTiktokApiStatus] = useState("");
  const [tiktokApiLoading, setTiktokApiLoading] = useState(false);

  const [metaApiEnabled, setMetaApiEnabled] = useState(false);
  const [metaApiToken, setMetaApiToken] = useState("");
  const [metaApiStatus, setMetaApiStatus] = useState("");
  const [metaApiLoading, setMetaApiLoading] = useState(false);

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

        setPixelInput(data.user?.tiktokPixelId || "");
        setMetaPixelInput(data.user?.metaPixelId || "");

        setTiktokApiEnabled(Boolean(data.user?.tiktokEventsApiEnabled));
        setTiktokApiToken(data.user?.tiktokEventsApiToken || "");

        setMetaApiEnabled(Boolean(data.user?.metaConversionsApiEnabled));
        setMetaApiToken(data.user?.metaConversionsApiToken || "");
      } catch (err) {
        console.error("Failed to load pixels", err);
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
        return;
      }

      setStatus("TikTok Pixel saved successfully");
    } catch (err) {
      console.error(err);
      setStatus("Server error. Try again.");
    } finally {
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
        return;
      }

      setMetaStatus("Meta Pixel saved successfully");
    } catch (err) {
      console.error(err);
      setMetaStatus("Server error. Try again.");
    } finally {
      setMetaLoading(false);
    }
  };

  const saveTiktokEventsApi = async () => {
    try {
      setTiktokApiLoading(true);
      setTiktokApiStatus("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/tiktok-events-api`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            enabled: tiktokApiEnabled,
            accessToken: tiktokApiToken,
          }),
        },
      );

      const data = await res.json();

      setTiktokApiStatus(
        res.ok ? "TikTok Events API saved successfully" : data.message,
      );
    } finally {
      setTiktokApiLoading(false);
    }
  };

  const saveMetaConversionsApi = async () => {
    try {
      setMetaApiLoading(true);
      setMetaApiStatus("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/meta-conversions-api`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            enabled: metaApiEnabled,
            accessToken: metaApiToken,
          }),
        },
      );

      const data = await res.json();

      setMetaApiStatus(
        res.ok ? "Meta Conversions API saved successfully" : data.message,
      );
    } finally {
      setMetaApiLoading(false);
    }
  };

  return (
    <DashhboardLayout>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Pixels & Events</h1>
            <p>
              Connect Meta and TikTok tracking for storefront visits, checkout
              events, and confirmed purchases.
            </p>
          </div>

          <div className={styles.heroBadge}>
            <ShieldCheck size={16} />
            Pro feature
          </div>
        </header>

        <section className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.platformIcon}>
                <FaTiktok size={18} />
              </div>

              <div>
                <h2>TikTok Pixel</h2>
                <p>Paste your TikTok Pixel ID or full pixel code.</p>
              </div>
            </div>

            <label className={styles.field}>
              <span>Pixel ID or code</span>
              <textarea
                rows={5}
                placeholder="Paste TikTok Pixel ID or full code"
                value={pixelInput}
                onChange={(e) => setPixelInput(e.target.value)}
              />
            </label>

            <button
              className={styles.primaryBtn}
              onClick={savePixel}
              disabled={loading}
            >
              <Check size={15} />
              {loading ? "Saving..." : "Save TikTok Pixel"}
            </button>

            {status && (
              <div className={styles.statusBox}>
                <CheckCircle2 size={15} />
                <span>{status}</span>
              </div>
            )}

            <label className={styles.apiToggle}>
              <div>
                <strong>TikTok Events API</strong>
                <span>Enable server-side purchase tracking.</span>
              </div>

              <input
                type="checkbox"
                checked={tiktokApiEnabled}
                onChange={(e) => setTiktokApiEnabled(e.target.checked)}
              />
            </label>

            {tiktokApiEnabled && (
              <div className={styles.apiBox}>
                <label className={styles.field}>
                  <span>Access token</span>
                  <textarea
                    rows={3}
                    placeholder="Paste TikTok Events API access token"
                    value={tiktokApiToken}
                    onChange={(e) => setTiktokApiToken(e.target.value)}
                  />
                </label>

                <button
                  className={styles.secondaryBtn}
                  onClick={saveTiktokEventsApi}
                  disabled={tiktokApiLoading}
                >
                  {tiktokApiLoading ? "Saving..." : "Save Events API"}
                </button>

                {tiktokApiStatus && (
                  <div className={styles.statusBox}>
                    <CheckCircle2 size={15} />
                    <span>{tiktokApiStatus}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.platformIcon}>
                <Facebook size={18} />
              </div>

              <div>
                <h2>Meta Pixel</h2>
                <p>Paste your Meta Pixel ID or full Meta pixel code.</p>
              </div>
            </div>

            <label className={styles.field}>
              <span>Pixel ID or code</span>
              <textarea
                rows={5}
                placeholder="Paste Meta Pixel ID or full code"
                value={metaPixelInput}
                onChange={(e) => setMetaPixelInput(e.target.value)}
              />
            </label>

            <button
              className={styles.primaryBtn}
              onClick={saveMetaPixel}
              disabled={metaLoading}
            >
              <Check size={15} />
              {metaLoading ? "Saving..." : "Save Meta Pixel"}
            </button>

            {metaStatus && (
              <div className={styles.statusBox}>
                <CheckCircle2 size={15} />
                <span>{metaStatus}</span>
              </div>
            )}

            <label className={styles.apiToggle}>
              <div>
                <strong>Meta Conversions API</strong>
                <span>Enable server-side purchase tracking.</span>
              </div>

              <input
                type="checkbox"
                checked={metaApiEnabled}
                onChange={(e) => setMetaApiEnabled(e.target.checked)}
              />
            </label>

            {metaApiEnabled && (
              <div className={styles.apiBox}>
                <label className={styles.field}>
                  <span>Access token</span>
                  <textarea
                    rows={3}
                    placeholder="Paste Meta Conversions API access token"
                    value={metaApiToken}
                    onChange={(e) => setMetaApiToken(e.target.value)}
                  />
                </label>

                <button
                  className={styles.secondaryBtn}
                  onClick={saveMetaConversionsApi}
                  disabled={metaApiLoading}
                >
                  {metaApiLoading ? "Saving..." : "Save Conversions API"}
                </button>

                {metaApiStatus && (
                  <div className={styles.statusBox}>
                    <CheckCircle2 size={15} />
                    <span>{metaApiStatus}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </DashhboardLayout>
  );
}
