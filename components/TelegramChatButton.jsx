"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import styles from "@/styles/TelegramChatButton.module.css";

export default function TelegramChatButton({
  username = "yourTelegramUsername",
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount (for smooth animation)
    setTimeout(() => setVisible(true), 300);
  }, []);

  return (
    <a
      href={`https://t.me/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.fab} ${visible ? styles.show : ""}`}
    >
      <Send size={22} />
    </a>
  );
}
