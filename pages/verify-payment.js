"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyPaymentPage() {
  const [status, setStatus] = useState("verifying");
  const [courseLink] = useState("https://drive.google.com/YOUR-COURSE-LINK");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (!reference) return;

    verify(reference);
  }, []);

  const verify = async (reference) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        setStatus("success");

        // 🔥 FIRE TIKTOK PURCHASE EVENT
        if (window.ttq) {
          window.ttq.track("Purchase", {
            value: 2000,
            currency: "NGN",
          });
        }

        // 📧 SEND COURSE EMAIL
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/course/send-access`,
          {
            email: res.data.email,
            link: courseLink,
          },
        );
      } else {
        setStatus("failed");
      }
    } catch (err) {
      console.error("Verify error:", err);
      setStatus("failed");
    }
  };

  return (
    <div style={wrap}>
      {status === "verifying" && <h2>Verifying payment...</h2>}

      {status === "success" && (
        <div style={card}>
          <h1>✅ Payment Successful</h1>
          <p>Your course access has been sent to your email.</p>

          <a href={courseLink} style={btn}>
            Access Course Now
          </a>
        </div>
      )}

      {status === "failed" && (
        <div style={card}>
          <h1>❌ Payment Failed</h1>
          <p>Please try again.</p>
        </div>
      )}
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0a0a0a",
  color: "#fff",
};

const card = {
  background: "#111",
  padding: "30px",
  borderRadius: "14px",
  textAlign: "center",
};

const btn = {
  display: "inline-block",
  marginTop: "20px",
  background: "#fff",
  color: "#000",
  padding: "14px 22px",
  borderRadius: "10px",
  textDecoration: "none",
};
