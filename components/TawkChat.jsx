"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function TawkChat({ user }) {
  useEffect(() => {
    const waitForTawk = setInterval(() => {
      if (window.Tawk_API && window.Tawk_API.setAttributes) {
        if (!user) {
          clearInterval(waitForTawk);
          return;
        }

        const name = user?.name || "";
        const email = user?.email || "";
        const plan = user?.plan || "";

        // Only send email if valid
        const attributes = {
          name,
          plan,
        };

        if (email && email.includes("@")) {
          attributes.email = email;
        }

        clearInterval(waitForTawk);
      }
    }, 500);

    return () => clearInterval(waitForTawk);
  }, [user]);

  return (
    <Script
      id="tawk-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API = Tawk_API || {};
          var Tawk_LoadStart = new Date();

          Tawk_API.onLoad = function() {
            
            Tawk_API.hideWidget();
          };

          (function(){
            var s1=document.createElement("script"),
            s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/69a8485fb0555e1c3f0bceb3/1jislldqh';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
