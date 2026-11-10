# MyTikLink AI redesign — implementation report

## 1. Help action diagnosis and fix

The Help card dispatched `open-smart-assistant` as a one-shot window event. The recipient was dynamically loaded in `_app`, so an early click had no retained request. The old chat rendered inside the application tree at z-index 9600, below the V1.1 modal layer at 10050+, rather than using a portal. These were source-level handoff and layering defects; live reproduction of the reported click failure was blocked by browser automation timeouts.

Help now closes its channel selector and queues an explicit open request. The assistant consumes pending requests when it mounts, portals to the document body above the modal layer, and focuses the composer after initialization. Mobile Help, desktop Help and legacy dashboard actions use the same bridge. Existing event-based callers remain supported. Tests cover requesting before and after listener mounting.

## 2. Interface

One shared interface serves both dashboards and the existing public AI entry points. It uses the approved MyTikLink mark, compact lavender/white styling, a restrained desktop panel and a mobile viewport-aware layout. Starter questions submit immediately. Markdown supports safe links/lists with raw HTML and remote images disabled. New chat preserves old conversations in History. Copy, Helpful feedback, support escalation and retry are available. Authentication/history loading can retry without reloading the page.

The composer stays outside the scrolling message area, respects safe areas and follows visualViewport changes. Fine-pointer desktop Enter sends, Shift+Enter creates a line, and composing text is not prematurely submitted. The chat only follows new messages when near the bottom or when sending a message; otherwise it shows a New response action.

## 3. Knowledge architecture

The existing `/api/ai` endpoint and provider are retained. A structured, versioned local knowledge catalog replaces the enormous mixed prompt. Retrieval selects relevant articles and limited relevant legacy explanatory paragraphs. Original knowledge files remain intact. Every reviewed record has implementation sources, version, availability, plan requirements and review date. No vector service or database collection is introduced. See README.md for the update workflow.

## 4. Documented feature areas

Account authentication and onboarding; dashboard navigation; profile/password settings; template and Build from Scratch pages; publishing, leads and analytics; redirects, custom slugs and click limits; storefront setup and Store Design; products, categories, collections and inventory; payments/currencies/checkout; delivery; discounts; orders, customer accounts and digital delivery; supported tracking providers and troubleshooting; subscriptions and expiry; existing domain compatibility; notifications and Email preferences; human support. Affiliate, the separate integrations catalog and Live Chat are clearly marked unavailable/in progress. Documentation does not invent merchant configuration for old stores.

## 5. Version-aware responses and security

Authenticated requests validate the existing bearer session and read the backend dashboard preference. Explicit legacy/V1.1 questions take precedence. Unknown-version users receive clarification or labeled instructions. Only verified plan/version context is supplied, not client-claimed identity or email. Message roles and lengths are validated, links/actions are allowlisted, provider errors are sanitized and timeouts/rate limiting are enforced. Existing public guest help remains available.

History was previously browser-only and unscoped. New storage is account-scoped after identity verification; old keys remain untouched and are recoverable explicitly from History. No claim is made that browser localStorage is encrypted or inaccessible to someone sharing the browser profile. There is still no cross-device conversation sync.

## 6. Automatic pop-ups

Removed the homepage inactivity effect that automatically opened chat, the old floating-launcher idle hint and the dashboard's per-route nudge timer. Chat opens only through explicit actions.

## 7. Contextual Help tooltip

A single 90-second inactivity timer watches normal input/navigation signals. It checks the actual Help button, tab visibility, focused fields and open dialogs. The compact dismissible hint says “Need help? Tap here to get support.” It never opens a modal. It is shown once per tab session, dismisses on interaction/Help or a newly appearing dialog, and respects reduced motion. No redundant desktop reminder is added when the mobile Help button is hidden.

## 8. Checks performed

- 74 automated tests passed: 53 existing V1.1 tests and 21 support/API tests.
- Isolated production build passed, including route generation. The initial normal build attempt encountered an existing `.next` lock; no other process was stopped. The isolated output is ignored by Git.
- Four live local `/api/ai` requests returned HTTP 200: V1.1 page publishing, legacy TikTok Pixel setup, V1.1 Affiliate unavailability and Email preferences. Responses used the correct version and available navigation. These were generic questions with no customer data.
- Knowledge source paths are checked by automated tests. Scope-specific whitespace checks passed. Existing unrelated whitespace issues elsewhere were left alone.
- There is no configured lint command in package.json; no lint pass is claimed.

## 9. Limitations and configuration

The in-app browser timed out and the Chrome fallback was unavailable. Mobile/desktop visual appearance, actual keyboard behavior, focus restoration and the real Help modal transition need device/browser smoke testing before release. Automated tests and a successful build do not establish those visual results. Real authenticated AI routing was tested with mocked backend responses, not a live user's private token; live provider checks used public requests with explicit version questions.

Use the existing server-side OPENAI_API_KEY, optional OPENAI_MODEL and trusted API base configuration. Deploy the existing dashboard preference endpoint for inferred prior-user version selection. Without a readable preference, unknown-version handling is intentional. The new limiter is process-local; multiple instances require the deployment's shared edge limit for global enforcement. A language model can still make mistakes, so maintain the reviewed articles and periodically rerun representative answer checks.

No production deployment, account migration, message deletion or new conversation/activity table was performed.
