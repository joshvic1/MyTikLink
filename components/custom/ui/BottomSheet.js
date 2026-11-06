import {useEffect,useRef} from 'react';
import {consumeEditTarget} from '../builder/editTarget';
import {useRouter} from "next/router";
import {Modal,Button} from "@/V1.1/components/UI";
import modern from "@/V1.1/landing/EditorDialogs.module.css";
// /ui/BottomSheet.js
import styles from "./bottomsheet.module.css";

export default function BottomSheet({ isOpen, onClose, children, title }) {
  const router=useRouter();
  const contentRef=useRef(null);
  useEffect(()=>{
    if(!isOpen||!router.asPath.startsWith('/v1-1'))return;
    const target=consumeEditTarget(),root=contentRef.current;if(!target||!root)return;
    const inputs=[...root.querySelectorAll('input,textarea')];
    const input=target.image?inputs.find(node=>node.type==='file'||/image|cover|url/i.test(node.closest('label')?.textContent||node.parentElement?.textContent||'')):inputs.find(node=>node.value&&target.text&&node.value.includes(target.text));
    const field=input||inputs[0];if(!field)return;
    let scroller=root.parentElement;
    while(scroller&&!/(auto|scroll)/.test(getComputedStyle(scroller).overflowY))scroller=scroller.parentElement;
    if(scroller)scroller.scrollTop+=field.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16;
  },[isOpen]);
  if (!isOpen) return null;

  if(router.asPath.startsWith("/v1-1") && title) return <Modal title={title} tone="violet" onClose={onClose} footer={<Button className={modern.editorDone} onClick={onClose}>Done</Button>}><div ref={contentRef} className={modern.elementEditor}>{children}</div></Modal>;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle}></div>
        {children}
      </div>
    </div>
  );
}
