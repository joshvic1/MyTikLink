const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clampText = (value, max = 5000) => String(value || "").slice(0, max);

const stripCodeFence = (value = "") =>
  value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const designDirections = [
  "editorial magazine layout with oversized typography, centered hero, thin borders, and elegant spacing",
  "dark luxury conversion page with spotlight gradients, premium glass cards, and a bold centered form",
  "clean SaaS-style landing page with split proof panels, floating metric cards, and a full-width CTA area",
  "creator launch page with playful stacked cards, bright accent blocks, and rounded mobile-first sections",
  "high-ticket coaching page with strong testimonial cards, trust badges, countdown-style urgency, and centered lead form",
  "minimal Apple-like product page with huge whitespace, soft shadows, centered copy, and polished CTA blocks",
  "bold event registration page with poster-like hero, diagonal color bands, schedule cards, and prominent form",
  "modern ecommerce offer page with product-style feature cards, sticky-feel CTA area, and rich benefit grid",
];

function pickDesignDirection(seed = "") {
  const value = String(seed || Date.now());
  const total = value
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), Date.now());

  return designDirections[total % designDirections.length];
}

const premiumBaseStyle = (mainColor = "#7c3aed") => `
<style>
  .ai-lp-page,
  .ai-lp-page * {
    box-sizing: border-box;
  }

  .ai-lp-page {
    width: 100%;
    min-height: 100%;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #0f172a;
    background: transparent;
    text-align: center;
    overflow: hidden;
  }

  .ai-lp-page section,
  .ai-lp-page .ai-lp-section {
    width: 100%;
    padding: clamp(42px, 8vw, 86px) clamp(18px, 5vw, 72px);
    margin-inline: auto;
  }

  .ai-lp-page h1,
  .ai-lp-page h2,
  .ai-lp-page h3 {
    color: #0f172a;
    letter-spacing: 0;
  }

  .ai-lp-page h1 {
    margin: 0;
    font-size: clamp(38px, 9vw, 86px);
    line-height: 0.94;
    font-weight: 950;
  }

  .ai-lp-page h2 {
    margin: 0 0 14px;
    font-size: clamp(25px, 5vw, 46px);
    line-height: 1.05;
    font-weight: 900;
  }

  .ai-lp-page p,
  .ai-lp-page li {
    color: #475569;
    font-size: clamp(14px, 2vw, 17px);
    line-height: 1.65;
  }

  .ai-lp-page a,
  .ai-lp-page button {
    min-height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-radius: 16px;
    padding: 0 18px;
    background: ${mainColor};
    color: #ffffff;
    font-weight: 850;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 16px 34px rgba(124, 58, 237, 0.2);
  }

  .ai-lp-page form {
    width: min(100%, 430px);
    margin: 18px auto 0;
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid rgba(226, 232, 240, 0.95);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.13);
  }

  .ai-lp-page form button,
  .ai-lp-page form [type="submit"] {
    width: 100%;
  }

  .ai-lp-page input,
  .ai-lp-page textarea,
  .ai-lp-page select {
    width: 100%;
    height: 50px;
    border: 1px solid #dbe3ef;
    border-radius: 15px;
    background: #f8fafc;
    color: #0f172a;
    padding: 0 14px;
    font: inherit;
    font-size: 14px;
    outline: 0;
  }

  .ai-lp-page input:focus,
  .ai-lp-page textarea:focus,
  .ai-lp-page select:focus {
    border-color: ${mainColor};
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  .ai-lp-page [style*="color: white"],
  .ai-lp-page [style*="color:#fff"],
  .ai-lp-page [style*="color: #fff"] {
    text-shadow: 0 1px 20px rgba(0, 0, 0, 0.28);
  }

  @media (max-width: 520px) {
    .ai-lp-page a,
    .ai-lp-page button {
      width: 100%;
    }

    .ai-lp-page section,
    .ai-lp-page .ai-lp-section {
      padding-inline: 18px;
    }
  }
</style>`;

