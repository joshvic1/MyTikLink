// DraftsModal.js
import BottomSheet from "../ui/BottomSheet";
import styles from "./draftsModal.module.css";

import { Trash2, FolderOpen } from "lucide-react";

export default function DraftsModal({
  isOpen,
  onClose,
  drafts,
  onSelectDraft,
  onDeleteDraft,
  onClearAll,
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Your Drafts</h3>

          {drafts.length > 0 && (
            <button className={styles.clearBtn} onClick={onClearAll}>
              Clear all
            </button>
          )}
        </div>

        <div className={styles.list}>
          {drafts.map((draft) => (
            <div key={draft.id} className={styles.card}>
              <div className={styles.info} onClick={() => onSelectDraft(draft)}>
                <FolderOpen size={18} />

                <div>
                  <p className={styles.title}>{draft.title}</p>

                  <span className={styles.meta}>
                    {draft.content?.length || 0} sections
                  </span>
                </div>
              </div>

              <button
                className={styles.deleteBtn}
                onClick={() => onDeleteDraft(draft.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {drafts.length === 0 && (
            <div className={styles.empty}>No saved drafts yet</div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
