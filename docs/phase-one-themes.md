# Phase 1 ten demo themes

Implemented in the existing V1.1 app. Open `/v1-1/themes`, or choose **Explore ten demo themes** in the landing-page template picker. Exactly ten manifests are included: five ACTION and five LEAD. No mass category assignments were seeded.

## Architecture audit and implementation

The existing picker contained ten static placeholders with a disabled creation flow. Legacy templates use database HTML/CSS and the template editor. Custom pages already persist `customContent` arrays, use the custom builder and renderer, and publish through the protected V1.1 page API. The central backend category registry contains 735 entries with stable IDs, parents, ordering, aliases, keywords and account applicability.

Each pilot is a versioned `phase-one-theme` block inside an existing custom page. Selection deep-copies a manifest into editable page data; later catalog changes do not rewrite saved content. This needs no Page model migration and no database template seeding. Existing template and custom-element rendering remain available. Unsupported theme versions show an explicit compatibility message.

`ThemeRenderer` is used by thumbnails, mobile/desktop previews, the editor and published custom pages. Preview forms render the same controls in a disabled state. ACTION pages never render visitor forms. Composable hero, collection and about sections support ordering, optional section visibility, image URLs/uploads, crops, copy, CTA labels/destinations, prices, item addition/removal and rounded treatment. The required hero remains visible so a LEAD theme cannot accidentally lose its enquiry form.

Profile name, description, image, category, WhatsApp destination and preferred colour prefill when available. Each instance stores a profile-colour snapshot and a separate optional override. Reset fetches the current profile colour. Profile changes cannot overwrite saved page edits. Colour tokens choose black/white button text using luminance; eight dark/pale/saturated/midtone test colours meet 4.5:1. Owner WhatsApp contact links use the destination `owner`; visitor WhatsApp is a separate form field.

The existing custom builder handles local drafts and protected create/update requests. New theme draft URLs retain a draft ID for reload recovery. Saved pages continue opening through the existing `builderType: custom` path. The dashboard form detector explicitly recognizes pilot variants.

LEAD submission calls `POST /v1-1/pages/public/:slug/lead`, waits for `{ success: true }`, and displays API errors without claiming success. It uses existing international-number normalization, the company honeypot and required consent. The backend continues deriving page ownership from the slug, associating leads with the page ID and checking ownership in View Leads. Existing throttling, plan checks and notification behavior are unchanged.

The gallery obtains categories from the existing onboarding API rather than duplicating taxonomy data. Recommendations prioritize exact IDs, parent/child relationships and registry keyword/alias matches. Other categories favor general profile and service layouts. Search, ACTION/LEAD filters, tags, responsive previews, colour controls and Use Theme are available. Profile/category personalization requires the existing signed-in session.

## Pilot mapping

| Theme ID | Variant | Family | Canonical category IDs |
| --- | --- | --- | --- |
| fashion-footwear-editorial | ACTION | product-mosaic | fashion-textiles; fashion-textiles/footwear |
| restaurant-visual-menu | ACTION | editorial-split | food-beverages/restaurants |
| beauty-cinematic-hero | ACTION | cinematic-hero | hair-grooming; beauty-cosmetics |
| jewelry-luxury-showcase | ACTION | minimal-product | jewelry-accessories; jewelry-accessories/fine-jewelry |
| creator-profile | ACTION | portrait-profile | creators-personal-brands |
| makeup-bridal-enquiry | LEAD | portfolio-conversion | beauty-cosmetics/bridal-makeup; beauty-cosmetics/makeup-artistry |
| event-planner-enquiry | LEAD | modular-conversion | events-celebrations |
| real-estate-enquiry | LEAD | property-editorial | real-estate-property; real-estate-property/real-estate-agents |
| coaching-interest | LEAD | course-conversion | coaching-personal-development; education-training |
| fitness-consultation | LEAD | training-conversion | fitness-wellness; fitness-wellness/fitness-coaching |

## Imagery and destinations

No third-party photos or reference-image assets were copied. All demo artwork is original CSS geometry and visibly labeled as placeholder imagery. Owners can replace it with their own licensed photography. The brief's four inspiration images were not attached. Prices are blank until entered by the owner; no reviews, awards, guarantees or business-history claims are fabricated.

