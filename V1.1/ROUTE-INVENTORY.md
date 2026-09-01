# MyTikLink V1.1 route and feature inventory

V1.1 is a parallel customer application. Existing production routes and files remain unchanged.

## Route architecture

- Implementation folder: `frontend/V1.1`
- Minimal Next.js route entry: `frontend/pages/v1-1/[[...slug]].js`
- V1.1 URL root: `/v1-1`
- Real authentication: existing local `token` and current auth endpoints
- Real data: existing production API configured by `NEXT_PUBLIC_API_URL`

## Core authenticated customer application

| Production | V1.1 | Feature parity required |
|---|---|---|
| `/dashboard` | `/v1-1/dashboard` | Goal-first Home, real plan, pages, links, store, products, pending orders, leads, setup state |
| `/dashboard/links` | `/v1-1/links` | List, search, create, edit, delete, copy/share, templates, plan limits, click totals |
| `/dashboard/analytics` | `/v1-1/analytics` | Real click history, charts and detail table where API data exists |
| `/dashboard/page` | `/v1-1/pages` | Page list, status, preview, edit, delete, leads, real totals |
| `/dashboard/page/create` | `/v1-1/pages/create` | Template selection, custom builder entry, AI builder entry |
| `/dashboard/page/create/edit` | `/v1-1/pages/editor` | Template editor, save, preview, publish, redirect action |
| `/dashboard/page/create/custom` | `/v1-1/pages/builder` | Full custom builder and element controls |
| `/dashboard/page/p/[pageId]` | `/v1-1/pages/[pageId]/preview` | Authenticated page preview |
| `/dashboard/settings` | `/v1-1/settings/profile` | Real profile editing and account information |
| `/dashboard/tiktok-pixel` | `/v1-1/settings/tracking` | Real TikTok and Meta configuration, masked identifiers |
| `/payment-history` | `/v1-1/settings/billing` | Real plan, renewal and payment history |
| `/store` | `/v1-1/store` | Store existence/setup, real operational overview and stats |
| `/store/products` | `/v1-1/store/products` | List, create, edit, stock updates, image upload, delete |
| `/store/orders` | `/v1-1/store/orders` | List, detail, payment review, status transitions |
| `/store/settings` | `/v1-1/store/settings` | Business, checkout/order, payment and domain configuration |
| `/store/editTemplate` | `/v1-1/store/design` | Storefront design/editor behavior |
| `/store-tutorial` | `/v1-1/store/getting-started` | Store-specific setup guidance |

## Authentication, account and payments

| Production | V1.1 | Strategy |
|---|---|---|
| `/login`, `/?auth=login` | `/v1-1/login` | Reuse existing auth API and token behavior; V1.1 presentation only |
| `/register` | `/v1-1/register` | Reuse registration, verification and phone collection behavior |
| `/reset-password` | `/v1-1/reset-password` | Preserve token validation and reset behavior |
| `/verify-payment` | `/v1-1/billing/verify` | Preserve Paystack verification behavior exactly |
| `/checkout` | `/v1-1/checkout` | Preserve current purchase/payment behavior |
| `/limit-reached` | `/v1-1/limit-reached` | Clear plan-limit recovery state |
| `/expired` | `/v1-1/expired` | Preserve expired plan/page behavior |

## Public customer-facing experiences

| Production | Safe V1.1 equivalent | Notes |
|---|---|---|
| `/p/[slug]` | `/v1-1/p/[slug]` | Preview/test equivalent using the same public page API; production URL untouched |
| `/r/[linkId]` | `/v1-1/r/[linkId]` | Safe redirect preview/test; production redirect and tracking route untouched |
| `/s/[slug]` | `/v1-1/s/[slug]` | Public storefront equivalent using the same public store/product APIs |
| `/s/[slug]/[product]` | `/v1-1/s/[slug]/[product]` | Product detail equivalent |
| `/s/[slug]/account` | `/v1-1/s/[slug]/account` | Customer order lookup/auth equivalent |
| `/checkout` | `/v1-1/s/[slug]/checkout` | Store checkout variant; no payment behavior changes |

## Marketing, content and support

| Production | V1.1 mapping |
|---|---|
| `/` and `/home` | `/v1-1/welcome` |
| `/get-a-landing-page` | `/v1-1/services/landing-page` |
| `/FAQ` | `/v1-1/help` |
| `/blog` | `/v1-1/blog` |
| `/blog/[slug]` | `/v1-1/blog/[slug]` |
| `/terms` | `/v1-1/legal/terms` |
| `/privacy` | `/v1-1/legal/privacy` |
| `/course`, `/course-1`, `/course-2` | `/v1-1/learning/...` |
| `/course-success` | `/v1-1/learning/success` |
| `/youtube` | `/v1-1/learning/youtube` |

## Explicitly mapped internal applications

Admin routes under `/admin/**` and agent route `/agent` are active internal tools. They are not part of the customer V1.1 shell. No admin or agent route will be removed or modified. A separate V1.1 internal-tools design phase would be needed to redesign them without mixing roles and permissions.

## Existing interaction inventory

- Authentication modal, registration/login, email verification, reset password, phone capture
- Link create/edit/delete, redirect template selection and preview, plan enforcement, copy/share
- Page template selection, AI builder, custom builder, template editor, save/publish, preview, delete, lead drawer
- Builder sections, element renderer, hero/text/image/video/button/form/products/menu/HTML/divider/spacer elements and their controls
- Store setup, template/design editing, product CRUD, image upload, stock and low-stock state
- Order listing, recent orders, order detail, proof review and status transitions
- Store settings, storefront page configuration and custom-domain connect/verify/remove
- TikTok pixel and Meta pixel configuration; client/server conversion tracking where currently available
- Subscription plan display, upgrade modal, payment verification and payment history
- Toasts, confirmation modals, drawers, empty/loading/error states, mobile navigation
- Public page rendering, lead capture, public store/product rendering, cart/checkout and customer order lookup
- Blog/help, support chat, tutorials and course/payment flows

## Existing APIs to reuse

- `/auth/**`, `/users/**`
- `/links`, `/links/:id`, `/templates`, `/click-history/**`
- `/pages`, `/pages/:id`, `/pages/:id/leads`, `/pages/public/**`, `/page-templates/**`
- `/store`, `/store/me`, `/store/stats`, `/store/storefront`, `/store/custom-domain/**`, `/store/public/**`
- `/products`, `/products/me`, `/products/recent`, `/products/low-stock`, `/products/public/**`
- `/orders`, `/orders/me`, `/orders/recent`, `/orders/:id/status`
- `/upload/**`
- existing payment, Paystack verification and webhook-backed frontend endpoints
- blog, tutorial, course, customer-auth and public storefront endpoints

## Safety constraints recorded

- No existing page, component, style, service, hook or config file will be edited.
- No production route will be replaced.
- No backend, schema, authentication, payment or environment change is authorized.
- A backend gap will be documented rather than simulated or silently implemented.
- No analytics value will be fabricated.
