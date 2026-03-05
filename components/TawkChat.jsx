"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function TawkChat({ user }) {
  useEffect(() => {
    console.log("Tawk received user:", user);

    const waitForTawk = setInterval(() => {
      if (window.Tawk_API && window.Tawk_API.setAttributes) {
        console.log("Tawk API ready");

        if (!user) {
          console.log("No user passed to Tawk");
          clearInterval(waitForTawk);
          return;
        }

        const name = user?.name || "";
        const email = user?.email || "";
        const plan = user?.plan || "";

        console.log("Sending to Tawk:", { name, email, plan });

        // Only send email if valid
        const attributes = {
          name,
        };

        if (email && email.includes("@")) {
          attributes.email = email;
        }

        window.Tawk_API.setAttributes(attributes, function (error) {
          if (error) {
            console.error("Tawk attribute error:", error);
          } else {
            console.log("Tawk attributes attached successfully");
          }
        });

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
            console.log("Tawk widget loaded");
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
