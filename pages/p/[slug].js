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

      const name = nameInput.value.trim();
      const whatsapp = whatsappInput.value.trim();

      if (!name || !whatsapp) {
        alert("Please fill all fields");
        return;
      }

      // 🔥 LOADING STATE
      const originalText = submitBtn.innerText;
      submitBtn.disabled = true;
      submitBtn.innerText = "Redirecting...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/pages/public/${slug}/lead`,
          { name, whatsapp },
        );

        if (res.data.redirectUrl) {
          if (window.ttq) {
            window.ttq.track("CompleteRegistration");
          }

          setTimeout(() => {
            smartRedirect(res.data.redirectUrl);
          }, 300);
        } else {
          alert("No redirect URL found");
        }
      } catch (err) {
        console.error("Lead submit error:", err);

        // ♻️ restore button if error
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";

        alert("Failed to submit form");
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

  const renderedHTML = template.html.replace(
    /{{(.*?)}}/g,
    (_, key) => config[key.trim()] || "",
  );

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
