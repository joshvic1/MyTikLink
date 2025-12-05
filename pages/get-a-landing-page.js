"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/GetALandingPage.module.css";
import { planConfig } from "@/config/planConfig";

const LandingPageSection = () => {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/landing/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlreadySubmitted(res.data.alreadySubmitted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!whatsapp.trim()) {
      return toast.error("Please enter your WhatsApp number");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/landing/submit`,
        { whatsapp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.alreadySubmitted) {
        toast("You will be contacted in less than an hour.");
        setAlreadySubmitted(true);
        return;
      }

      toast.success("You will be contacted in less than an hour!");
      setAlreadySubmitted(true);
      setWhatsapp("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Get a High-Converting Landing Page for Your Business
        </h1>

        <p className={styles.text}>
          Stop losing customers from your TikTok ads. Drive them to a clean,
          beautiful landing page built to convert. Your page comes fully{" "}
          <span className={styles.highlight}>TikTok Pixel Ready</span>, so you
          can track actions, optimize your ads, and scale profitably.
        </p>

        {/* If user already submitted → show message */}
        {alreadySubmitted ? (
          <p className={styles.successMsg}>
            You will be contacted in less than an hour.
          </p>
        ) : (
          <>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter your WhatsApp number"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            <button
              className={styles.button}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Get Your Landing Page"}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default LandingPageSection;
