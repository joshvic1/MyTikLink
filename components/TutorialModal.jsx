import { useEffect, useState } from "react";
import styles from "@/styles/TutorialModal.module.css";

export default function TutorialModal({ setShowModal }) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
          ✕
        </button>

        <h2 className={styles.title}>HOW TO USE MYTIKLINK</h2>

        <div className={styles.videoWrap}>
          <iframe
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.video}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
