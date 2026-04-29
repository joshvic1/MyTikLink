import BottomSheet from "../ui/BottomSheet";
import { useState } from "react";
import styles from "./editImage.module.css";

export default function EditImageModal({
  isOpen,
  onClose,
  element,
  onSave,
  token,
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      setUploading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ image: reader.result }),
          },
        );

        const data = await res.json();

        onSave({ src: data.url });
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <h3 className={styles.title}>Edit Image</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleUpload(e.target.files[0])}
      />

      {uploading && <p>Uploading...</p>}

      <div className={styles.row}>
        <span>Border Radius</span>
        <input
          type="range"
          min="0"
          max="40"
          value={element.radius}
          onChange={(e) => onSave({ radius: Number(e.target.value) })}
        />
      </div>

      <button onClick={onClose} className={styles.done}>
        Done
      </button>
    </BottomSheet>
  );
}
