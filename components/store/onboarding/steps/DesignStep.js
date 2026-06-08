"use client";

import {
  Check,
  Monitor,
  Moon,
  Sparkles,
  ArrowLeft,
  Rocket,
} from "lucide-react";

import styles from "../../styles/designStep.module.css";

import storefrontTemplates from "@/constants/storeTemplates";

export default function DesignStep({ form, update, back, finish, loading }) {
  return (
    <div className={styles.wrapper}>
      {/* HEADER */}
      <div className={styles.header}>
        <span className={styles.step}>Step 3 of 3</span>

        <h2>Choose Your Store Design</h2>

        <p>
          Pick a storefront style. Don't worry, you can edit and customize the
          design later after launching the store.
        </p>
      </div>

      {/* LABEL */}
      <p className={styles.label}>Select a storefront theme</p>

      {/* THEMES */}
      <div className={styles.themes}>
        {storefrontTemplates.map((theme) => {
          return (
            <button
              key={theme.id}
              type="button"
              className={`${styles.themeCard} ${
                form.templateId === theme.id ? styles.active : ""
              }`}
              onClick={() =>
                update({
                  templateId: theme.id,
                })
              }
            >
              {/* IMAGE */}
              <div className={styles.previewImageWrap}>
                <img
                  src={theme.image}
                  alt={theme.title}
                  className={styles.previewImage}
                />

                <a
                  href={theme.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.previewBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  Preview
                </a>
              </div>

              {/* BOTTOM */}
              <div className={styles.cardBottom}>
                <h3>{theme.title}</h3>

                {form.templateId === theme.id && (
                  <div className={styles.check}>
                    <Check size={12} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button className={styles.backBtn} onClick={back}>
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          className={styles.finishBtn}
          onClick={finish}
          disabled={loading}
        >
          {loading ? (
            "Creating Store..."
          ) : (
            <>
              <Rocket size={14} />
              Launch Store
            </>
          )}
        </button>
      </div>
    </div>
  );
}
