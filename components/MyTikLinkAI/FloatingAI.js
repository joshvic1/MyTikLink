"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import styles from "./FloatingAI.module.css";

export default function FloatingAI({ onOpen }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hasShownOnce = useRef(false);

  useEffect(() => {
    let inactivityTimer;
    let hideTimer;

    const showTooltipAfterIdle = () => {
      if (hasShownOnce.current) return;

      setShowTooltip(true);
      hasShownOnce.current = true;

      hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
    };

    const resetInactivityTimer = () => {
      setShowTooltip(false);

      clearTimeout(inactivityTimer);
      clearTimeout(hideTimer);

      inactivityTimer = setTimeout(showTooltipAfterIdle, 30000);
    };

    const events = [
      "mousemove",
      "keydown",
      "scroll",
      "click",
      "touchstart",
      "input",
      "wheel",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(hideTimer);

      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
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

      <button type="button" className={styles.button} onClick={onOpen}>
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
