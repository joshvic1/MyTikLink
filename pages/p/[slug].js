"use client";
function loadTikTokPixel(pixelId) {
  if (!pixelId) {
    console.log("❌ No TikTok Pixel ID found");
    return;
  }

  if (window.ttq) {
    console.log("⚠️ TikTok pixel already loaded");
    return;
  }

  console.log("🚀 Loading TikTok Pixel:", pixelId);

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
      var o = d.createElement("script");
      o.type = "text/javascript";
      o.async = true;
      o.src = i + "?sdkid=" + e + "&lib=" + t;

      o.onload = () => {
        console.log("✅ TikTok Pixel script loaded");
      };

      var a = d.getElementsByTagName("script")[0];
      a.parentNode.insertBefore(o, a);
    };

    ttq.load(pixelId);
    ttq.page();

    ttq.ready(() => {
      console.log("🎯 TikTok Pixel is READY");
    });
  })(window, document, "ttq");
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";

/* =========================
   SMART REDIRECT
========================= */
function smartRedirect(url) {
  if (!url) return;

  const clean = url.trim();
  const lower = clean.toLowerCase();

  // ===== WHATSAPP GROUP =====
  if (lower.includes("chat.whatsapp.com")) {
    const code = clean.split("/").pop();

    // 🔥 Try deep link FIRST
    window.location.href = `whatsapp://chat?code=${code}`;

    // 🌐 Fallback to web (TikTok will usually land here)
    setTimeout(() => {
      window.location.href = clean.startsWith("http")
        ? clean
        : `https://${clean}`;
    }, 800);

    return;
  }

  // ===== WHATSAPP DM =====
  if (lower.includes("wa.me")) {
    const phone = clean.match(/\d+/)?.[0];
    if (!phone) return;

    window.location.href = `whatsapp://send?phone=${phone}`;

    setTimeout(() => {
      window.location.href = `https://wa.me/${phone}`;
    }, 800);

    return;
  }

  // ===== TELEGRAM =====
  if (lower.includes("t.me")) {
    const username = clean.replace(/^https?:\/\/t\.me\//, "");
    window.location.href = `tg://resolve?domain=${username}`;

    setTimeout(() => {
      window.location.href = `https://t.me/${username}`;
    }, 800);

    return;
  }

  // ===== INSTAGRAM =====
  if (lower.includes("instagram.com")) {
    const username = clean.split("/").filter(Boolean)[1];
    window.location.href = `instagram://user?username=${username}`;

    setTimeout(() => {
      window.location.href = clean.startsWith("http")
        ? clean
        : `https://${clean}`;
    }, 800);

    return;
  }

  // ===== DEFAULT =====
  window.location.href = clean.startsWith("http") ? clean : `https://${clean}`;
}
function LoadingScreen() {
  return (
    <div className="loading-wrap">
      <div className="loader-card">
        <div className="pulse-ring"></div>
        <p>Loading page…</p>
      </div>

      <style jsx>{`
        .loading-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top, #052e24, #020617);
          color: white;
          font-family: Inter, system-ui, sans-serif;
        }

        .loader-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .pulse-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid rgba(34, 197, 94, 0.3);
          border-top-color: #22c55e;
          animation: spin 1s linear infinite;
        }

        p {
          font-size: 14px;
          color: #86efac;
          letter-spacing: 0.3px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function PublicPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
  const [cooldownActive, setCooldownActive] = useState(false);
  // =========================
  // Detect cooldown
  // =========
  useEffect(() => {
    if (!slug) return;

    const last = localStorage.getItem("submitted_" + slug);
    if (last && Date.now() - Number(last) < COOLDOWN_MS) {
      setCooldownActive(true);
    }
  }, [slug]);

  /* =========================
     FETCH PAGE
  ========================= */
  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/public/${slug}`,
        );

        console.log("📦 API RESPONSE:", res.data); // 👈 ADD THIS

        setPage(res.data);

        if (res.data.tiktokPixelId) {
          loadTikTokPixel(res.data.tiktokPixelId);
        }
      } catch (err) {
        console.error("Public page error:", err);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  /* =========================
   HANDLE LEAD SUBMIT (FORMS ONLY)
========================= */
  useEffect(() => {
    if (!page) return;

    const form = document.querySelector("[data-lead-form='true']");

    if (cooldownActive && form) {
      const link = document.createElement("a");
      link.href = page.redirectUrl;
      link.innerText = "👉 Tap here to join";
      link.style.display = "block";
      link.style.fontWeight = "700";
      link.style.marginTop = "16px";
      link.style.color = "#22c55e";
      link.style.textAlign = "center";
      link.style.fontSize = "16px";

      form.replaceWith(link);
      return;
    }

    if (!form) return; // 👈 pages without form will skip this entirely

    const nameInput = form.querySelector("input[name='name']");
    const whatsappInput = form.querySelector("input[name='whatsapp']");
    const submitBtn = form.querySelector("button[type='submit']");

    if (!nameInput || !whatsappInput || !submitBtn) return;

    // 🔒 disable initially
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";
    submitBtn.style.cursor = "not-allowed";

    const checkInputs = () => {
      const name = nameInput.value.trim();
      const whatsapp = whatsappInput.value.trim();

      if (name && whatsapp) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.5";
        submitBtn.style.cursor = "not-allowed";
      }
    };

    nameInput.addEventListener("input", checkInputs);
    whatsappInput.addEventListener("input", checkInputs);

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (cooldownActive) return;

      const name = nameInput.value.trim();
      const whatsapp = whatsappInput.value.trim();
      const companyInput = form.querySelector("input[name='company']");
      const company = companyInput ? companyInput.value : "";

      if (!name || !whatsapp) {
        alert("Please fill all fields");
        return;
      }

      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = "Redirecting...";

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/public/${slug}/lead`,
          { name, whatsapp, company },
        );

        // ✅ SAVE COOLDOWN
        localStorage.setItem("submitted_" + slug, Date.now());
        setCooldownActive(true);

        if (res.data.redirectUrl) {
          if (window.ttq) window.ttq.track("CompleteRegistration");

          setTimeout(() => {
            smartRedirect(res.data.redirectUrl);
          }, 300);
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed");

        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    };

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
      nameInput.removeEventListener("input", checkInputs);
      whatsappInput.removeEventListener("input", checkInputs);
    };
  }, [page, slug]);

  /* =========================
   HANDLE CTA BUTTON (NO FORM)
========================= */
  useEffect(() => {
    if (!page) return;

    const ctaBtn = document.querySelector("[data-cta='true']");
    if (!ctaBtn) return; // not a button template

    const handleClick = () => {
      if (!page.redirectUrl) {
        alert("No redirect URL set for this page");
        return;
      }

      if (window.ttq) {
        window.ttq.track("CompleteRegistration");
      }

      smartRedirect(page.redirectUrl);
    };

    ctaBtn.addEventListener("click", handleClick);

    return () => {
      ctaBtn.removeEventListener("click", handleClick);
    };
  }, [page]);

  if (loading) return <LoadingScreen />;

  if (!page) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <h2>404 – Page not found</h2>
      </div>
    );
  }

  const { template, config, title } = page;

  const renderedHTML = template.html.replace(/{{(.*?)}}/g, (_, key) => {
    const val = config[key.trim()];
    if (!val) return "";

    // ✅ image field support
    if (typeof val === "object" && val.url) {
      return val.url;
    }

    return val;
  });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      {template.css && (
        <style dangerouslySetInnerHTML={{ __html: template.css }} />
      )}

      <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
    </>
  );
}
