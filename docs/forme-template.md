# Forme storefront template

Forme is available to physical-product, digital-product, physical-service and digital-service accounts. It is an additional theme; automatic onboarding starter-template assignments are unchanged.

It uses the existing AtelierStore renderer and all shared commerce/detail/account components. Product variants, cart, checkout/payment methods, digital fulfilment, categories, currency selection, customer history, search/filtering, recommendations, editable sections and service booking routes retain their existing behavior. The services feature flag still controls actual service booking availability.

The template adds the approved ivory/forest-green palette, split photographic hero, serif headings, three desktop cards and compact single-column mobile cards, sage about panel, responsive navigation and a themed preview dialog. Merchant images and brand accent remain editable. Switching themes preserves merchant text, images and product selections.

Preview: `/v1-1/store-template-preview?theme=forme`. The preview offers Products and Services sample views and never places real orders. Demo images and labels are illustrative; installed stores use their own content.

Generated image assets (built-in image generation):
- `public/v1-1/store/forme/hero-640.webp` and `hero-1200.webp`: editorial portrait of a Black woman in a warm ivory salon, no text or logos.
- `public/v1-1/store/forme/studio-640.webp`: empty ivory salon with arched mirror, pale oak and sage details, no text or logos.
- `public/v1-1/store-template-covers/forme.webp`: screenshot of the implemented template for the picker.

The mobile hero is approximately 28 KB; the desktop hero approximately 80 KB. Existing category-cover assets supply demo card photography.

Verification: 39 backend tests (including all four installation focuses, design persistence, theme-switch content preservation and commerce regressions), 6 frontend tests (including mixed product/service actions, every-theme product recommendations, focus and preview checks), production build and browser checks at 390, 850 and 1440 pixels. No horizontal overflow observed; category filtering, product/service preview dialogs and mobile navigation verified. Not deployed.
