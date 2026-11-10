"use client";

import PublicTracking from '@/V1.1/tracking/PublicTracking';
import {apiRequest} from '@/V1.1/lib/api';

import { useEffect, useState, useRef } from "react";

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

function LegacyStorePixel({ tiktokPixelId, metaPixelId }) {
  const initialized=useRef('');
  useEffect(() => {
    const key=`${tiktokPixelId||''}:${metaPixelId||''}`;if(initialized.current===key)return;initialized.current=key;
    loadMetaPixel(metaPixelId);
    loadTikTokPixel(tiktokPixelId);
  }, [metaPixelId, tiktokPixelId]);

  return null;
}

// Select one tracking implementation. A staged backend rollout keeps the old pixels working.
export default function StorePixel({slug,tiktokPixelId,metaPixelId}){
 const [state,setState]=useState(null);
 useEffect(()=>{if(!slug)return;const controller=new AbortController();apiRequest(`/v1-1/tracking/public/store/${encodeURIComponent(slug)}`,{token:null,signal:controller.signal}).then(connections=>setState({slug,connections})).catch(()=>{if(!controller.signal.aborted)setState({slug,legacy:true});});return()=>controller.abort();},[slug]);
 if(!slug)return <LegacyStorePixel tiktokPixelId={tiktokPixelId} metaPixelId={metaPixelId}/>;
 if(state?.slug!==slug)return null;
 return state.legacy?<LegacyStorePixel tiktokPixelId={tiktokPixelId} metaPixelId={metaPixelId}/>:<PublicTracking kind="store" slug={slug} consent={true} initialConnections={state.connections}/>;
}
