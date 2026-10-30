import toast, { Toaster, resolveValue } from "react-hot-toast";
import { CheckCircle2, TriangleAlert, CircleAlert, Info, X } from "lucide-react";
import styles from "../styles/v11.module.css";
export const notify = {
  success: (message) => toast.success(message, { id: `v11-success-${message}`, duration: 2800 }),
  error: (message) => toast.error(message, { id: `v11-error-${message}`, duration: 4200 }),
  warning: (message) => toast(message, { id: `v11-warning-${message}`, icon: "warning", duration: 3600 }),
  info: (message) => toast(message, { id: `v11-info-${message}`, icon: "info", duration: 3200 }),
};
export function Notice({ tone = "warning", children, onClose, floating = false }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? CircleAlert : tone === "info" ? Info : TriangleAlert;
  return <div role={tone === "error" || tone === "warning" ? "alert" : "status"} className={`${styles.notice} ${styles[`notice_${tone}`]} ${floating ? styles.noticeFloating : ""}`}><Icon aria-hidden="true"/><div>{children}</div>{onClose && <button aria-label="Dismiss notification" onClick={onClose}><X/></button>}</div>;
}
export function V11Toaster() {
  return <Toaster position="top-right" toastOptions={{ duration: 3200 }} containerStyle={{ zIndex: 100000, top: 16, right: 16 }}>
    {(item) => <div style={{ opacity: item.visible ? 1 : 0, transition: "opacity .18s" }}><Notice floating tone={item.type === "success" ? "success" : item.type === "error" ? "error" : item.icon === "info" ? "info" : "warning"} onClose={() => toast.dismiss(item.id)}>{resolveValue(item.message, item)}</Notice></div>}
  </Toaster>;
}
