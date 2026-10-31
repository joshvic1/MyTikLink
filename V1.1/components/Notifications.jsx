import toastStyles from "./Toast.module.css";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { CheckCircle2, TriangleAlert, CircleAlert, Info, Sparkles, LoaderCircle, X } from "lucide-react";
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
  return <Toaster position="top-right" gutter={10} toastOptions={{ duration: 3200 }} containerStyle={{ zIndex: 100000, top: "max(16px, env(safe-area-inset-top))", right: "max(16px, env(safe-area-inset-right))", left: 16 }}>
    {(item) => {
      const tone = item.type === "success" ? "success" : item.type === "error" ? "error" : item.type === "loading" ? "loading" : item.icon === "warning" ? "warning" : "info";
      const Icon = {success:CheckCircle2,error:CircleAlert,warning:TriangleAlert,info:Sparkles,loading:LoaderCircle}[tone];
      return <div className={`${toastStyles.toast} ${toastStyles[tone]} ${!item.visible ? toastStyles.leaving : ""}`} role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} aria-atomic="true">
        <span className={toastStyles.icon}><Icon aria-hidden="true"/></span>
        <div className={toastStyles.message}>{resolveValue(item.message,item)}</div>
        <button type="button" className={toastStyles.dismiss} aria-label="Dismiss notification" onClick={()=>toast.dismiss(item.id)}><X aria-hidden="true"/></button>
      </div>;
    }}
  </Toaster>;
}
