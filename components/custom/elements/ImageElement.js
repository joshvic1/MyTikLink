import { useState } from "react";
import EditImageModal from "../modals/EditImageModal";
import { Pencil } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import styles from "./image.module.css";

export default function ImageElement({ element, sectionId, onUpdateElement }) {
  const [open, setOpen] = useState(false);
  const { token } = useAuth();

  return (
    <div className={styles.wrapper}>
      {element.src ? (
        <img
          src={element.src}
          className={styles.image}
          style={{
            borderRadius: element.radius,
          }}
        />
      ) : (
        <div className={styles.placeholder} onClick={() => setOpen(true)}>
          <span>Click to upload image</span>
        </div>
      )}

      {/* EDIT BUTTON */}
      <button className={styles.edit} onClick={() => setOpen(true)}>
        <Pencil size={14} />
      </button>

      <EditImageModal
        isOpen={open}
        onClose={() => setOpen(false)}
        element={element}
        token={token}
        onSave={(data) => onUpdateElement(sectionId, element.id, data)}
      />
    </div>
  );
}
