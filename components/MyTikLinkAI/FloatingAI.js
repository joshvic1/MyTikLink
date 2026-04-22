"use client";

import { useEffect, useState } from "react";
import styles from "./FloatingAI.module.css";
import { MessageCircle } from "lucide-react";

export default function FloatingAI({ onOpen }) {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    let tooltipTimer;
    let hideTimer;

    const showTooltipAgain = () => {
      setShowTooltip(true);

      // hide after 4s
      hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
    };

    const startInactivityTimer = () => {
      clearTimeout(tooltipTimer);

      tooltipTimer = setTimeout(() => {
        showTooltipAgain();
      }, 20000); // 20 seconds inactivity
    };

    // detect activity
    const handleActivity = () => {
      setShowTooltip(false);
      startInactivityTimer();
    };

    // initial run
    showTooltipAgain();
    startInactivityTimer();

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity);

    return () => {
      clearTimeout(tooltipTimer);
      clearTimeout(hideTimer);

      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
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
