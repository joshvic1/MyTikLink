import {useRouter} from "next/router";
import {Modal,Button} from "@/V1.1/components/UI";
import modern from "@/V1.1/landing/EditorDialogs.module.css";
// /ui/BottomSheet.js
import styles from "./bottomsheet.module.css";

export default function BottomSheet({ isOpen, onClose, children, title }) {
  const router=useRouter();
  if (!isOpen) return null;

  if(router.asPath.startsWith("/v1-1") && title) return <Modal title={title} tone="violet" onClose={onClose} footer={<Button onClick={onClose}>Done</Button>}><div className={modern.elementEditor}>{children}</div></Modal>;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle}></div>
        {children}
      </div>
    </div>
  );
}