Default ACTION primary and secondary buttons navigate to the collection; item links navigate to the about section. LEAD primary and item buttons navigate to the integrated enquiry form, with secondary buttons navigating to the collection. About contact buttons use the prefilled owner WhatsApp number when valid. All destinations are editable; external shop, booking and social destinations must be supplied by the owner. HTTP(S), safe local paths, anchors, mailto and tel are allowed; script/data/protocol-relative destinations are rejected. Buttons without a destination are rendered as non-interactive text until configured.

## Validation actually performed

- `npm run build`: production build passed, including `/v1-1/themes`.
- `node --test tests/phase-one-themes.test.cjs`: 5 tests passed. Verifies exactly ten manifests, all IDs against the 735-entry registry, independent instances, five actual forms versus five form-free ACTION renderings, disabled truthful previews, profile data/JSON persistence, recommendation ordering, safe URLs and button contrast.
- `node --experimental-vm-modules --test V1.1/tests/phase-one-leads.test.mjs` in backend: 2 tests passed. Exercises the real capture and View Leads controllers with isolated in-memory model fixtures for each of the five LEAD IDs. Verifies page attribution, normalized phone, owner visibility, cross-owner denial, honeypot/invalid-phone rejection and repeat-submit throttling. Also verifies pilot and legacy form detection.
- Existing backend `V1.1/tests/page-management.test.mjs`: all 9 tests passed.
- Browser: all ten gallery previews inspected at 1024px content width and 390px mobile width, with no horizontal overflow; alternate `#315ca0` propagated to all ten renderer token sets.
- Browser: bridal preview checked at viewport widths 320, 375, 390, 430, 768, 1024 and 1440 with no horizontal overflow. Preview margins reduce actual content width below the viewport. The broader automated all-theme breakpoint sweep timed out, so this report does not claim all 70 combinations passed.
- Browser: Use Theme opened the existing custom-builder route with profile prefill. A local review draft was edited, saved, reloaded and its edited public name remained intact.
- Screenshots: desktop and mobile/alternate-colour captures are stored in `C:/Users/pc/Documents/mytilink/phase-one-evidence`. `browser-checks.json` records verified dimensions and colours. Screenshot file numbering follows the recommendation order recorded there.

## Remaining verification and limits

Live publishing, real MongoDB persistence, a real visitor submission appearing in the dashboard UI, uploaded-image handling and notification delivery have not been verified end to end. Automatic approval review blocked the Publish / update browser action as a possible public-page mutation. The passing lead tests use isolated model fixtures; they are not evidence of production writes or a live dashboard submission. No production content was published by this implementation work.

The local preview was restarted with `next dev --webpack` after the existing Turbopack font resolver failed; the app's package scripts and Next config were left unchanged. Production builds passed using the existing build command. Existing warnings remain about multiple lockfiles and old baseline-browser-mapping data.

Photographic art direction and final shop/order/book/follow destinations remain owner-provided content. The current pilot intentionally uses labeled placeholders. Full Lighthouse performance/CLS scoring and every device/assistive-technology combination have not been measured. Review these ten before authorizing any larger category rollout.

## Files changed for this implementation

Frontend:
- `V1.1/landing/themeLibrary.js`, `themeModel.js`: ten manifests, instance creation, tokens, URL policy and ranking.
- `V1.1/landing/ThemeRenderer.jsx`, `ThemeRenderer.module.css`: shared composable renderer and real lead form.
- `V1.1/landing/ThemeGallery.jsx`, `ThemeEditor.jsx`, `ThemeStudio.module.css`: gallery, preview and edit controls.
- `V1.1/landing/ThemePreview.jsx`, `ThemePreview.module.css`: renderer-backed thumbnail previews.
- `V1.1/landing/CustomBuilder.js`, `CustomPageRenderer.js`: existing builder/publishing integration and renderer dispatch.
- `V1.1/components/PageTemplateModal.jsx`, `V1.1/styles/v11.module.css`: selectable pilots and gallery entry.
- `pages/v1-1/themes.jsx`: gallery route.
- `tests/phase-one-themes.test.cjs`: rendering/model tests.
- `docs/phase-one-themes.md`: this audit and handoff.

Backend:
- `V1.1/utils/pagePresentation.js`: recognize pilot form presence.
- `V1.1/tests/phase-one-leads.test.mjs`: isolated submission/owner-attribution tests.

Other pre-existing working-tree changes were preserved. No commits or deployment were made.
