"use client";

import { useEffect, useState } from "react";

export default function SupportChatButton() {
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    // Hide tip after 4 seconds
    const tipTimer = setTimeout(() => {
      setShowTip(false);
    }, 4000);

    // Auto open chat afte 200 seconds (just an example, can be removed or adjusted)
    const chatTimer = setTimeout(() => {
      if (window.Tawk_API) {
        window.Tawk_API.toggle();
      }
    }, 2000000);

    return () => {
      clearTimeout(tipTimer);
      clearTimeout(chatTimer);
    };
  }, []);

  const openChat = () => {
    if (window.Tawk_API) {
      window.Tawk_API.toggle();
    }
  };

  return (
    <>
      <div className="supportWrapper">
        {showTip && <div className="chatTip">Need help? Click here 👋</div>}

        <button className="supportBtn" onClick={openChat}>
          <span className="onlineDot"></span>
          💬
        </button>
      </div>

      <style jsx>{`
        .supportWrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9997;
        }

        /* ======================
           HELP BUBBLE
        ====================== */

        .chatTip {
          background: white;
          color: #111;
          font-size: 13px;
          font-weight: 500;
          padding: 10px 14px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.4s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ======================
           CHAT BUTTON
        ====================== */

        .supportBtn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 24px;

          background: linear-gradient(135deg, #7c3aed, #06b6d4);

          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);

          transition: transform 0.2s ease;

          animation: pulseGlow 2.2s infinite;
        }

        .supportBtn:hover {
          transform: translateY(-3px);
        }

        /* ======================
           PULSE GLOW
        ====================== */

        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.6);
          }

          70% {
            box-shadow: 0 0 0 18px rgba(124, 58, 237, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }

        /* ======================
           ONLINE INDICATOR
        ====================== */

        .onlineDot {
          position: absolute;
          top: 8px;
          right: 8px;

          width: 12px;
          height: 12px;

          background: #22c55e;

          border-radius: 50%;

          border: 2px solid white;
        }

        /* ======================
           MOBILE
        ====================== */

        @media (max-width: 600px) {
          .chatTip {
            font-size: 12px;
            padding: 8px 12px;
          }

          .supportBtn {
            width: 56px;
            height: 56px;
            font-size: 22px;
          }
        }
      `}</style>
    </>
  );
}
