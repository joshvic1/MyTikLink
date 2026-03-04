"use client";

import Script from "next/script";

export default function TawkChat({ user }) {
  return (
    <Script
      id="tawk-chat"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API = Tawk_API || {};
          var Tawk_LoadStart = new Date();

          (function(){
            var s1=document.createElement("script"),
            s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/69a8485fb0555e1c3f0bceb3/1jislldqh';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();

          Tawk_API.onLoad = function () {
            Tawk_API.hideWidget();

            ${
              user
                ? `
            Tawk_API.setAttributes({
              name: "${user.name || ""}",
              email: "${user.email || ""}",
              plan: "${user.plan || ""}"
            });
            `
                : ""
            }
          };
        `,
      }}
    />
  );
}
