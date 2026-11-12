// Reviewed against the source paths on each record. No generated/Coming Soon claims.
const article=(id,version,title,route,steps,source,options={})=>({id,version,title,route,steps,source,status:'available',plan:'Existing account and feature entitlements apply.',updated:'2026-11-10',related:[],...options});
export const knowledge=[
 article('account','both','Registration, login, Google and email verification','/v1-1/login',['Use Login for an existing account or Registration for a new account. Complete the email verification requested by the form, or use the Google sign-in option.','Use Forgot password on Login to request a reset. Never share a password, verification code or API secret with this assistant.','New accounts start in V1.1 onboarding. Existing accounts use their saved dashboard preference; opening the upgrade preview does not migrate an account. Continue to V1.1 confirms the switch.'],['V1.1/components/auth/V11AuthPage.jsx','backend/src/routes/authRoutes.js']),
 article('onboarding','v1-1','Business onboarding and brand setup','/v1-1/dashboard',['Complete the setup prompts for your account type, business/category and brand details. Save each stage and continue through the setup shown on screen.','Store setup can be completed separately when you are ready to sell. The onboarding requirement does not itself mean an existing user migrated.'],['V1.1/components/onboarding/OnboardingWizard.jsx']),
 article('navigation','v1-1','Dashboard navigation and customization','/v1-1/dashboard',['Use Home, Landing pages, Storefront, Redirect Links and Analytics & Insights. On mobile, Help is in the middle of the bottom menu.','Use the visible dashboard cards and shortcuts; the desktop support panel offers the same Help channels. Do not assume arbitrary widget rearrangement is supported.'],['V1.1/components/Shell.jsx','V1.1/pages/HomePage.jsx']),
 article('profile','v1-1','Account settings and password','/v1-1/settings/profile',['Open your account settings to update the profile fields provided. Use the password controls shown there, or Forgot password from Login.','Keep your contact details current for account and order notifications. The assistant cannot change credentials or send verification codes.'],['V1.1/V11App.jsx','V1.1/pages/AccountPage.jsx']),
 article('pages','v1-1','Create landing pages: visitor details, form choice, templates, editors and publishing','/v1-1/pages',["Click [Landing pages](/v1-1/pages) in the dashboard navigation (Pages in the mobile bottom navigation). Click Create at the top of the list, or Create landing page if the list is empty. [Create](/v1-1/pages?action=choose-template) opens the same picker directly.", "The Select a Page template modal first asks: Do you want to collect user details on your landing page? Choose Yes for a form (such as name, WhatsApp number or email) or No for a page without a form. You must answer before choosing a design. The actual fields depend on the selected template; this choice does not guarantee every possible field.", "After answering, the picker shows Templates with a form or Templates without a form. Use Search templates or Filter templates → Category to narrow the designs. Change answer returns to the Yes/No question and clears the current selection.", "Click a design to select it, then click Use theme or Use this template, whichever the picker shows for that design. Merely clicking a thumbnail selects it; the footer button opens its editor.", "For a blank canvas, select Build from scratch, then Continue (Build from scratch). For generated content, select Build with AI, then Continue (Build with AI); this opens a separate brief form, not an instant published page.", "In the theme editor, switch to the editing controls or click editable preview text. Set your public name, logo/avatar, owner WhatsApp with country code, colors and the sections provided. Edit the actual headings, descriptions, images and button destinations for your offer. The available controls vary by theme.", "For a form template, review the form heading, fields and submit/success text offered by that editor. Some profile forms collect name and WhatsApp only. For a button-only design, enter a valid destination; an unconfigured button may be hidden. Do not assume the form question automatically adds a form to an arbitrary blank canvas.", "Preview the page and check its content and destinations. Theme-editor changes are saved as a draft; click Publish to go live. Some other editors use a Name Your Page dialog with Page title, Redirect link and Save Page. Follow the controls in the chosen editor rather than promising one universal publish dialog.", "Publishing and lead collection require eligible Pro access. If blocked, use the offered upgrade controls or [Billing](/v1-1/settings/billing); a saved draft is not proof the page is public. Return to Landing pages, open the public page link and verify the displayed content and buttons. Submit a form only when you intentionally want to create a test lead."],["V1.1/pages/PagesPage.jsx", "V1.1/components/PageTemplateModal.jsx", "V1.1/landing/ThemeEditor.jsx", "V1.1/landing/UniversalProfileEditor.jsx", "V1.1/landing/PageNameSheet.js", "V1.1/landing/AIPageBuilderModal.jsx"],{plan:'Publishing landing pages and collecting leads requires eligible Pro access; drafts and editor access do not grant publication entitlement.'}),
 article('ai-page-builder','v1-1','Build a landing page with AI: brief, visitor form, follow-up questions and editor','/v1-1/pages',["Click [Landing pages](/v1-1/pages), then [Create](/v1-1/pages?action=choose-template). Answer the visitor-details Yes/No question. Select Build with AI and click Continue (Build with AI).", "In Build a page from your idea, fill Business name and What is this page about? Describe the actual offer, purpose and content rather than just saying create a page. Add Target audience, Main offer, Button text and Redirect link.", "Choose Yes or No for the AI builder\u2019s form question: Yes saves visitor details first; No uses a direct button. This is a separate choice inside the AI brief. Specify Page main color if desired. Use a real destination URL; do not put passwords or API credentials into the brief.", "Click Continue. Answer the follow-up questions shown in the next screen. Back returns to the brief; Generate page builds and saves the generated page, then opens its editor.", "Review the generated wording, images, form/button behavior and destinations in the editor. Correct anything inaccurate, preview and follow the editor\u2019s save/publication controls. Generating content is not evidence of successful public publication; publication entitlement still applies."],['V1.1/components/PageTemplateModal.jsx','V1.1/landing/AIPageBuilderModal.jsx'],{related:['pages'],plan:'Existing page creation and Pro publication entitlements apply.'}),
 article('page-leads','v1-1','Collect visitor details, landing page forms and export leads','/v1-1/pages',["Click [Landing pages](/v1-1/pages), then Create. Answer Yes to Do you want to collect user details on your landing page? and choose a template with a form. Click Use theme or Use this template.", "Review the form controls available in that editor and publish with eligible Pro access. Template fields vary; do not promise arbitrary email/custom fields when the chosen template only collects name and WhatsApp.", "On the Landing pages list, open the page\u2019s Leads action to view submissions. Search name or WhatsApp filters the list; Refresh leads reloads it. Export all leads (CSV) exports the page records. No submissions appear until visitors actually submit the form.", "A Message on WhatsApp link is offered for a valid lead phone number. Test submission creates a real lead; it is not a preview-only action."],['V1.1/components/PageTemplateModal.jsx','V1.1/components/LeadsModal.jsx','V1.1/landing/UniversalProfileEditor.jsx'],{related:['pages']}),
 article('links','v1-1','Create redirect links: destination, design, review, custom address and sharing','/v1-1/links',["Click [Redirect Links](/v1-1/links), then its create action to open Create a redirect link. Enter Link name and choose Where should visitors go?", "For WhatsApp, choose What kind of WhatsApp destination? For a direct message choose Phone country and enter Phone number or WhatsApp link. Group/channel/message links use their actual full shared links. Other platforms use Destination link. A non-web app deep link may also require Browser fallback.", "For a WhatsApp direct message, Prefilled message is optional. Check the detected destination, then click Next.", "Choose a template or keep the default design. Search link templates can narrow the list; unavailable designs show Upgrade required. Click Next to review Link name, Destination, Type, Design and Link URL.", "Where your plan permits, Edit link address lets you change the slug; click Apply to validate it before proceeding. Changing an existing link address can stop the previous URL working.", "Click Confirm and create page (the actual final label in the redirect wizard). After Your redirect link is ready appears, click Copy link, then Done. Existing-link edits use Save changes. If a plan limit blocks creation, follow the offered upgrade path rather than creating a duplicate."],['V1.1/pages/LinksPage.jsx','V1.1/components/CreateLinkModal.jsx','backend/src/routes/linkRoutes.js'],{related:['billing']}),
 article('store','v1-1','Store setup, themes and publishing','/v1-1/store',['Open Storefront and complete store setup. Add products and configure your order/payment preferences.','Open Store Design to choose a starting style, edit your brand, sections and layout, then preview.','Publish and confirm to apply the draft to your public storefront. Choosing a starting style changes the design draft; it does not copy another merchant’s products.'],['V1.1/store/StoreStudio.jsx','V1.1/pages/StorePage.jsx'],{plan:'Storefront publication requires eligible Pro access. Do not promise that selecting a theme alone publishes a store.'}),
 article('design','v1-1','Store Design sections, layout, undo and history','/v1-1/store/design',['Tap text or an image in the preview to edit it. Brand controls style, colors, fonts and images.','In Sections, use Add Section, edit the section content and use the arrows to reorder. Layout adjusts product cards, image shapes and spacing.','Use undo/redo beside Done. History restores an already published version into your edits; Publish applies the draft to the live store.'],['V1.1/store/StoreStudio.jsx'],{related:['store']}),
 article('products','v1-1','Physical products, services, digital files and inventory','/v1-1/store/products',['Open Products and use the add product action. Choose the product type, add the title, price, images and required details, and save.','For digital products, configure the supported digital delivery/file or access details. For physical products, configure stock and delivery.','Use product editing for variants and stock options shown. Digital products use Pay now; do not assume digital files are delivered before payment is confirmed.'],['V1.1/store/ProductsManager.jsx','V1.1/store/ProductEditor.jsx'],{related:['delivery','orders']}),
 article('categories','v1-1','Categories and collections','/v1-1/store/settings?tab=categories',['Open Store settings → Categories to manage product grouping.','Use the category and collection editors offered in the catalog and assign the relevant products. Category display in Store Design is a separate presentation setting.'],['V1.1/store/StoreSettings.jsx','V1.1/store/CollectionEditor.jsx']),
 article('payments','v1-1','Payments, currencies and checkout preferences','/v1-1/store/settings?tab=payments',['Open Store settings → Payments and configure the payment methods shown. Save payments to apply changes.','Currencies and Checkout preferences have their own sections here. Additional display currencies do not imply a different order settlement currency.','Customers should complete required checkout fields; failed validation identifies missing information. Never ask customers to send card numbers or banking passwords in chat.'],['V1.1/store/StoreSettings.jsx','V1.1/store/CommerceSettings.jsx','V1.1/store/CurrencySettings.jsx']),
 article('delivery','v1-1','Delivery locations and fees','/v1-1/store/settings?tab=delivery',['Open Store settings → Delivery. Use the header toggle to enable or disable delivery.','Add delivery locations and set the applicable fees. Check the available country/state choices before saving.','Physical checkout uses configured delivery choices; do not promise delivery to a location the merchant has not configured.'],['V1.1/store/StoreSettings.jsx','V1.1/store/CommerceSettings.jsx']),
 article('discounts','v1-1','Discounts and inventory preferences','/v1-1/store/settings?tab=discounts',['Use Store settings → Discounts to configure the discount options provided.','Use Inventory for stock behavior and Products for each product’s quantity. Review the form’s eligibility and validity rules before saving.'],['V1.1/store/CommerceSettings.jsx']),
 article('orders','v1-1','Orders, customer accounts and digital delivery','/v1-1/store/orders',['Open Orders to inspect the customer, payment and fulfillment details of an order.','Customer accounts are separate from the merchant dashboard login. Customers use the account entry in the public storefront.','Digital access depends on the order and confirmed payment state. If access is missing, check the order status and configured digital content before contacting support. Never share another customer’s access link.'],['V1.1/store/OrdersManager.jsx','V1.1/store/CustomerDashboard.jsx','backend/V1.1/store/digitalPurchaseEmail.js']),
 article('tracking','v1-1','Connect pixels and integrations: provider, ID, optional API, saving and verification','/v1-1/settings/tracking',["Click [Pixel / Integrations](/v1-1/settings/tracking). Choose the actual provider card: TikTok Pixel, Meta Pixel, Snapchat Pixel, Google Analytics 4, or OpenAI / ChatGPT Pixel. If the user has not identified a provider, ask which one rather than assuming.", "The provider modal includes Setup guide. Use that guide to get the correct provider identifier. Paste it or the supported full code into Pixel ID or code; Google uses Measurement ID or code. Never ask users to paste credentials into TYK chat.", "Server-side tracking is optional and separate from a browser ID. Expand the provider API section, enable its toggle if intended, and put the API credential or Google API secret in the secure field in that screen. Saved securely \u2014 leave blank to keep it preserves an existing credential.", "Click Save connection. If the UI offers Upgrade to Pro, eligible Pro access is required; a displayed or saved ID does not bypass plan checks. Cancel closes without applying edits.", "Verify events in the provider\u2019s event manager/test tools after the page/store is published and visitor consent is given. If nothing arrives, check the resource publication, correct identifier, consent, blockers and provider setup. A saved connection alone does not prove delivery.", "Clear connection removes the pixel and API credential from the form; Save connection applies that removal. Do not recommend clearing a working connection as a routine setup step. OpenAI Ads measurement credentials are different from a model API key."],['V1.1/pages/TrackingPage.jsx','backend/V1.1/utils/trackingAccess.js'],{plan:'V1.1 tracking requires an active Pro plan. Saved credentials do not bypass expiry or event prerequisites.'}),
 article('insights','v1-1','Analytics and insights','/v1-1/insights',['Open Analytics & Insights for the available account overview. Open individual links/pages or store insights for the relevant detail.','Choose the available date range and confirm the resource was published and tracking was enabled. Empty data does not necessarily mean a tracking failure.'],['V1.1/V11App.jsx']),
 article('billing','v1-1','Free, Standard, Pro, monthly/yearly billing and expiry','/v1-1/settings/billing',['Open billing to view your current plan and available upgrades or renewal. Review the displayed checkout price before paying.','Monthly and yearly plans have different allowances. Expired paid access does not mean your account or resources should be recreated.','Dashboard switching is free; it does not grant paid features. Only supported upgrade options shown by billing can be selected.'],['V1.1/config/plans.js','config/planConfig.js','backend/src/config/planConfig.js']),
 article('domains','both','Custom domains and existing public URLs','/store/settings',['Existing supported custom domains remain associated with their store. Keep existing DNS and domain configuration unless the verified domain settings instruct you to change it.','Do not assume V1.1 has a new domain setup screen or that every landing page supports domains. Ask which resource/dashboard the user means, then use the available settings or support.','Public links use mytiklink.com; mytik.link is the API host, not a public product-page base.'],['pages/index.js','components/store/public/PublicStorefront.js'],{status:'limited',plan:'Subject to existing domain support and plan eligibility.'}),
 article('availability','v1-1','Affiliate, integrations catalog and Live Chat availability','/v1-1/help',['The V1.1 Affiliate page and separate Integrations catalog show an in-progress screen. Do not describe referral earnings, payouts or an integrations marketplace as available there.','Pixel / Integrations is a separate working tracking screen. Live Chat is marked Coming soon in Help. Use WhatsApp, email or Telegram instead.'],['V1.1/V11App.jsx','V1.1/config/helpChannels.js'],{status:'coming-soon'}),
 article('notifications','both','Email notifications and account safety','/v1-1/help',['Verification, password-reset and eligible order/account notifications use existing email services. Check the email address, spam folder and actual order/payment state.','In V1.1 Account settings → Email, the Personalized product tips, offers and updates checkbox controls marketing guidance. Security codes and essential account messages continue.','The AI cannot resend an email, refund a payment, publish a page or change an account. Use the supported screen or contact support.'],['backend/src/routes/authRoutes.js','backend/src/lifecycle/catalog.js','V1.1/components/EmailPreferences.jsx']),
 article('help','both','Help and human support','/v1-1/help',['Choose Ask MyTikLink AI for product instructions. WhatsApp support: https://wa.me/2348129037939. Email: support@mytiklink.com. Telegram community: https://t.me/mytiklink.','Live Chat is Coming soon. Never request passwords, verification codes, API tokens or private customer records.'],['V1.1/config/helpChannels.js']),
 article('legacy-home','legacy','Previous dashboard navigation','/dashboard',['Use My Links for redirects, My Pages for landing pages, Analytics for reports, TikTok/Meta Pixel for tracking, My Store for commerce and Settings for your profile/plan.','The V1.1 invitation is optional. Try the new version opens a preview; Not now stays in the previous dashboard. Continue to V1.1 saves your preference without duplicating resources.'],['components/DashboardLayout.jsx','V1.1/components/UpgradeInvitation.jsx']),
 article('legacy-pages','legacy','Create or edit landing pages in the previous dashboard','/dashboard/page',['Open My Pages and choose Create Page. Select a template and edit its text, images and call-to-action destination.','Use the editor save/publication controls shown for that template. Existing templates may differ from V1.1; do not instruct a legacy user to use V1.1-only tabs.','Check your plan and publication status if the public page is unavailable.'],['pages/dashboard/page/index.js','components/custom/renderer/CustomPageRenderer.js'],{plan:'Pro publication rules apply.'}),
 article('legacy-links','legacy','Previous redirect links and analytics','/dashboard/links',['Open My Links, enter a supported destination and title, and create the link.','Use the existing edit and analytics actions. Keep the complete WhatsApp channel/group or Telegram URL. Check your current link and click limits.'],['pages/dashboard/links.js','backend/src/routes/linkRoutes.js']),
 article('legacy-tracking','legacy','Previous TikTok/Meta Pixel settings','/dashboard/tiktok-pixel',['Open TikTok/Meta Pixel from the menu. Paste the TikTok or Meta Pixel ID/code in its corresponding field and save.','Use the provider test tools on a published page. Do not confuse a pixel ID with a server API secret. New V1.1 provider controls are in Pixel / Integrations after switching dashboard.'],['pages/dashboard/tiktok-pixel.js']),
 article('legacy-store','legacy','Previous store, products, orders and settings','/store',['Open My Store. Use Products to manage catalog items, Orders to inspect purchases and Store settings for available store configuration.','Existing retired store themes retain their original renderer. Switching dashboards does not silently publish a replacement theme.','Configure newer checkout features only through the supported V1.1 flow when appropriate; do not assume an older store has digital delivery/payment settings.'],['components/store/layout/StoreLayout.js','components/store/public/PublicStorefront.js']),
 article('legacy-billing','legacy','Previous dashboard plan and account settings','/dashboard/settings',['Open Settings to manage your profile, password and available plan upgrade or renewal.','Review the current billing screen for exact price, plan expiry and supported changes. Switching to V1.1 does not reset a subscription.'],['pages/dashboard/settings.js'])
];

