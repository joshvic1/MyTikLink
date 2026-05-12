import { useState } from "react";
export default function RenderButton({ element, page, phoneNumber }) {
  const [loading, setLoading] = useState(false);

  function getOS() {
    const ua = navigator.userAgent;

    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";

    return "other";
  }

  /* =========================
   SMART REDIRECT
========================= */
  function smartRedirect(url) {
    if (!url) return;

    const clean = url.trim();
    const lower = clean.toLowerCase();

    // ===== WHATSAPP (ALL TYPES) =====
    if (lower.includes("wa.me")) {
      const urlObj = new URL(
        clean.startsWith("http") ? clean : `https://${clean}`,
      );

      const path = urlObj.pathname;

      const os = getOS();

      // =========================
      // TYPE 1: wa.me/message/XXXXX
      // =========================
      if (path.includes("/message/")) {
        const fullUrl = urlObj.toString();

        if (os === "android") {
          window.open(
            `intent://${fullUrl.replace("https://", "")}#Intent;scheme=https;package=com.whatsapp;end`,
            "_self",
          );
        } else {
          window.location.href = fullUrl;
        }
        setTimeout(() => {
          try {
            if (redirectUrl) {
              smartRedirect(redirectUrl);
            }
          } catch (err) {
            console.error("Redirect failed:", err);
            setLoading(false);
          }
        }, 1200);

        return;
      }

      // =========================
      // TYPE 2: wa.me/PHONE
      // =========================
      const phone = path.replace("/", "").match(/\d+/)?.[0];

      if (phone) {
        if (os === "android") {
          window.open(
            `intent://send?phone=${phone}#Intent;scheme=whatsapp;end`,
            "_self",
          );
        } else {
          window.open(`whatsapp://send?phone=${phone}`, "_self");
        }

        setTimeout(() => {
          window.location.href = `https://wa.me/${phone}`;
        }, 1200);

        return;
      }

      // =========================
      // FALLBACK
      // =========================
      window.location.href = urlObj.toString();
      return;
    }

    // ===== TELEGRAM =====
    if (lower.includes("t.me")) {
      try {
        const urlObj = new URL(
          clean.startsWith("http") ? clean : `https://${clean}`,
        );
        const path = urlObj.pathname.replace("/", "");

        // Invite links (new format)
        if (path.startsWith("+")) {
          const invite = path.replace("+", "");

          window.location.href = `tg://join?invite=${invite}`;

          setTimeout(() => {
            window.location.href = urlObj.toString();
          }, 1200);

          return;
        }

        // Invite links (old format)
        if (path.startsWith("joinchat/")) {
          const invite = path.split("joinchat/")[1];

          window.location.href = `tg://join?invite=${invite}`;

          setTimeout(() => {
            window.location.href = urlObj.toString();
          }, 1200);

          return;
        }

        // Username / public channel
        const username = path.split("/")[0];

        window.location.href = `tg://resolve?domain=${username}`;

        setTimeout(() => {
          window.location.href = urlObj.toString();
        }, 1200);
      } catch {
        window.location.href = clean;
      }

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
    window.location.href = clean.startsWith("http")
      ? clean
      : `https://${clean}`;
  }

  const shadowMap = {
    none: "none",
    light: "0 4px 10px rgba(0,0,0,0.08)",
    medium: "0 8px 20px rgba(0,0,0,0.12)",
    large: "0 12px 30px rgba(0,0,0,0.18)",
  };

  const radiusMap = {
    rectangle: 6,
    rounded: 14,
    pill: 999,
  };

  const sizeMap = {
    small: "10px 18px",
    medium: "14px 24px",
    large: "18px 32px",
  };

  const handleClick = () => {
    if (loading) return;

    setLoading(true);
    const redirectUrl = element.url;

    // =========================
    // TIKTOK
    // =========================
    if (typeof window !== "undefined" && window.ttq) {
      console.log("🚀 Sending TikTok Events");

      const leadEventId = Date.now().toString();

      window.ttq.track(
        "Lead",
        {
          content_type: "product",

          content_id: page?.slug,

          content_name: page?.title,

          contents: [
            {
              content_id: page?.slug,
              content_name: page?.title,
            },
          ],

          ...(phoneNumber && {
            phone_number: phoneNumber,
          }),
        },
        {
          event_id: leadEventId,
        },
      );

      setTimeout(() => {
        window.ttq.track(
          "CompleteRegistration",
          {
            content_type: "product",

            content_id: page?.slug,

            content_name: page?.title,

            contents: [
              {
                content_id: page?.slug,
                content_name: page?.title,
              },
            ],
          },
          {
            event_id: Date.now().toString(),
          },
        );
      }, 400);
    }

    // =========================
    // META
    // =========================
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead");
    }

    // =========================
    // DELAY REDIRECT
    // =========================
    setTimeout(() => {
      if (redirectUrl) {
        smartRedirect(redirectUrl);
      }
    }, 1200);
  };

  return (
    <div
      style={{
        textAlign: element.align || "center",
        padding: element.padding || 3,
        margin: element.margin || 0,
      }}
    >
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          background: element.bg,
          color: element.color,
          fontWeight: element.fontWeight,
          borderRadius: radiusMap[element.shape],
          padding: sizeMap[element.size],
          width: element.fullWidth ? "100%" : "auto",
          boxShadow: shadowMap[element.shadow],
          opacity: loading ? 0.7 : 1,

          cursor: loading ? "not-allowed" : "pointer",
          border: element.borderEnabled
            ? `${element.borderWidth}px solid ${element.borderColor}`
            : "none",

          fontSize: "15px",
          transition: "all 0.2s ease",
        }}
      >
        {loading ? "Redirecting..." : element.text}
      </button>
    </div>
  );
}
