"use client";

import { useState, useEffect } from "react";

import { Pencil } from "lucide-react";

import EditVideoModal from "../modals/EditVideoModal";

import styles from "./video.module.css";
import RenderVideo from "../shared/RenderVideo";

export default function VideoElement({
  element,
  sectionId,
  onUpdateElement,
  onDeleteElement,
}) {
  const [open, setOpen] = useState(false);

  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setActive(false);

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return "";

    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);

    if (!match) return "";

    const videoId = match[1];

    const params = new URLSearchParams();

    if (element.start) {
      params.append("start", element.start);
    }

    if (element.autoplay) {
      params.append("autoplay", "1");
      params.append("mute", "1");
    }

    if (!element.controls) {
      params.append("controls", "0");
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const shadowMap = {
    none: "none",
    light: "0 4px 10px rgba(0,0,0,0.08)",
    medium: "0 8px 20px rgba(0,0,0,0.12)",
    large: "0 12px 30px rgba(0,0,0,0.18)",
  };

  return (
    <div className={`${styles.wrapper} ${active ? styles.active : ""}`}>
      <div className={styles.content}>
        {element.url ? (
          <div className={styles.videoOuter}>
            <div className={styles.videoFrame}>
              <RenderVideo element={element} />

              <div
                className={`${styles.overlay} ${
                  active ? styles.overlayActive : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();

                  setActive(true);
                }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.placeholder} onClick={() => setOpen(true)}>
            Add YouTube video
          </div>
        )}

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button className={styles.edit} onClick={() => setOpen(true)}>
            <Pencil size={14} />
          </button>

          <button
            className={styles.delete}
            onClick={() => onDeleteElement(sectionId, element.id)}
          >
            ✕
          </button>
        </div>
      </div>

      <EditVideoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
