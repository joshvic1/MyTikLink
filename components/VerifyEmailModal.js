"use client";
import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import styles from "@/styles/modal.module.css";

export default function VerifyEmailModal({
  isOpen,
  onClose,
  email,
  name,
  password,
  onVerified,
}) {
  const router = useRouter();
  const { login } = useAuth();

  const [inputs, setInputs] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  /** TIMER COUNTDOWN */
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /** HANDLE INPUT CHANGE */
  const handleChange = (value, index) => {
    if (/\D/.test(value)) return; // block non numbers

    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);

    // auto move next
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };
  /** HANDLE BACKSPACE + ARROWS */
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newInputs = [...inputs];

      if (newInputs[index]) {
        // If current box has a value, clear it
        newInputs[index] = "";
        setInputs(newInputs);
      } else if (index > 0) {
        // If current is empty, move back and clear previous
        newInputs[index - 1] = "";
        setInputs(newInputs);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Optional: allow arrow navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < inputs.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Optional: Enter key triggers verify
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  /** VERIFY CODE */
  const handleVerify = async () => {
    const code = inputs.join("");

    if (code.length !== 4) {
      toast.error("Enter 4-digit code");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-code`,
        { email, code }
      );

      login(res.data.token);
      toast.success("Account verified!");

      // TikTok Pixel - CompleteRegistration event
      if (typeof window !== "undefined" && window.ttq) {
        window.ttq.track("CompleteRegistration");
      }

      onClose();
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  /** RESEND CODE */
  const handleResend = async () => {
    if (timer > 0) return;

    try {
      setTimer(60);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-code`, {
        email,
        name,
        password,
      });

      toast.success("Verification code resent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setInputs(["", "", "", ""]);
      setTimer(60);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Email">
      <div className={styles.verifyContainer}>
        <p className={styles.verifyMsg}>
          Enter the 4-digit code sent to <b>{email}</b>
        </p>

        <div className={styles.otpRow}>
          {inputs.map((val, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              className={styles.otpInput}
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          ))}
        </div>

        <button
          className={styles.submitBtn}
          disabled={loading}
          onClick={handleVerify}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p className={styles.resendArea}>
          Didn’t get a code?
          {timer > 0 ? (
            <span className={styles.countdown}> Resend in {timer}s</span>
          ) : (
            <span className={styles.resendBtn} onClick={handleResend}>
              Resend Code
            </span>
          )}
        </p>
      </div>
    </Modal>
  );
}
