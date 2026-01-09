"use client";

function loadTikTokPixel(pixelId) {
  if (!pixelId || window.ttq) return;

  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
    ];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.load = function (e) {
      var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = i;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      var o = d.createElement("script");
      o.type = "text/javascript";
      o.async = true;
      o.src = i + "?sdkid=" + e + "&lib=" + t;
      var a = d.getElementsByTagName("script")[0];
      a.parentNode.insertBefore(o, a);
    };

    ttq.load(pixelId);
    ttq.page();
  })(window, document, "ttq");
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // forces React to re-render when theme changes
      document.body.style.background = getComputedStyle(
        document.body
      ).getPropertyValue("--bg-color");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);
  const { linkId } = router.query;

  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!linkId) return;

    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/links/api/${linkId}`;
        // 1) fetch link template + deepLink + redirectDelay
        const res = await fetch(apiUrl);
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Backend error fetching link:", res.status, text);
          setError("Invalid or broken link");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (!mounted) return;
        setLinkData(data);
        if (data.tiktokPixelId) {
          loadTikTokPixel(data.tiktokPixelId);
        }

        // 2) ask backend to increment count AND check limit
        const countRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/links/count/${linkId}`,
          {
            method: "POST",
          }
        );

        // handle non-JSON or server errors
        if (!countRes.ok) {
          console.error("Count endpoint returned non-OK:", countRes.status);
          // allow redirect anyway (or show message)
        }

        const countData = await countRes.json().catch(() => ({}));

        // 3) If blocked -> redirect to expired immediately
        if (countData.blocked) {
          window.location.href =
            countData.redirect ||
            `${process.env.NEXT_PUBLIC_FRONTEND_URL}/expired`;
          return;
        }

        // 4) Else perform redirect (use delay from API or fallback)
        const delay = data.redirectDelay ?? 6000;

        setTimeout(() => {
          // 🔥 FIRE EVENT FIRST (for ALL cases)
          if (window.ttq) {
            window.ttq.track("CompleteRegistration");
          }

          // ⏳ Give TikTok time to send request
          setTimeout(() => {
            if (data.deepLink) {
              window.location.href = data.deepLink;

              // fallback after app attempt
              setTimeout(() => {
                window.location.href = data.fallback;
              }, 1200);
            } else {
              window.location.href = data.fallback;
            }
          }, 300); // <-- CRITICAL delay
        }, delay);
      } catch (err) {
        console.error("Redirect page error:", err);
        setError("An error occurred while redirecting.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [linkId]);

  if (loading)
    return (
      <h2
        style={{
          textAlign: "center",
          color: "var(--text-color)",
        }}
      >
        Loading...
      </h2>
    );

  if (error) return <h2 style={{ textAlign: "center" }}>{error}</h2>;
  if (!linkData)
    return <h2 style={{ textAlign: "center" }}>Invalid or broken link</h2>;

  // Render template HTML (CSS will be applied); script tags inside template won't run,
  // which is why we handle redirect in React (above).
  const { template, title } = linkData;

  const renderedHTML = template?.html
    ?.replace(/{{title}}/g, title || "WhatsApp Contact")
    ?.replace(/{{deeplink}}/g, linkData.deepLink)
    ?.replace(/{{fallback}}/g, linkData.fallback)
    ?.replace(/{{redirectDelay}}/g, linkData.redirectDelay ?? 6000)
    ?.replace(
      /{{showPoweredBy}}/g,
      linkData.plan === "free" || linkData.plan === "standard"
        ? `<p style='font-size:12px; margin-top:10px; color:#888;'>Powered by <strong>TikLink</strong></p>`
        : ""
    );

  return (
    <>
      <style jsx global>{`
        :root {
          --bg-color: #ffffff;
          --text-color: #000000;
        }

        [data-theme="dark"] {
          --bg-color: #000000;
          --text-color: #ffffff;
        }

        body {
          background: var(--bg-color) !important;
          color: var(--text-color) !important;
        }
      `}</style>

      {template?.css && (
        <style dangerouslySetInnerHTML={{ __html: template.css }} />
      )}
      <div className={router ? "theme-aware" : ""}>
        <div
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            margin: 0,
            padding: 0,
          }}
        />
      </div>
    </>
  );
}
