"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import { MessageCircle, CheckCircle2, Clock3 } from "lucide-react";

import UploadProofModal from "./UploadProofModal";

import styles from "./leadCard.module.css";

export default function LeadCard({ lead, refresh }) {
  const [timeLeft, setTimeLeft] = useState("");

  const [revealed, setRevealed] = useState(false);

  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(lead.revealAt) - new Date();

      if (diff <= 0) {
        setRevealed(true);
        setTimeLeft("Unlocked");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [lead.revealAt]);

  const handleWhatsappClick = async () => {
    try {
      const token = localStorage.getItem("agentToken");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/whatsapp-click/${lead._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      window.open(`https://wa.me/${lead.user.whatsappNumber}`, "_blank");

      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.top}>
          <div>
            <h3>{lead.user?.name || "Unknown User"}</h3>

            <small>
              Registered {new Date(lead.createdAt).toLocaleString()}
            </small>
          </div>

          {!revealed && (
            <div className={styles.timer}>
              <Clock3 size={14} />
              {timeLeft}
            </div>
          )}
        </div>

        <div className={styles.info}>
          {revealed ? (
            <>
              <div className={styles.number}>+{lead.user?.whatsappNumber}</div>

              <button
                className={styles.whatsappBtn}
                onClick={handleWhatsappClick}
              >
                <MessageCircle size={18} />
                Message User
              </button>
            </>
          ) : (
            <div className={styles.blurBox}>***********</div>
          )}
        </div>

        <div className={styles.footer}>
          {lead.contacted ? (
            <div className={styles.contacted}>
              <CheckCircle2 size={18} />
              CONTACTED
            </div>
          ) : (
            <button
              disabled={!lead.whatsappClicked}
              className={styles.contactBtn}
              onClick={() => setShowUpload(true)}
            >
              Mark As Contacted
            </button>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadProofModal
          lead={lead}
          onClose={() => setShowUpload(false)}
          refresh={refresh}
        />
      )}
    </>
  );
}