// Source-reviewed additions; rollout is not a claim of production availability.
knowledge.push(...[
  {
    "id": "plan-payment-methods",
    "version": "v1-1",
    "title": "Upgrade plan: pay with bank transfer or card",
    "route": "/v1-1/settings/billing",
    "steps": [
      "Open Billing and Payments, choose your plan and Monthly or Yearly, then continue to the payment-method step. Review the actual amount shown; upgrades may have adjusted prices. These payments purchase your MyTikLink plan, not an order from a merchant store.",
      "Pay with bank transfer generates temporary transfer details inside the upgrade modal. Copy the amount, account number, bank name and account name. Send the exact amount before expiry. I have made the transfer checks the payment status; clicking it alone does not confirm payment. If already paid, check status or contact support rather than paying again. Do not send to expired details. Bank transfer does not enable auto-renewal.",
      "Pay with card opens Paystack hosted checkout to authenticate and pay together. Auto-renew my subscription is checked by default in checkout; untick it for a one-time payment. The renewal interval follows the selected monthly or yearly plan. Never send card details to TYK.",
      "After verified payment, opted-in renewal is scheduled after the paid period; it is not an extra immediate authentication charge. Check the payment result and Billing and Payments for the resulting plan and renewal status."
    ],
    "source": [
      "V1.1/components/UpgradePayment.jsx",
      "V1.1/components/SubscriptionModal.jsx",
      "backend/src/services/billingRenewals.js"
    ],
    "status": "rollout",
    "updated": "2026-11-12",
    "plan": "Existing account entitlements and access permissions apply.",
    "related": []
  },
  {
    "id": "card-auto-renewal",
    "version": "v1-1",
    "title": "Saved card and auto-renewal: activate or cancel subscription",
    "route": "/v1-1/settings/billing",
    "steps": [
      "Open account settings → Billing and Payments → Card and auto-renewal. The server result determines the controls shown. A request error or unavailable endpoint means status is unknown, not that you have no card or that renewal is off. Retry/refresh; if it persists contact support. This updated panel requires the matching backend release.",
      "With active renewal, review the masked card, amount, interval and next renewal date. Choose Cancel auto-renewal and confirm. Cancellation stops future renewal and preserves already-paid access until expiry; it is not a refund or account deletion.",
      "With an eligible saved reusable card and renewal off, the consent checkbox starts unchecked in settings. Select it and choose Activate auto-renewal. Activation schedules renewal after the current paid period without an immediate charge. Card ownership, current plan and reusable authorization must be verified by the server.",
      "Without an eligible card, use Add card & activate or Use a different card. This opens a clearly priced plan payment through Paystack: it charges for a plan period and extends paid time, then schedules renewal. It is not free card linking. Free or expired accounts must select/pay for an eligible plan. Never claim activation succeeded until confirmed by the service."
    ],
    "source": [
      "V1.1/components/RenewalSettings.jsx",
      "backend/src/services/billingRenewals.js"
    ],
    "status": "rollout",
    "updated": "2026-11-12",
    "plan": "Existing account entitlements and access permissions apply.",
    "related": []
  },
  {
    "id": "account-deletion",
    "version": "v1-1",
    "title": "Delete my account permanently versus suspension",
    "route": "/v1-1/settings/profile",
    "steps": [
      "In account settings find Delete your MyTikLink account and choose Delete account. Read the consequences, type DELETE and enter the full account name exactly as displayed. Choose Send verification code. In Confirm account deletion enter the emailed six-digit code yourself and choose Permanently delete account. The code expires after ten minutes; never share it with TYK or support. Keep my account cancels before final confirmation.",
      "Deletion removes the account and associated platform content; suspension only restricts access and is a different action. Required transaction and audit records may be retained, so do not promise every financial record is erased.",
      "Active billing, pending paid orders or other processing work can block deletion. Follow the exact blocker shown and contact support if needed. Cancelling auto-renewal does not necessarily remove all blockers immediately or end the paid period. TYK cannot delete accounts or bypass verification.",
      "This self-service screen is part of the pending release. If absent, use verified support; do not invent a delete button on older screens."
    ],
    "source": [
      "V1.1/components/DeleteAccount.jsx",
      "backend/src/account/routes.js",
      "backend/src/control/accountDeletion.js"
    ],
    "status": "rollout",
    "updated": "2026-11-12",
    "plan": "Existing account entitlements and access permissions apply.",
    "related": []
  },
  {
    "id": "cart-checkout",
    "version": "v1-1",
    "title": "Store cart, checkout required fields, quantity and payment",
    "route": "/v1-1/store",
    "steps": [
      "On the public storefront, add physical products to the cart, choosing required variants. Open the cart to review items, change quantities within stock limits or Remove an item. Carts belong to the individual store. Digital products use Pay now by default.",
      "Continue from Your cart to checkout details. Required fields show inline validation when confirmation is attempted, and the first invalid field is brought into view. Complete the highlighted fields, including applicable delivery information. Both physical and digital checkout validate their required information.",
      "Review the order summary, subtotal, applicable discounts, delivery and final total. Payment choices depend on the merchant settings. A transfer proof or WhatsApp order message is not proof of verified payment. Digital access depends on confirmed payment.",
      "The public storefront account icon opens its customer login/account drawer directly. Customer accounts and merchant dashboard accounts are separate. Review and account dialogs follow the storefront theme. Use the actual public store/product link on mytiklink.com, not the API host mytik.link."
    ],
    "source": [
      "V1.1/store/PublicStore.jsx",
      "V1.1/store/CommercePublic.jsx",
      "V1.1/store/CustomerDrawer.jsx"
    ],
    "status": "available",
    "updated": "2026-11-12",
    "plan": "Existing account entitlements and access permissions apply.",
    "related": []
  },
  {
    "id": "inbox-media",
    "version": "both",
    "title": "Inbox audio playback, images, videos and message bubbles",
    "route": "/crm-inbox",
    "steps": [
      "For authorized inbox staff, audio appears in a chat player with play/pause. Tap its playback speed to cycle through 1x, 1.5x, 2x, 2.5x and 3x, then return to 1x. Images and videos display in bubbles with loading placeholders; media is loaded in batches/lazily rather than downloading all history at once.",
      "Browser-compatible audio handling is implemented, including conversion where needed. Do not guarantee every device or file will play. If playback fails, ask for browser/device and the visible error without requesting private messages, and escalate persistent failures.",
      "Outgoing messages appear immediately with their current sending/failure status, and should appear as the latest conversation preview while pending. This is not proof of successful delivery. Date badges show Today, Yesterday, or a compact date such as 26th Sept 2026.",
      "Ordinary customer messages should not increment the separate Alerts list/count. Push notifications are separate; staff/assignment alerts can still appear."
    ],
    "source": [
      "components/StaffInbox/StaffInbox.jsx",
      "components/StaffInbox/AudioPlayer.jsx",
      "components/StaffInbox/MessageAttachment.jsx",
      "backend/src/staff/browserAudio.js"
    ],
    "status": "available",
    "updated": "2026-11-12",
    "plan": "Existing account entitlements and access permissions apply.",
    "related": []
  },
  {
    "id": "inbox-receipts",
    "version": "both",
    "title": "WhatsApp message one tick, double tick and blue read ticks",
    "route": "/crm-inbox",
    "steps": [
      "For authorized inbox staff, sending, sent, delivered and read are distinct statuses. Double delivery ticks and blue read ticks depend on actual WhatsApp/Meta delivery and read callbacks. A customer reply alone does not prove a specific earlier message was read.",
      "If messages stay at one tick, report the affected time and visible status through support. Production callback receipt still needs confirmation; do not claim this external delivery issue is resolved merely because the UI supports ticks. TYK cannot inspect private conversations or repair Meta webhooks."
    ],
    "source": [
      "components/StaffInbox/StaffInbox.jsx",
      "backend/src/staff/receipts.js"
    ],
    "status": "available",
    "updated": "2026-11-12",
    "plan": "Existing account entitlements and access permissions apply.",
    "related": []
  }
]);

