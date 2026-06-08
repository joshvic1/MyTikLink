"use client";

import { Mail, MessageCircle, ReceiptText } from "lucide-react";

import styles from "./storeTopBar.module.css";
import { FaWhatsapp } from "react-icons/fa";

export default function StoreTopBar({
  onLogin,
  whatsappNumber,
  email,
  isLoggedIn = false,
  accountUrl = "#",
}) {
  const openWhatsapp = () => {
    if (!whatsappNumber) return;
    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
  };

  const openEmail = () => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <div className={styles.contacts}>
          {whatsappNumber && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={openWhatsapp}
              aria-label="WhatsApp"
            >
              <FaWhatsapp className={styles.whatsappIcon} size={16} />
            </button>
          )}
          <span className={styles.storeStatus}>Contact us</span>
          {email && (
            <button
              type="button"
              className={styles.iconBtn}
              onClick={openEmail}
              aria-label="Email"
            >
              <Mail className={styles.icon} size={16} />
            </button>
          )}
        </div>

        {isLoggedIn ? (
          <a href={accountUrl} className={styles.loginBtn}>
            <ReceiptText className={styles.loginIcon} size={15} />
            <span>View Orders</span>
          </a>
        ) : (
          <button type="button" className={styles.loginBtn} onClick={onLogin}>
            <ReceiptText className={styles.loginIcon} size={15} />
            <span>Login to View Orders</span>
          </button>
        )}
      </div>
    </div>
  );
}
