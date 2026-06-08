"use client";
import { useRouter } from "next/router";
import styles from "../styles/storewelcome.module.css";

export default function StoreWelcome({ onStart }) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };
  return (
    <div className={styles.welcome}>
      {/* CLOSE */}
      <button className={styles.close} onClick={handleClose}>
        ✕
      </button>

      {/* IMAGE */}
      <div className={styles.imageWrap}>
        <img src="/storefront.png" alt="Storefront" className={styles.image} />
      </div>

      {/* TEXT */}
      <div className={styles.texts}>
        <h1>
          Welcome to <br />
          <span>Mytiklink Storefront</span>
        </h1>

        <p>
          Create your online storefront, upload products, receive payments and
          manage orders easily.
        </p>
      </div>

      {/* BUTTON */}
      <button className={styles.startBtn} onClick={onStart}>
        Get Started →
      </button>
    </div>
  );
}
