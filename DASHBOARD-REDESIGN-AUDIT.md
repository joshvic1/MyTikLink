# MyTikLink dashboard redesign audit

This audit is based on the current dashboard route, shared dashboard layout, links/pages management views, analytics route, store dashboard, navigation, cards, modals, and responsive styles.

## Current dashboard UX audit

The current dashboard loads the account plan, redirect links, and landing pages. It presents a welcome/plan area, plan expiry messaging, a tutorial, horizontally scrollable link and page cards, create actions, and several edit/delete/upgrade/tutorial/leads/store-announcement modals.

The main problem is that it behaves like a compressed “Links + Pages” management screen rather than an account overview. Links and pages already have dedicated routes, so the dashboard repeats them while omitting the signals users need most: performance, orders, leads, recent activity, tracking health, store health, and clear next steps.

Confusion and competition:

- “Create Link” appears globally and again inside the links section. “See all” then sends users to another view containing the same objects.
- Welcome, plan, expiry, tutorial, store announcement, WhatsApp prompt, AI/support controls, link cards, and page cards all compete before the user sees account outcomes.
- Desktop and mobile use separate welcome/plan markup, increasing inconsistency and maintenance risk.
- Horizontal carousels hide inventory and force extra navigation; they are poor for scanning and especially awkward alongside card-level controls.
- The tutorial explains “How TikLink Works,” but the product itself should establish the next step. It is presented as promotion rather than contextual help.
- Plan state is overexposed on the overview while business activity is absent. Expiry deserves a contextual attention item only when timely.
- Links, pages, and store use separate dashboard/layout patterns, so the product feels like connected mini-products rather than one workspace.
- “TikTok/Meta Pixel” is implementation jargon and combines two integrations into one sidebar label. “Tracking” is clearer; provider setup can live inside it.
- “My Links,” “My Pages,” and “My Store” inconsistently use possessive naming. Navigation should use concise object names.
- The public Home route does not belong in the workspace’s primary navigation. The logo can provide a route home if needed.
- Leads are hidden inside a page modal, despite being a recurring business object that users need to filter, search, and act on.
- Orders and product management live inside the Store subsystem but should remain discoverable as first-class operational destinations for sellers.
- Analytics currently generates random chart data in the client, which undermines trust and presentation readiness.
- The dashboard delete flow does not distinguish link deletion from page deletion reliably: the shared confirmation calls the page deletion handler.
- The pages screen has a conditional-expression bug (`pages.length > 0 && <WhatsAppSupportCard /> && (...)`) that prevents the intended support card from rendering and mixes temporary research messaging into core product UI.

First-time users are likely to misunderstand the difference between smart links, landing pages, and a store; whether a page is required before creating a link; where captured leads go; and which setup step delivers value fastest. Experienced users will find it inefficient to open individual feature areas just to answer “what changed?” and will repeatedly navigate past duplicated card inventories.

## What should stay

- A personal greeting, reduced to one calm page heading.
- Account/plan status, but in the profile area and contextual attention list instead of a dominant card.
- Clear create access, with one global Create menu routing to Link, Page, or Product.
- Links and pages as dedicated navigation destinations.
- Analytics, settings, tracking integrations, store, orders, and support.
- Plan-limit enforcement and expiry warnings, expressed contextually.
- Existing functional modals and backend integrations in production until the preview is approved and wired.

## What should move

- Full link inventory to **Links**.
- Full landing-page inventory and lead actions to **Pages** and **Leads** respectively.
- Product inventory to **Store > Products** or a directly addressable **Products** sub-route.
- Store setup/editing to **Store**.
- TikTok and Meta pixels to **Tracking**, with provider-specific cards and health states.
- Upgrade, renewal, invoices, and limits to **Settings > Plan & billing**.
- Tutorial content to contextual empty states and **Help & support**.
- Blog/help discovery out of the persistent dashboard chrome and into Help.

## What should be removed or merged

- Remove duplicate dashboard inventories, carousel arrows, repeated create buttons, and repeated desktop/mobile welcome components.
- Merge all plan and expiry treatments into a compact sidebar status plus “Needs attention” when action is actually required.
- Merge TikTok and Meta navigation under Tracking, but preserve separate setup/status flows within it.
- Merge scattered support entry points (blog topbar, Telegram, Tawk, WhatsApp, AI assistant) into one Help & support entry with clear channel choices.
- Do not show a store announcement modal on routine dashboard visits. Put product announcements in a dismissible notification center.

## Proposed information architecture

- Overview
- Create (global menu): Link, Page, Product
- Links
- Pages
- Store
  - Overview
  - Products
  - Design/settings
- Orders
- Leads
- Analytics
- Tracking
  - TikTok Pixel
  - Meta Pixel
- Settings
  - Profile
  - Plan & billing
  - Integrations
- Help & support

Overview is adaptive: all users see summary performance and recent activity, while modules respond to account state. New users see setup; sellers see orders/stock; lead-generation users see leads; advertisers see tracking and conversion health; users without a feature do not see meaningless zero-heavy cards.

## Proposed dashboard layout

1. Calm heading: greeting, short account summary, system health.
2. Conditional setup checklist only while incomplete.
3. Four outcome metrics (visits, clicks, leads, orders), hiding irrelevant metrics by use case.
4. Reach and engagement trend with a clear time-range control.
5. “Needs attention” ranked by urgency, not promotional value.
6. Recent activity across features.
7. Top content summary linking to detailed management.

Each section has one primary destination. Detailed tables, editing, deletion, filtering, and bulk operations remain off the overview.

## Mobile UX structure

- A 60px top bar with menu, notifications, and a compact Create action.
- Drawer navigation with the same order and labels as desktop.
- Greeting followed immediately by contextual setup or attention.
- Metrics become a predictable horizontal snap row; operational panels stack vertically.
- No separate mobile content model: the same semantic modules adapt to one column.
- Touch targets are at least 36–44px, labels remain visible, and secondary chart labels are progressively reduced.

## Design system / visual direction

- Light neutral workspace background, white surfaces, quiet borders, restrained shadow.
- Brand violet is reserved for selection and primary actions; green means healthy/positive, amber means attention, red means urgent.
- Compact 8px spacing rhythm; 9–13px corner radii; no glass cards or decorative gradients.
- System-first sans typography with strong size/weight hierarchy and readable plain-English labels.
- One card anatomy, one button family, one icon style (Lucide), consistent empty/loading/error/success states.
- Dense enough for experienced users, with explanations carried by subtitles and empty states for first-time users.

## Why the new version is better

It changes the dashboard from a duplicate content manager into a decision surface. New users receive a path to first value, returning users see outcomes and changes, sellers see operational risk, advertisers see tracking gaps, and plan messaging appears only when relevant. The shared information architecture also gives MyTikLink one coherent product shell instead of separate link, page, and store experiences.

## Mockup implementation

The preview is intentionally isolated at `/dashboard-preview`, uses local sample data, does not require authentication or API access, and does not import or modify the production dashboard. Its menu, date-range selector, dismissible setup module, and responsive navigation are interactive.
