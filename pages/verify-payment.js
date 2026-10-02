"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyPaymentPage() {
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (!reference) { setMessage("No payment reference was provided."); setStatus("failed"); return; }
    setReference(reference);

    verify(reference);
  }, []);

  const verify = async (reference) => {
    setStatus("verifying");
    try {
      const token = localStorage.getItem("token");
      if (!token) { setMessage("Please sign in, then reopen this page to verify your payment."); setStatus("failed"); return; }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify/${encodeURIComponent(reference)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        if (res.data.token) localStorage.setItem("token", res.data.token);
        setStatus("success");
        setMessage(`Your ${res.data.plan?.replaceAll("_", " ") || "subscription"} plan is active.`);
      } else {
        setMessage("Payment has not been confirmed yet. If you were debited, check again—do not pay again.");
        setStatus("failed");
      }
    } catch (err) {
      console.error("Verify error:", err);
      setMessage("We could not confirm your payment yet. If you were debited, do not pay again. Retry or contact support with your reference.");
      setStatus("failed");
    }
  };

  return (
    <div style={wrap}>
      {status === "verifying" && <h2>Verifying payment...</h2>}

      {status === "success" && (
        <div style={card}>
          <h1>✅ Payment Successful</h1>
          <p>{message}</p>

          <a href="/dashboard/settings" style={btn}>
            Return to settings
          </a>
        </div>
      )}

      {status === "failed" && (
        <div style={card}>
          <h1>Payment confirmation needed</h1>
          <p>{message}</p>
          {reference && <><p>Reference: {reference}</p><button style={btn} onClick={() => verify(reference)}>Check payment again</button></>}
          <p><a href="/dashboard/settings">Return to settings</a></p>
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
