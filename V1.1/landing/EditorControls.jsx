import {Check} from "lucide-react";
import {Modal,Button} from '../components/UI';
import styles from './ThemeStudio.module.css';
export default function EditorControls({open,onClose,children}){
 if(!open)return <div hidden aria-hidden="true">{children}</div>;
 return <Modal hideCloseButton title="Edit your page" tone="purple" className={`${styles.studio} ${styles.editSheet}`} onClose={onClose} headerActions={<Button className={styles.editorDone} onClick={onClose}><Check size={14} strokeWidth={2}/> Done</Button>}>{children}</Modal>;
}
