"use client";

import { useState } from "react";

import axios from "axios";

import styles from "./uploadProof.module.css";

export default function UploadProofModal({ lead, onClose, refresh }) {
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("agentToken");

      const formData = new FormData();

      formData.append("image", image);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        },
      );

      const uploadData = await uploadRes.json();

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/contacted/${lead._id}`,
        {
          screenshot: uploadData.url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      refresh();

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Upload Contact Proof</h2>

        <p>Upload screenshot showing you contacted this user.</p>

        <label className={styles.uploadBox}>
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {image ? image.name : "Select Screenshot"}
        </label>

        <button disabled={!image || loading} onClick={handleUpload}>
          {loading ? "Uploading..." : "Upload Proof"}
        </button>
      </div>
    </div>
  );
}