const reviewedChanges = {
 onboarding: ['Choose a concrete business focus: Physical products, Physical services, Digital products or Digital services. The uncertain option was removed from business focus. “I’m not sure yet” in what to create first is a separate choice and is not a product/service category.'],
 store: ['If an older account has unresolved business focus, the storefront template-selection flow lets you select the required account type/focus there and save it without first leaving for account settings. Saving a category alone may not resolve missing business focus.'],
 billing: ['Plan upgrades now have bank-transfer and card choices in the updated modal. Refer to plan-payment-methods and card-auto-renewal for the reviewed flow; these controls require the matching frontend/backend release. Store settings → Payments configures customer checkout and is separate from your MyTikLink subscription.']
};
for (const item of knowledge) {
 if (reviewedChanges[item.id]) { item.steps.push(...reviewedChanges[item.id]); item.updated='2026-11-12'; }
 if (item.id==='store') item.source.push('V1.1/store/themeRecommendations.js');
 if (item.id==='pages') {
  item.steps=item.steps.map(step=>step.startsWith('In the theme editor, switch') ? 'The template editor opens the designed preview. Tap editable text or images to open Edit your page and bring the matching input into view. Previously built templates use this modal editing flow too. Edit the available headings, descriptions, images and button destinations; controls vary by theme. The preview keeps rounded corners and can scroll without a visible scrollbar.' : step);
  item.updated='2026-11-12';
 }
}

