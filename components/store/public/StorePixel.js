"use client";

import { useEffect } from "react";

function loadMetaPixel(pixelId) {
  if (!pixelId || typeof window === "undefined") return;

  if (!window.fbq) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;

      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };

      if (!f._fbq) f._fbq = n;

      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      t = b.createElement(e);
      t.async = true;
      t.src = v;

      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
    );
  }

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

function loadTikTokPixel(pixelId) {
  if (!pixelId || typeof window === "undefined") return;

  if (window.ttq?.load) {
    window.ttq.load(pixelId);
    window.ttq.page();
    return;
  }

  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;

    const ttq = (w[t] = w[t] || []);
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
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];

    ttq.setAndDefer = function (target, method) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }

    ttq.load = function (id) {
      const script = d.createElement("script");
      script.async = true;
      script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=${t}`;

      const firstScript = d.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    };
  })(window, document, "ttq");

  window.ttq.load(pixelId);
  window.ttq.page();
}

export default function StorePixel({ tiktokPixelId, metaPixelId }) {
  useEffect(() => {
    loadMetaPixel(metaPixelId);
    loadTikTokPixel(tiktokPixelId);
  }, [metaPixelId, tiktokPixelId]);

  return null;
}