function enhanceHtml(html = "", mainColor = "#7c3aed") {
  const cleanHtml = String(html || "").trim();

  if (!cleanHtml) return cleanHtml;

  const hasPageWrapper = /class=(["'])[^"']*ai-lp-page[^"']*\1/i.test(cleanHtml);
  const body = hasPageWrapper
    ? cleanHtml
    : `<div class="ai-lp-page">${cleanHtml}</div>`;

  return `${premiumBaseStyle(mainColor)}${body}`;
}

function sectionWithHtml(html, options = {}) {
  return {
    id: makeId("section"),
    bg: options.bg || "#ffffff",
    backgroundType: "color",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundOverlay: "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))",
    padding: options.padding ?? 0,
    margin: 0,
    radius: 0,
    borderEnabled: false,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    layout: "full",
    shadow: "none",
    opacity: 100,
    elements: [
      {
        id: makeId("html"),
        type: "html",
        html,
        bg: "transparent",
        padding: 0,
        margin: 0,
        borderEnabled: false,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        radius: 0,
      },
    ],
  };
}

function normalizeSections(page) {
  const sections = Array.isArray(page?.customContent) ? page.customContent : [];

  return sections
    .filter((section) => Array.isArray(section.elements))
    .slice(0, 8)
    .map((section) => ({
      id: section.id || makeId("section"),
      bg: section.bg || "#ffffff",
      backgroundType: section.backgroundType || "color",
      backgroundImage: section.backgroundImage || "",
      backgroundSize: section.backgroundSize || "cover",
      backgroundPosition: section.backgroundPosition || "center",
      backgroundRepeat: section.backgroundRepeat || "no-repeat",
      backgroundOverlay:
        section.backgroundOverlay ||
        "linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))",
      padding: Number.isFinite(Number(section.padding))
        ? Number(section.padding)
        : 0,
      margin: Number.isFinite(Number(section.margin)) ? Number(section.margin) : 0,
      radius: Number.isFinite(Number(section.radius)) ? Number(section.radius) : 0,
      borderEnabled: Boolean(section.borderEnabled),
      borderWidth: Number(section.borderWidth || 1),
      borderStyle: section.borderStyle || "solid",
      borderColor: section.borderColor || "#e5e7eb",
      layout: section.layout === "boxed" ? "boxed" : "full",
      shadow: section.shadow || "none",
      opacity: 100,
      elements: section.elements
        .filter((element) => element?.type === "html" && element?.html)
        .slice(0, 3)
        .map((element) => ({
          id: element.id || makeId("html"),
          type: "html",
          html: enhanceHtml(element.html, page?.mainColor || "#7c3aed"),
          bg: element.bg || "transparent",
          padding: Number(element.padding || 0),
          margin: Number(element.margin || 0),
          borderEnabled: Boolean(element.borderEnabled),
          borderWidth: Number(element.borderWidth || 1),
          borderStyle: element.borderStyle || "solid",
          borderColor: element.borderColor || "#e5e7eb",
          radius: Number(element.radius || 0),
        })),
    }));
}

function buildFallbackPage(brief) {
  const ctaText = brief.ctaText || "Message me now";
  const mainColor = brief.mainColor || "#7c3aed";
  const formBlock =
    brief.leadMode === "form"
      ? `
        <form class="ai-lp-form" data-lead-form="true">
          <input name="company" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" />
          <input name="name" placeholder="Your name" required />
          <input name="whatsapp" placeholder="WhatsApp number" required />
          <button type="submit">${ctaText}</button>
        </form>
      `
      : `<a class="ai-lp-cta" data-cta="true" href="${brief.redirectUrl}">${ctaText}</a>`;

  return {
    title: `${brief.businessName} Landing Page`,
    customContent: [
      sectionWithHtml(`
        <style>
          .ai-lp-wrap{font-family:Inter,system-ui,sans-serif;background:#050816;color:#fff;padding:52px 18px}
          .ai-lp-inner{max-width:980px;margin:0 auto;display:grid;gap:26px}
          .ai-lp-pill{display:inline-flex;width:max-content;padding:8px 12px;border:1px solid rgba(255,255,255,.16);border-radius:999px;color:#ffffff;background:${mainColor};font-size:12px;font-weight:800}
          .ai-lp-title{font-size:clamp(34px,7vw,76px);line-height:.95;margin:0;letter-spacing:-.04em}
          .ai-lp-copy{max-width:660px;color:#cbd5e1;font-size:16px;line-height:1.7;margin:0}
          .ai-lp-panel{background:#fff;color:#0f172a;border-radius:26px;padding:18px;display:grid;gap:12px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
          .ai-lp-form{display:grid;gap:10px}
          .ai-lp-form input{height:48px;border:1px solid #e2e8f0;border-radius:14px;padding:0 14px;font:inherit}
          .ai-lp-form button,.ai-lp-cta{height:50px;border:0;border-radius:14px;background:${mainColor};color:#fff;font-weight:900;display:flex;align-items:center;justify-content:center;text-decoration:none}
        </style>
        <main class="ai-lp-wrap">
          <div class="ai-lp-inner">
            <span class="ai-lp-pill">${brief.offer}</span>
            <h1 class="ai-lp-title">${brief.businessName}</h1>
            <p class="ai-lp-copy">${brief.pageGoal}</p>
            <div class="ai-lp-panel">
              <strong>Built for ${brief.audience}</strong>
              <p>${brief.offer}</p>
              ${formBlock}
            </div>
          </div>
        </main>
      `),
    ],
  };
}

async function askOpenAI(messages) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI request failed");
  }

  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(stripCodeFence(content));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
  }

  const { mode, brief = {}, answers = {} } = req.body || {};

  const cleanBrief = {
    businessName: clampText(brief.businessName, 120),
    pageGoal: clampText(brief.pageGoal, 1800),
    audience: clampText(brief.audience, 240),
    offer: clampText(brief.offer, 240),
    ctaText: clampText(brief.ctaText || "Message me now", 60),
    redirectUrl: clampText(brief.redirectUrl, 500),
    leadMode: brief.leadMode === "button" ? "button" : "form",
    mainColor: clampText(brief.mainColor || "", 180),
  };
  const designDirection = pickDesignDirection(
    `${cleanBrief.businessName}-${cleanBrief.pageGoal}-${Date.now()}`,
  );

  try {
    if (mode === "questions") {
      const data = await askOpenAI([
        {
          role: "system",
          content:
            "You create sharp follow-up questions for a landing page builder. Return only JSON: {\"questions\":[\"...\"]}. Ask 3 to 5 short questions. Do not ask for fields already provided.",
        },
        {
          role: "user",
          content: JSON.stringify(cleanBrief),
        },
      ]);

      return res.status(200).json({
        questions: Array.isArray(data.questions) ? data.questions.slice(0, 5) : [],
      });
    }

    if (mode === "generate") {
      const data = await askOpenAI([
        {
          role: "system",
          content: `
You generate MyTikLink custom landing pages as JSON.
Return only JSON:
{
  "page": {
    "title": "short page title",
    "customContent": []
  }
}

Rules:
- customContent must be an array of section objects.
- Use only html elements inside sections.
- Each section object must have: id, bg, backgroundType, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, backgroundOverlay, padding, margin, radius, borderEnabled, borderWidth, borderStyle, borderColor, layout, shadow, opacity, elements.
- Each html element must have: id, type:"html", html, bg, padding, margin, borderEnabled, borderWidth, borderStyle, borderColor, radius.
- HTML may include <style> and inline CSS.
- Do not include <script>, iframe, object, embed, html, head, or body tags.
- Use a unique CSS class prefix starting with ai-lp.
- Build a complete, premium, beautiful, modern landing page with strong visual hierarchy.
- The page must look like a high-end conversion landing page, not a plain document.
- Design direction for this specific page: ${designDirection}.
- Do not use the same layout every time. Let the business, audience, offer, color, and design direction change the structure.
- Use advanced CSS: gradients, layered sections, cards, shadows, responsive grids, badges, social proof, offer cards, glass panels, timeline blocks, pricing/offer blocks, testimonial cards, and polished form styling.
- The first section must be a strong hero with a bold headline, clear subtext, CTA/form, and a visual panel or benefit card.
- Add at least 4 content sections: hero, benefits/proof, offer/details, urgency/trust, and final CTA.
- Use the user's mainColor as the dominant brand color across buttons, badges, highlights, borders, and important accents. You may mix it with similar complementary colors.
- Text must always be highly readable. Never place white or very light text on white/light backgrounds. Never use opacity below 1 on the main wrapper, text, cards, forms, or sections.
- Every visible text block must have strong contrast against its background. Use dark text on light surfaces and white text on dark/colored surfaces.
- Avoid pale overlays that wash out the page. Do not add a white overlay above the whole page.
- Every form, input, and button must be fully styled with border radius, spacing, proper width, and visible colors.
- Forms must be horizontally centered. Form inputs and submit buttons must be full width inside the form.
- CTA buttons must be centered when they are the main action.
- Keep main content centered with max-width containers. Nothing important should hug the left edge on mobile.
- If leadMode is "form", include exactly one form with data-lead-form="true", input name="name", input name="whatsapp", hidden honeypot input name="company", and a submit button.
- If leadMode is "button", include a CTA link with data-cta="true" and href set to the redirectUrl.
- Do not use external images unless the business context clearly requires placeholder remote images. Prefer gradients, shapes, and CSS.
- Keep it mobile responsive.
`,
        },
        {
          role: "user",
          content: JSON.stringify({
            brief: cleanBrief,
            designDirection,
            followUpAnswers: answers,
          }),
        },
      ]);

      const rawPage = data.page || buildFallbackPage(cleanBrief);
      rawPage.mainColor = cleanBrief.mainColor || "#7c3aed";
      const customContent = normalizeSections(rawPage);

      if (!customContent.length) {
        const fallback = buildFallbackPage(cleanBrief);
        return res.status(200).json({ page: fallback });
      }

      return res.status(200).json({
        page: {
          title:
            clampText(rawPage.title, 90) ||
            `${cleanBrief.businessName} Landing Page`,
          customContent,
        },
      });
    }

    return res.status(400).json({ error: "Invalid AI builder mode" });
  } catch (err) {
    console.error("AI page builder error:", err);
    res.status(500).json({ error: "AI could not build the page" });
  }
}
