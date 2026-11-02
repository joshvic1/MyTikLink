import {useRouter} from "next/router";
import {Modal,Button} from "@/V1.1/components/UI";
import modern from "@/V1.1/landing/EditorDialogs.module.css";
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
  const router=useRouter();
  if(router.asPath.startsWith('/v1-1')) return !isOpen?null:<Modal title="Saved drafts" tone="violet" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Start fresh</Button>{drafts.length>0&&<Button variant="secondary" onClick={onClearAll}>Clear drafts</Button>}</>}><div className={modern.draftList}>{drafts.map(draft=><div key={draft.id} className={modern.draftCard}><button className={modern.draftOpen} onClick={()=>onSelectDraft(draft)}><FolderOpen size={22}/><span><b>{draft.title}</b><small>{draft.content?.length||0} sections · Saved on this device</small></span></button><button className={modern.remove} aria-label={`Delete ${draft.title}`} onClick={()=>onDeleteDraft(draft.id)}><Trash2 size={16}/></button></div>)}{!drafts.length&&<p className={modern.emptyState}>No saved drafts yet.</p>}</div></Modal>;
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
