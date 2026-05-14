"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { X } from "lucide-react";

import styles from "@/styles/AddPhoneModal.module.css";

export default function AddPhoneModal({ isOpen, onClose, user }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  const normalizePhone = (value) => {
    if (!value) return "";

    let cleaned = value.replace(/\D/g, "");

    // Nigeria special handling
    if (cleaned.startsWith("2340")) {
      cleaned = "234" + cleaned.slice(4);
    }

    return `${cleaned}`;
  };
  const handleSave = async () => {
    if (!phone) {
      toast.error("Enter WhatsApp number");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-whatsapp`,
        {
          whatsappNumber: normalizePhone(phone),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("WhatsApp number saved!");

      onClose();
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* BACKGROUND FX */}
        <div className={styles.bgGlowTop} />
        <div className={styles.bgGlowBottom} />
        <div className={styles.noise} />

        {/* HANDLE */}
        <div className={styles.handle} />

        {/* CLOSE */}
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={16} />
        </button>

        {/* HEADER */}
        {/* HERO */}
        <div className={styles.hero}>
          <div className={styles.iconWrap}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.14a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>

          <div className={styles.heroText}>
            <h2>Add WhatsApp Number</h2>

            <p>Connect your WhatsApp number to your MyTikLink account</p>
          </div>
        </div>

        {/* PHONE */}
        <div className={styles.phoneCard}>
          <label className={styles.label}>WhatsApp Number</label>

          <PhoneInput
            country={"ng"}
            value={phone}
            onChange={(value) => setPhone(value)}
            inputClass={styles.phoneInput}
            containerClass={styles.phoneContainer}
            buttonClass={styles.phoneButton}
            enableSearch
            placeholder="813 456 7890"
          />
        </div>

        {/* CTA */}
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={loading || !phone}
        >
          {loading ? (
            <>
              <div className={styles.loader} />
              Saving...
            </>
          ) : (
            <>
              Save number
              <span>→</span>
            </>
          )}
        </button>

        {/* FOOT */}
        <p className={styles.foot}>
          Your number stays private and is only used for account verification.
        </p>
      </div>
    </div>
  );
}
