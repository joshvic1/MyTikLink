"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "@/styles/pageNameSheet.module.css";

export default function SettingBottomSheet({ email, onClose, onSuccess }) {
  const [step, setStep] = useState("send"); // send → verify
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);

  const isOtpComplete = inputs.every((d) => d !== "");

  /* ================= SEND CODE ================= */
  const handleSendCode = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/auth/send-change-email-code`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStep("verify");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  /* ================= INPUT HANDLING ================= */
  const handleChange = (value, index) => {
    if (/\D/.test(value)) return;

    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newInputs = [...inputs];

      if (newInputs[index]) {
        newInputs[index] = "";
      } else if (index > 0) {
        newInputs[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      setInputs(newInputs);
    }
  };

  /* ================= VERIFY ================= */
  const handleVerify = async () => {
    const code = inputs.join("");

    if (code.length !== 4) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API}/auth/verify-change-email`,
        { email, code },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onSuccess(res.data.email);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  /* AUTO FOCUS FIRST INPUT */
  useEffect(() => {
    if (step === "verify") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        {/* ================= STEP 1 ================= */}
        {step === "send" && (
          <>
            <h2 className={styles.title}>Verify Email</h2>
            <p className={styles.subtitle}>
              We’ll send a verification code to <b>{email}</b>
            </p>

            <button
              className={styles.button}
              onClick={handleSendCode}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === "verify" && (
          <>
            <h2 className={styles.title}>Enter Code</h2>
            <p className={styles.subtitle}>
              Enter the 4-digit code sent to <b>{email}</b>
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {inputs.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={{
                    width: 50,
                    height: 55,
                    textAlign: "center",
                    fontSize: 18,
                    borderRadius: 10,
                    border: "1px solid #333",
                    background: "#020617",
                    color: "white",
                  }}
                />
              ))}
            </div>

            <button
              className={styles.button}
              disabled={!isOtpComplete || loading}
              onClick={handleVerify}
            >
              {loading ? "Verifying..." : "Verify & Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
