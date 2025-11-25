import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

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
