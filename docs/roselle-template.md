# Roselle storefront template

Rose-and-ivory universal template matching the supplied desktop/mobile reference. Registered for physical/digital products and physical/digital services in both frontend and backend. Existing onboarding starter-template assignments are unchanged.

Uses the shared AtelierStore renderer and commerce components for customer accounts, product variants, inventory, cart, checkout, payments, downloads, service booking, editable sections, currency, categories, search, recommendations and policies. Desktop has a split hero and three cards; mobile places the category image first and uses two cards per row with an odd last card spanning the row.

No new artwork was generated. Setup uses the existing storefrontProfile account-category cover. Rendering prefers the merchant's saved section image, then store banner/cover, then the category-cover registry; there is no hardcoded beauty-image fallback. Existing demoListings supply category-specific product/service names and images. Roselle presents service-focused demo listings as service cards and does not offer a product cart action for them. Demos remain drafts/preview-only and never become real bookable services automatically.

The new-tab picker preview now receives category and business focus. Roselle uses `demoCatalog.preview.json`, a server-side snapshot of the existing backend `demoCatalogData.js`, for illustrative public preview rows. Refresh this snapshot if the curated backend catalogue changes. Actual installed stores use the backend catalogue directly. Merchant uploads override the default category image.

Preview: `/v1-1/store-template-preview?theme=roselle`. Optional `category` and `focus` parameters demonstrate different categories. The sample preview does not place orders.

Validation: design/profile tests cover makeup, agriculture and technology across all four business focuses, draft demo protections, and merchant content preservation during theme changes. Browser checks cover mobile/desktop, product/service labels, themed detail dialog, no mobile horizontal overflow, loaded makeup and agriculture images. Existing commerce and all-theme storefront regression tests are included. Not deployed.
