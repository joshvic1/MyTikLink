"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function TawkChat({ user }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Hide tooltip automatically
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    if (window.Tawk_API) {
      window.Tawk_API.setAttributes({
        name: user.name,
        email: user.email,
        plan: user.plan,
      });
    }
  }, [user]);

  const openChat = () => {
    if (window.Tawk_API) {
      window.Tawk_API.toggle();
    }
  };

  return (
    <>
      {/* Load Tawk */}
      <Script
        id="tawk-chat"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),
              s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/69a8485fb0555e1c3f0bceb3/1jislldqh';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();

            Tawk_API.onLoad = function() {
              Tawk_API.hideWidget(); // hide ugly default bubble
            };
          `,
        }}
      />

      {/* Custom support button */}
      <div className="support-widget">
        {visible && (
          <div className="support-tooltip">Need help? Click here 👋</div>
        )}

        <button className="support-button" onClick={openChat}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M21 15a4 4 0 01-4 4H8l-5 3V5a4 4 0 014-4h10a4 4 0 014 4z" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .support-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .support-tooltip {
          background: #111827;
          color: white;
          font-size: 13px;
          padding: 8px 12px;
          border-radius: 8px;
          animation: fadeIn 0.4s ease;
          white-space: nowrap;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .support-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #7542e3, #75396c);
          color: white;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease;
        }

        .support-button:hover {
          transform: scale(1.08);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
