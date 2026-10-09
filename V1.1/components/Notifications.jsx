import toast, { Toaster, resolveValue } from "react-hot-toast";
import { CheckCircle2, TriangleAlert, CircleAlert, Info, X } from "lucide-react";
import styles from "../styles/v11.module.css";
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) => toast(message, { icon: "warning" }),
  info: (message) => toast(message, { icon: "info" }),
};
export function Notice({ tone = "warning", children, onClose, floating = false }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : tone === "info" ? Info : TriangleAlert;
  return <div role={tone === "error" || tone === "warning" ? "alert" : "status"} className={`${styles.notice} ${styles[`notice_${tone}`]} ${floating ? styles.noticeFloating : ""}`}><Icon aria-hidden="true"/><div>{children}</div>{onClose && <button aria-label="Dismiss notification" onClick={onClose}><X/></button>}</div>;
}
export function V11Toaster() {
  return <Toaster position="top-center" toastOptions={{ duration: 4500 }} containerStyle={{ zIndex: 100000 }}>
    {(item) => <div style={{ opacity: item.visible ? 1 : 0, transition: "opacity .18s" }}><Notice floating tone={item.type === "success" ? "success" : item.type === "error" ? "error" : item.icon === "info" ? "info" : "warning"} onClose={() => toast.dismiss(item.id)}>{resolveValue(item.message, item)}</Notice></div>}
  </Toaster>;
}
