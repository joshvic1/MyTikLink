"use client";

import { useRef, useState } from "react";
import { Mail, ShieldCheck, X } from "lucide-react";
import { sendCode, verifyCode } from "@/services/customerAuthService";
import styles from "./customerLoginModal.module.css";

export default function CustomerLoginModal({ slug, open, onClose }) {
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  if (!open) return null;

  const joinedCode = code.join("");

  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];

    next[index] = digit;
    setCode(next);

    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    try {
      setLoading(true);
      await sendCode(email, slug);
      setStep("otp");
      setTimeout(() => inputsRef.current[0]?.focus(), 80);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const data = await verifyCode(email, slug, joinedCode);
      localStorage.setItem("customerToken", data.token);
      window.location.href = `/s/${slug}/account`;
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className={styles.modal}>
        <button type="button" className={styles.close} onClick={onClose}>
          <X size={17} />
        </button>

        <div className={styles.icon}>
          {step === "email" ? (
            <Mail size={24} strokeWidth={2.2} />
          ) : (
            <ShieldCheck size={24} strokeWidth={2.2} />
          )}
        </div>

        <h2>
          {step === "email" ? "Login To View Your Orders" : "Verify Code"}
        </h2>

        <p className={styles.subtitle}>
          {step === "email"
            ? "Enter your email below, you will receive a 4-digit code."
            : `We sent a 4 digit code to ${email}`}
        </p>

        {step === "email" && (
          <>
            <input
              className={styles.input}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="button"
              className={styles.primary}
              onClick={handleSendCode}
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Send Login Code"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className={styles.otpRow}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={digit}
                  maxLength={1}
                  inputMode="numeric"
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[index] && index > 0) {
                      inputsRef.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.primary}
              onClick={handleVerify}
              disabled={joinedCode.length !== 4 || loading}
            >
              {loading ? "Verifying..." : "Login"}
            </button>

            <button
              type="button"
              className={styles.ghost}
              onClick={() => setStep("email")}
            >
              Change email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
