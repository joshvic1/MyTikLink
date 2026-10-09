import { useEffect } from "react";
import { useRouter } from "next/router";
import { Notice } from "@/V1.1/components/Notifications";

export default function Toast({ message, type, onClose }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (router.pathname.startsWith("/v1-1")) return <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:100000}}><Notice floating tone={type === "success" ? "success" : type === "error" ? "error" : type === "warning" ? "warning" : "info"} onClose={onClose}>{message}</Notice></div>;
  return (
    <div className={`toast ${type}`}>
      {message}
      <style jsx>{`
        .toast {
          position: fixed;
          top: 20px; /* Move to top */
          left: 50%; /* Center horizontally */
          transform: translateX(-50%);
          background: #111;
          border-left: 4px solid #ff0050;
          color: #fff;
          padding: 1rem 1.4rem;
          border-radius: 8px;
          z-index: 2000;
          animation: fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        }

        .success {
          border-color: #00ff99;
        }
        .error {
          border-color: #ff0050;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
