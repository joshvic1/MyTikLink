# MyTikLink V2 — UX audit and product architecture

## Audit summary

V1 contains useful capabilities but exposes them through several independent UI systems. The primary dashboard duplicates Links and Pages; Store has its own layout, navigation, onboarding, toast, dashboard and settings systems; Leads are page-modal actions instead of a first-class workflow; Billing is split between Settings, payment history, upgrade modals and plan sheets; Tracking uses implementation-first language; help appears through several unrelated floating or top-bar tools. The result is navigation, visual, behavioral and conceptual fragmentation.

The V2 concept treats MyTikLink as one workspace with three creation objects (links, pages, products), three outcome objects (orders, leads, analytics), and two administrative groups (tracking and settings).

## Page-level decisions

- **Dashboard → Overview:** retains contextual overview; removes full content inventories and repeated creation controls. Adds a compact recent-content module.
- **My Links → Links:** removes “My” naming. Adds search, status filtering, usage context, analytics access, and responsive management rows.
- **My Pages → Pages:** removes “My” naming. Leads and analytics remain visible as counts/shortcuts, while full lead management moves to Leads.
- **Store subsystem → Store group:** Store overview, Products, Orders, Customers and Store settings use the main product shell. Store onboarding is an explicit seven-step path.
- **Orders:** becomes a first-class operational route, not only a store-internal screen. Verification is a state within order details, not a separate mental model.
- **Leads:** promoted from a page modal to a searchable, exportable destination with source and lifecycle state.
- **Pixels & Events → Tracking:** provider cards explain purpose, connection health, event status and common errors in plain English.
- **Settings:** split into Profile, Security, Plan & billing, Notifications and Integrations.
- **Payment history:** merged into Plan & billing.
- **Upgrade/renew/change plan:** one plan-selection flow reached contextually from Billing or a feature limit.
- **Support, AI assistant, WhatsApp, Telegram, Tawk and blog help:** unified under Help & support. Channels remain choices inside that area.
- **Blog/FAQ/documentation:** treated as the public/learning layer of Help rather than persistent workspace competition.
- **Public storefront, checkout, customer account and tracking:** remain customer-facing surfaces, but should consume the V2 tokens and status language when production migration begins.
- **Admin and agent tools:** excluded from the customer V2 navigation; they require their own role-specific audit rather than being mixed into the SaaS workspace.

## V2 navigation

1. Overview
2. Links
3. Pages
4. Store
   - Overview
   - Products
   - Store design
   - Store settings
5. Orders
6. Leads
7. Analytics
8. Tracking
9. Help & support
10. Settings
   - Profile
   - Security
   - Plan & billing
   - Notifications
   - Integrations

The global Create menu contains Smart link, Landing page and Product. It is not duplicated in every overview section.

## Shared design system

- 4/8px spacing base with 12, 16, 20, 24, 32 and 40px composition steps.
- System sans typography: 26px page titles, 15px section titles, 13px body, 11–12px supporting copy.
- Violet is reserved for primary action and selection. Green represents success/healthy, amber represents attention, red destructive/error, blue informational.
- White surface cards on a neutral background, 1px quiet borders, 8–13px radii, restrained shadows only for overlays.
- Buttons: primary, secondary, ghost, danger; descriptive labels; one primary action per region.
- Inputs share label, control and helper text anatomy with visible focus states.
- Tables become stacked entity cards on mobile through responsive table styling.
- Modals share header, scrollable body, footer, dismissal behavior, width and mobile bottom-sheet behavior.
- Toasts share icon, title, optional next-step copy and compact dismiss control across success, error, warning, information and loading.
- Badges use semantic color, never color alone; skeleton, empty and error states use the same card and type system.

## Prototype coverage

Implemented routes demonstrate Overview, Links, Pages, Page Builder, Store Overview, Products, Store Designer, Orders with Order Detail/Verification, Leads, Analytics, Tracking, Settings tabs, Billing, Help, global creation, product creation, page-start flow, shared modal and toast behavior.

Backend calls, authentication, payments, databases and production data are intentionally not connected.

## Remaining migration considerations

- Replace random client-generated analytics with real aggregated data before migration.
- Establish canonical order and lead state machines in the backend before wiring V2 filters.
- Validate which product types, variants, delivery and inventory behaviors are truly supported before final product forms.
- Consolidate support vendors and define response-time expectations.
- Audit public store/checkout accessibility and the separate admin/agent experiences as dedicated phases.
- Add full keyboard focus management and automated accessibility testing when moving the prototype into production components.
