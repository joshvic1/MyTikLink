"use client";

import { useEffect, useState } from "react";
import styles from "./FloatingAI.module.css";
import { MessageCircle } from "lucide-react";

export default function FloatingAI({ onOpen }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  useEffect(() => {
    let inactivityTimer;
    let hideTimer;

    const showTooltip = () => {
      if (hasShownOnce) return;

      setShowTooltip(true);
      setHasShownOnce(true);

      hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
    };

    const resetInactivityTimer = () => {
      // hide tooltip immediately during activity
      setShowTooltip(false);

      // clear old timers
      clearTimeout(inactivityTimer);
      clearTimeout(hideTimer);

      // start new inactivity countdown
      inactivityTimer = setTimeout(() => {
        showTooltip();
      }, 30000); // 30s inactivity
    };

    // start initial timer
    resetInactivityTimer();

    // activity listeners
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer);
    window.addEventListener("click", resetInactivityTimer);
    window.addEventListener("touchstart", resetInactivityTimer);

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(hideTimer);

      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      window.removeEventListener("touchstart", resetInactivityTimer);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {showTooltip && (
        <div className={styles.tooltip}>
          <span>Need help?</span>
          <p>Chat with MyTikLink AI for instant support</p>
        </div>
      )}

      <button className={styles.button} onClick={onOpen}>
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
