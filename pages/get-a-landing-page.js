"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "@/styles/GetALandingPage.module.css";

export default function LandingPageSection() {
  const PRICE = 30000;
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [loading, setLoading] = useState(false);

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

      setAlreadyPaid(res.data.alreadySubmitted);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/landing/initiate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { email, paymentId, amount } = res.data;

      // load paystack script
      if (!window.PaystackPop) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.src = "https://js.paystack.co/v1/inline.js";
          s.onload = resolve;
          document.body.appendChild(s);
        });
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email,
        amount: amount * 100,
        reference: paymentId, // IMPORTANT FIX
        callback: function (response) {
          verifyPayment(response.reference);
        },
        onClose: () => setLoading(false),
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
      setLoading(false);
    }
  };

  const verifyPayment = async (reference) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/landing/verify/${reference}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Payment successful!");
        setAlreadyPaid(true);
      } else {
        toast.error("Verification failed");
      }
    } catch (err) {
      toast.error("Error verifying payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          🔥 Need More Sales From TikTok? <br /> Get a Landing Page!
        </h1>

        <p className={styles.text}>
          Your ads are not the problem —{" "}
          <span className={styles.highlight}>your landing page is.</span>
          <br />
          <br />
          For just <strong className={styles.price}>₦30,000</strong>, we’ll
          build a high-converting landing page that is:
        </p>

        <ul className={styles.list}>
          <li>✔ TikTok Pixel-Ready</li>
          <li>✔ Fully optimized for ads</li>
          <li>✔ Delivered within 24 hours</li>
        </ul>

        <p className={styles.text}>
          Expect{" "}
          <span className={styles.highlight}>lower CPC, better targeting,</span>
          and more buyers messaging you immediately.
          <br />
          Your TikTok ads will finally start converting.
        </p>

        {/* --- Already Paid Message --- */}
        {alreadyPaid ? (
          <p className={styles.successMsg}>
            ✅ Payment Received, You will be contacted in less than one hour.
          </p>
        ) : (
          <button
            className={styles.button}
            disabled={loading}
            onClick={handlePay}
          >
            {loading ? "Processing..." : "Make Payment Now – ₦30,000"}
          </button>
        )}
      </div>
    </section>
  );
}
