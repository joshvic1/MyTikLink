"use client";

import { normalizeHtml } from "../utils/htmlSanitizer";

export default function RenderHtml({ element, page }) {
  const getOS = () => {
    const ua = navigator.userAgent;

    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";

    return "other";
  };

  const smartRedirect = (url) => {
    if (!url) return;

    const clean = url.trim();
    const lower = clean.toLowerCase();

    if (lower.startsWith("#") || lower.startsWith("mailto:") || lower.startsWith("tel:")) {
      window.location.href = clean;
      return;
    }

    if (lower.includes("wa.me")) {
      const urlObj = new URL(
        clean.startsWith("http") ? clean : `https://${clean}`,
      );
      const path = urlObj.pathname;
      const os = getOS();

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

        return;
      }

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

      window.location.href = urlObj.toString();
      return;
    }

    if (lower.includes("t.me")) {
      try {
        const urlObj = new URL(
          clean.startsWith("http") ? clean : `https://${clean}`,
        );
        const path = urlObj.pathname.replace("/", "");

        if (path.startsWith("+")) {
          window.location.href = `tg://join?invite=${path.replace("+", "")}`;

          setTimeout(() => {
            window.location.href = urlObj.toString();
          }, 1200);

          return;
        }

        if (path.startsWith("joinchat/")) {
          window.location.href = `tg://join?invite=${path.split("joinchat/")[1]}`;

          setTimeout(() => {
            window.location.href = urlObj.toString();
          }, 1200);

          return;
        }

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

    window.location.href = clean.startsWith("http") ? clean : `https://${clean}`;
  };

  const trackHtmlAction = () => {
    const eventId = Date.now().toString();
    const content = {
      content_type: "product",
      content_id: page?.slug || "custom-html",
      content_name: page?.title || "Custom HTML Block",
      contents: [
        {
          content_id: page?.slug || "custom-html",
          content_name: page?.title || "Custom HTML Block",
        },
      ],
    };

    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("Lead", content, { event_id: eventId });

      setTimeout(() => {
        window.ttq.track("CompleteRegistration", content, {
          event_id: Date.now().toString(),
        });
      }, 400);
    }

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead");
      window.fbq("track", "CompleteRegistration");
    }
  };

  const trackHtmlFormSubmit = (whatsapp = "") => {
    const eventId = Date.now().toString();
    const cleanPhone = whatsapp.replace(/\D/g, "").replace(/^0/, "234");
    const content = {
      content_type: "product",
      content_id: page?.slug || "custom-html",
      content_name: page?.title || "Custom HTML Block",
      contents: [
        {
          content_id: page?.slug || "custom-html",
          content_name: page?.title || "Custom HTML Block",
        },
      ],
      ...(cleanPhone ? { phone_number: cleanPhone } : {}),
    };

    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.track("Lead", content, { event_id: eventId });

      setTimeout(() => {
        window.ttq.track("CompleteRegistration", content, {
          event_id: Date.now().toString(),
        });
      }, 400);
    }

    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead");
      window.fbq("track", "CompleteRegistration");
    }
  };

  const handleClick = (event) => {
    const target = event.target.closest("a, button");

    if (!target) return;

    const href =
      target.getAttribute("href") ||
      target.getAttribute("data-href") ||
      target.getAttribute("data-url");

    trackHtmlAction();

    if (!href || href === "#") return;

    event.preventDefault();

    setTimeout(() => {
      smartRedirect(href);
    }, 700);
  };

  const handleSubmit = async (event) => {
    const form = event.target.closest("[data-lead-form='true']");

    if (!form || !page?.slug) return;

    event.preventDefault();

    const name = form.querySelector("[name='name']")?.value?.trim();
    const whatsapp =
      form.querySelector("[name='whatsapp']")?.value?.trim() ||
      form.querySelector("[name='phone']")?.value?.trim();
    const company = form.querySelector("[name='company']")?.value || "";
    const submitBtn = form.querySelector("button[type='submit'], button");
    const originalText = submitBtn?.textContent;

    if (!name || !whatsapp) {
      alert("Please fill all fields");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pages/public/${page.slug}/lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            whatsapp,
            company,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit");
      }

      trackHtmlFormSubmit(whatsapp);

      if (data.redirectUrl) {
        setTimeout(() => {
          smartRedirect(data.redirectUrl);
        }, 700);
      }
    } catch (err) {
      alert(err.message || "Failed to submit");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || "Submit";
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      onSubmit={handleSubmit}
      style={{
        padding: element.padding || 0,
        margin: element.margin || 0,
        background: element.bg || "transparent",
        border: element.borderEnabled
          ? `${element.borderWidth || 1}px ${
              element.borderStyle || "solid"
            } ${element.borderColor || "#e5e7eb"}`
          : "none",
        borderRadius: element.borderEnabled ? element.radius || 0 : 0,
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
      dangerouslySetInnerHTML={{
        __html: normalizeHtml(element.html || ""),
      }}
    />
  );
}