export const supportRoutes=[...new Set(knowledge.map(a=>a.route).concat(['/v1-1/pages?action=choose-template','/v1-1/register','/v1-1/settings/profile?section=email','/v1-1/pages/create','/v1-1/pages/builder','/v1-1/pages/editor','/v1-1/analytics','/v1-1/store/settings','/v1-1/store/settings?tab=inventory','/store/products','/store/orders','/store/design','/dashboard/analytics','/FAQ','/store-tutorial']))];
export function resolveVersion(question,saved){
 if(/\b(previous|legacy|old)\s+(dashboard|version)\b/i.test(question))return 'legacy';
 if(/\bv\s?1[.-]1\b|\bnew dashboard\b/i.test(question))return 'v1-1';
 return ['legacy','v1-1'].includes(saved)?saved:'unknown';
}
export function retrieveKnowledge(question,version,route=''){
 const words=question.toLowerCase().match(/[a-z0-9]{3,}/g)||[];
 return knowledge.filter(a=>version==='unknown'||a.version==='both'||a.version===version).map(a=>({a,score:words.reduce((n,w)=>n+(a.title.toLowerCase().includes(w)?5:0)+(a.steps.join(' ').toLowerCase().includes(w)?1:0),0)+(a.route===route?30:0)})).sort((a,b)=>b.score-a.score).slice(0,7).map(({a})=>a);
}
export function safeSupportHref(value){
 if(typeof value!=='string'||/[\\\s\x00-\x1f]/.test(value)||/%(?:2f|5c|2e)/i.test(value))return null;
 if(['https://wa.me/2348129037939','https://t.me/mytiklink','mailto:support@mytiklink.com'].includes(value))return value;
 try{const u=new URL(value,'https://mytiklink.com');if(u.origin!=='https://mytiklink.com'||u.hash||u.username||u.password)return null;const path=u.pathname+u.search;return supportRoutes.includes(path)?path:null;}catch{return null;}
}
