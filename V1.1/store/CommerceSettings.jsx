import CurrencySettings from "./CurrencySettings";
import {FaInstagram,FaFacebook,FaTiktok,FaYoutube,FaTwitter,FaLinkedin,FaGlobe} from "react-icons/fa";
import CollectionEditor from "./CollectionEditor";
import {SmallLoading,ProductSelection} from "./CatalogControls";
import NumericInput from "../components/NumericInput";
import PaymentMethods from "./PaymentMethods";
import DeliveryCountries from "./DeliveryCountries";
import SettingsHelp from "./SettingsHelp";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  Download,
  Check,
  ChevronDown,
  MapPin,
  MoreHorizontal,
  Pencil,
  Store,
  Truck,
} from "lucide-react";
import { apiRequest } from "../lib/api";
import { Button, Field, Modal } from "../components/UI";
import { notify } from "../components/Notifications";
import ImagePicker from "./ImagePicker";
import css from "./StoreSettings.module.css";
const root = "/v1-1/store-studio/commerce";
const localDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
const money = (v) => (Number(v || 0) / 100).toFixed(2);
const minor = (v) => Math.round(Number(v || 0) * 100);

// The API is the source of truth. These fallbacks only keep an existing draft
// usable while a merchant is offline or before the location service responds.
const NIGERIA = { id: "NG", code: "NG", name: "Nigeria", currency: "NGN" };
const NIGERIA_REGIONS = [
  ["ng-abia", "Abia"], ["ng-adamawa", "Adamawa"], ["ng-akwa-ibom", "Akwa Ibom"],
  ["ng-anambra", "Anambra"], ["ng-bauchi", "Bauchi"], ["ng-bayelsa", "Bayelsa"],
  ["ng-benue", "Benue"], ["ng-borno", "Borno"], ["ng-cross-river", "Cross River"],
  ["ng-delta", "Delta"], ["ng-ebonyi", "Ebonyi"], ["ng-edo", "Edo"],
  ["ng-ekiti", "Ekiti"], ["ng-enugu", "Enugu"], ["ng-federal-capital-territory", "Federal Capital Territory (FCT)"],
  ["ng-gombe", "Gombe"], ["ng-imo", "Imo"], ["ng-jigawa", "Jigawa"],
  ["ng-kaduna", "Kaduna"], ["ng-kano", "Kano"], ["ng-katsina", "Katsina"],
  ["ng-kebbi", "Kebbi"], ["ng-kogi", "Kogi"], ["ng-kwara", "Kwara"],
  ["ng-lagos", "Lagos"], ["ng-nasarawa", "Nasarawa"], ["ng-niger", "Niger"],
  ["ng-ogun", "Ogun"], ["ng-ondo", "Ondo"], ["ng-osun", "Osun"], ["ng-oyo", "Oyo"],
  ["ng-plateau", "Plateau"], ["ng-rivers", "Rivers"], ["ng-sokoto", "Sokoto"],
  ["ng-taraba", "Taraba"], ["ng-yobe", "Yobe"], ["ng-zamfara", "Zamfara"],
].map(([id, name]) => ({
  id,
  name,
  countryCode: "NG",
  aliases: id === "ng-federal-capital-territory" ? ["FCT", "Abuja", "Federal Capital Territory"] : [],
}));
const ESTIMATE_PRESETS = [
  { id: "same-day", label: "Same day", min: 0, max: 0, unit: "day", businessDays: false, text: "Same day" },
  { id: "next-day", label: "Next day", min: 1, max: 1, unit: "day", businessDays: false, text: "Next day" },
  { id: "one-two", label: "1–2 business days", min: 1, max: 2, unit: "day", businessDays: true, text: "1–2 business days" },
  { id: "two-four", label: "2–4 business days", min: 2, max: 4, unit: "day", businessDays: true, text: "2–4 business days" },
  { id: "three-seven", label: "3–7 business days", min: 3, max: 7, unit: "day", businessDays: true, text: "3–7 business days" },
];
const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `delivery-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatMoney = (value, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 0,
    }).format(Number(value || 0) / 100);
  } catch {
    return money(value);
  }
};
const deliveryEnabled = (delivery = {}) =>
  delivery.enabled !== undefined
    ? delivery.enabled === true
    : (delivery.rules || delivery.zones || []).some((zone) => zone.enabled !== false);
// `zones` is the persisted v1.1 shape. `rules` existed briefly in an earlier
// draft, so keep reading it only when a merchant has not yet got zones.
const deliveryRules = (delivery = {}) => {
  if (Array.isArray(delivery.zones) && delivery.zones.length) return delivery.zones;
  if (Array.isArray(delivery.rules) && delivery.rules.length) return delivery.rules;
  if (Array.isArray(delivery.zones)) return delivery.zones;
  return Array.isArray(delivery.rules) ? delivery.rules : [];
};
const nigeriaCountryCode = (value) => {
  const code = String(value || "").trim().toUpperCase();
  return ["NG", "NGA", "NIGERIA", "234", "+234"].includes(code) ? "NG" : code;
};
const zoneCountryCode = (zone = {}) =>
  nigeriaCountryCode(zone.countryCode || zone.countries?.[0]) || "NG";
const zoneCoverage = (zone = {}) =>
  zone.coverage || (zone.areaIds?.length || zone.cities?.length ? "areas" : zone.regionId || zone.states?.length ? "state" : "country");
// Only legacy zones that cannot be mapped safely are kept read-only. Raw
// Nigerian state names can migrate into the Nigeria-only editor instead.
const legacyDeliveryZone = (zone = {}) => {
  const countries = [...new Set([
    ...(Array.isArray(zone.countries) ? zone.countries : []),
    ...(zone.countryCode ? [zone.countryCode] : []),
  ].map(nigeriaCountryCode).filter(Boolean))];
  const hasForeignCountry = countries.some((country) => country !== "NG");
  const hasMultipleCountries = countries.length > 1;
  const legacyState = zone.states?.[0] || "";
  const matchedRegion = matchLocation(NIGERIA_REGIONS, zone.regionId, legacyState);
  const coverage = zoneCoverage(zone);
  const hasKnownNigeriaRegion = Boolean(matchedRegion);
  const isNigerianLegacy =
    countries.every((country) => country === "NG") &&
    (countries.length > 0 || hasKnownNigeriaRegion);
  const canMigrate =
    isNigerianLegacy &&
    ["country", "state", "areas"].includes(coverage) &&
    (coverage === "country" || hasKnownNigeriaRegion);
  if (canMigrate) return null;
  if (hasMultipleCountries)
    return "This older rule covers more than one country. It remains unchanged and read-only.";
  if (hasForeignCountry)
    return "This older rule uses a country not supported by the new delivery editor. It remains unchanged and read-only.";
  return "This older rule does not use the new verified-location format. It remains unchanged and read-only.";
};
const estimateText = (zone = {}) => {
  if (zone.estimate) return zone.estimate;
  const range = zone.estimateRange;
  if (!range) return "Delivery time not set";
  const days = range.unit === "hour" ? "hours" : range.businessDays ? "business days" : "days";
  return range.min === range.max ? `${range.min} ${days}` : `${range.min}–${range.max} ${days}`;
};
const locationName = (zone = {}, regions = []) => {
  if (zone.name) return zone.name;
  if (zoneCoverage(zone) === "country") return zoneCountryCode(zone) === "NG" ? "Nigeria" : zoneCountryCode(zone);
  const region = regions.find((item) => item.id === zone.regionId);
  return region?.name || zone.states?.[0] || "Delivery location";
};
const normaliseDeliveryConfig = (config = {}) => {
  const delivery = config.delivery || {};
  const zones = deliveryRules(delivery);
  const { rules: _legacyRules, ...deliveryWithoutLegacyRules } = delivery;
  return {
    ...config,
    delivery: {
      ...deliveryWithoutLegacyRules,
      // `rules` from an early draft has now been migrated into `zones`.
      // Only `zones` is sent back to the current API.
      zones,
      pickups: Array.isArray(delivery.pickups) ? delivery.pickups : [],
      instructions: delivery.instructions || "",
      enabled: deliveryEnabled(delivery),
    },
  };
};
export function CommerceSettingsPanel({ tab, setup = {}, onDirtyChange }) {
  const [config, setConfig] = useState(null),
    [saved, setSaved] = useState(null),
    [revision, setRevision] = useState(0),
    [history, setHistory] = useState([]),
    [capabilities, setCapabilities] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [entry, setEntry] = useState(null),
    [deleteEntry, setDeleteEntry] = useState(null),
    [discard, setDiscard] = useState(false);
  const [paymentStore,setPaymentStore]=useState({businessType:setup.businessType,bank:{name:setup.bankName,accountName:setup.accountName,accountNumber:setup.accountNumber}});
  const lock = useRef(false);
  const load = async () => {
    const d = await apiRequest(`${root}/config`);
    const loadedConfig=normaliseDeliveryConfig({...d.config,identity:{showFloatingWhatsapp:true,showRecommendations:true,...d.config.identity}});
    setConfig(loadedConfig);
    setSaved(loadedConfig);
    setRevision(d.revision);
    setHistory(d.history);
    setCapabilities(d.capabilities);
    if(d.paymentStore)setPaymentStore(d.paymentStore);
  };
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  const dirty = !!config && JSON.stringify(config) !== JSON.stringify(saved);
  useEffect(() => {
    const leave = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  const set = (group, key, value) =>
    setConfig((c) => ({ ...c, [group]: { ...c[group], [key]: value } }));
  const section={Branding:'identity',Payments:'checkout',Inventory:'inventory',Policies:'policies',SEO:'seo',Advanced:'identity'}[tab];
  const sectionDirty=!!section&&!!config&&JSON.stringify(config[section])!==JSON.stringify(saved?.[section]);
  const saveSection=async()=>{
   if(lock.current||!section)return;lock.current=true;setBusy(true);setError('');
   try{const d=await apiRequest(`${root}/settings/${section}`,{method:'PUT',body:JSON.stringify({value:config[section],revision})});setConfig(c=>({...c,[section]:d.value}));setSaved(c=>({...c,[section]:d.value}));setRevision(d.revision);notify.success(`${tab} settings saved`);}
   catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}
  };
  const saveToggle=async(group,key,value)=>{
   if(lock.current)return;lock.current=true;setBusy(true);setError('');
   try{const d=await apiRequest(`${root}/settings/${group}`,{method:'PUT',body:JSON.stringify({value:{[key]:value},revision})});
    setConfig(c=>({...c,[group]:{...c[group],[key]:d.value[key]}}));setSaved(c=>({...c,[group]:{...c[group],[key]:d.value[key]}}));setRevision(d.revision);notify.success('Setting saved');
   }catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}
  };
  const persistDelivery = async (delivery) => {
    if (lock.current) throw Error("Wait for the current save to finish.");
    lock.current = true; setBusy(true); setError("");
    try {
      const d = await apiRequest(`${root}/delivery`, { method: "PUT", body: JSON.stringify({ delivery, revision }) });
      setConfig(current => ({ ...current, delivery: d.delivery }));
      setSaved(current => ({ ...current, delivery: d.delivery }));
      setRevision(d.revision);
    } finally { lock.current = false; setBusy(false); }
  };
  const persistPayment=async(method,value)=>{
    if(lock.current)throw Error('Wait for the current save to finish.');
    lock.current=true;setBusy(true);
    try{const d=await apiRequest(`${root}/payments/${method}`,{method:'PUT',body:JSON.stringify({...value,revision})});
      const merge=current=>({...current,checkout:{...current.checkout,paymentMethods:d.checkout.paymentMethods,paymentInstructions:d.checkout.paymentInstructions}});
      setConfig(merge);setSaved(merge);setRevision(d.revision);setPaymentStore(d.paymentStore);
    }finally{lock.current=false;setBusy(false);}
  };
  const updateDeliveryDraft = async (changes, message) => {
    await persistDelivery({ ...config.delivery, ...changes });
    notify.success(message || "Delivery settings saved");
  };
  if (!config)
    return (
      error?<p role="alert">{error}</p>:<SmallLoading label="Loading settings…"/>
    );
  const text = (group, key, label, type = "text", hint = "") => (
    <Field key={`${group}-${key}`} label={label} hint={hint}>
      {type === "textarea" ? (
        <textarea
          rows={4}
          aria-label={label}
          value={config[group][key] || ""}
          onChange={(e) => set(group, key, e.target.value)}
        />
      ) : (
        <input
          type={type}
          aria-label={label}
          value={config[group][key] ?? ""}
          placeholder={setup[key] || ""}
          onChange={(e) =>
            set(
              group,
              key,
              e.target.value,
            )
          }
        />
      )}
    </Field>
  );
  const check = (group, key, label) => (
    <label className={css.check}>
      <input
        type="checkbox"
        checked={!!config[group][key]}
        disabled={busy}
        onChange={(e) => saveToggle(group, key, e.target.checked)}
      />
      {label}
    </label>
  );
  const method = (key, label) => (
    <label className={css.check}>
      <input
        type="checkbox"
        checked={config.checkout.paymentMethods.includes(key)}
        onChange={(e) =>
          set(
            "checkout",
            "paymentMethods",
            e.target.checked
              ? [...config.checkout.paymentMethods, key]
              : config.checkout.paymentMethods.filter((k) => k !== key),
          )
        }
      />
      {label}
    </label>
  );
  const saveDeliveryEntry = async (kind, index, value) => {
    const source = kind === "rules" ? deliveryRules(config.delivery) : (config.delivery[kind] || []);
    const nextItems = index < 0
      ? [...source, value]
      : source.map((item, itemIndex) =>
          itemIndex === index ? value : item,
        );
    await updateDeliveryDraft(
      { [kind]: nextItems },
      index < 0 ? "Delivery location saved" : "Delivery location updated",
    );
  };
  const removeDeliveryEntry = async (kind, index) =>
    updateDeliveryDraft(
      {
        [kind]: (kind === "rules" ? deliveryRules(config.delivery) : (config.delivery[kind] || [])).filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
      "Removed from your delivery draft",
    );
  const newZone = () => ({
    id: createId(),
    name: "",
    countryCode: "NG",
    countries: ["NG"],
    regionId: "",
    states: [],
    coverage: "state",
    areaIds: [],
    cities: [],
    postcodes: [],
    feeMinor: 0,
    freeAboveMinor: null,
    estimate: "2–4 business days",
    estimateRange: { min: 2, max: 4, unit: "day", businessDays: true },
    enabled: true,
    excluded: false,
  });
  const newPickup = () => ({
    id: createId(),
    name: "",
    countryCode: "NG",
    regionId: "",
    areaId: "",
    address: "",
    phone: "",
    hours: "",
    readiness: "",
    instructions: "",
    enabled: true,
  });
  return (
    <>
      {tab!=="Discounts"&&<div className={css.panelHeading}>
        <div>
          <h2>{tab} <SettingsHelp topic={tab}/></h2>
          <p>{tab==="Payments"?"Choose how customers can pay for orders from your store.":tab==="Delivery"?"Choose where you deliver and what customers pay.":"Manage your store settings."}</p>
        </div>
      </div>}
      {tab === "Branding" && (
        <div className={css.form}>
          {text("identity", "name", "Brand name")}
          {text("identity", "description", "Store Description", "textarea")}
          {text("identity", "phone", "WhatsApp number")}
          {text("identity", "email", "Contact email", "email")}
          {text("identity", "address", "Store address", "textarea")}
          {text("identity", "hours", "Opening hours", "textarea")}
          {check("identity", "showPhone", "Show contact number")}
          {check("identity", "showEmail", "Show contact email")}
          {check("identity", "showFloatingWhatsapp", "Show floating WhatsApp button")}
          {check("identity", "showOrderWhatsapp", 'Show "Send Order on WhatsApp" on order received page')}
          {check("identity", "showRecommendations", "Show You may also like on product pages")}
          {Object.keys(config.identity.socials).map((key) => (
            <Field label={<span style={{display:"inline-flex",alignItems:"center",gap:7}}>{(() => {const Icon=({instagram:FaInstagram,facebook:FaFacebook,tiktok:FaTiktok,youtube:FaYoutube,twitter:FaTwitter,x:FaTwitter,linkedin:FaLinkedin})[key]||FaGlobe;return <Icon aria-hidden="true"/>;})()}{key} link</span>} key={key}>
              <input
                type="url"
                placeholder="https://…"
                value={config.identity.socials[key]}
                onChange={(e) =>
                  set("identity", "socials", {
                    ...config.identity.socials,
                    [key]: e.target.value,
                  })
                }
              />
            </Field>
          ))}
          <a href="/v1-1/store/design" className={css.textLink}>
            Edit logo, fonts, colours and sections <ArrowUpRight size={16} />
          </a>
        </div>
      )}
      {tab === "Delivery" && (
        <div className={css.deliverySettings}>
          <DeliveryCountries digital={paymentStore.businessType==="digital"} delivery={config.delivery} currency={config.checkout.currency} busy={busy} onSave={persistDelivery} />

          <section className={css.deliverySection}><div className={css.deliverySectionHeading}><h3>Pickup locations</h3><span>Coming soon</span></div><p>Let customers collect orders from your store. This feature will be available soon.</p></section>
          {text("delivery", "instructions", "Delivery note for customers", "textarea")}
          <Button disabled={busy} onClick={()=>updateDeliveryDraft({},"Delivery note saved").catch(e=>setError(e.message))}>Save delivery note</Button>
        </div>
      )}
      {tab === "Payments" && <PaymentMethods checkout={config.checkout} store={paymentStore} busy={busy} onSave={persistPayment}/>}
      {tab === "Payments" && (
        <div className={css.form}>
          <CurrencySettings checkout={config.checkout} busy={busy} onChange={value=>set("checkout","displayCurrencies",value)}/><h3>Checkout preferences</h3>
          {check("checkout", "requireEmail", "Require an email address")}
          {paymentStore.businessType!=="digital"&&check("checkout", "allowNotes", "Allow order notes")}
          <Field label="Tax rate (%)">
            <NumericInput
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={config.checkout.taxRateBps / 100}
              onChange={(e) =>
                set(
                  "checkout",
                  "taxRateBps",
                  Math.round(Number(e.target.value) * 100),
                )
              }
            />
          </Field>
          {check("checkout", "taxInclusive", "Prices already include tax")}
          {text("checkout", "taxLabel", "Tax label")}
          {text(
            "checkout",
            "reservationMinutes",
            "Hold unpaid stock for (minutes)",
            "number",
          )}
          <p>
            Guest checkout is enabled. Review tax and policy settings for your
            business before publishing.
          </p>
        </div>
      )}
      {tab === "Inventory" && (
        <div className={css.form}>
          {text(
            "inventory",
            "lowStockThreshold",
            "Low-stock alert threshold",
            "number",
          )}
          {check("inventory", "trackStock", "Track stock on new products")}
          <p>
            Stock is reserved when a customer places an order. Cancelled and
            expired unpaid orders release their stock. Backorders are disabled
            to prevent overselling.
          </p>
          <a className={css.textLink} href="/v1-1/store/products">
            Manage products and variants <ArrowUpRight size={16} />
          </a>
        </div>
      )}
      {tab === "Policies" && (
        <div className={css.form}>
          {Object.keys(config.policies).map((key) =>
            text(
              "policies",
              key,
              {
                shipping: "Delivery policy",
                returns: "Returns & refunds",
                privacy: "Privacy policy",
                terms: "Terms of sale",
              }[key],
              "textarea",
            ),
          )}
          <p>
            These are your store’s policies. Review the wording before saving.
          </p>
          <ReviewManager />
        </div>
      )}
      {tab === "SEO" && <section className={css.note}><h3>Search engine optimisation <small>Coming soon</small></h3><p>More tools to help customers discover your store are on the way.</p></section>}
      {tab === "Integrations" && (
        <div className={css.form}>
          {text("integrations", "ga4", "Google Analytics measurement ID")}
          {text("integrations", "metaPixel", "Meta pixel ID")}
          {text("integrations", "tiktokPixel", "TikTok pixel ID")}
          <p>
            Tracking starts only after the visitor accepts analytics. IDs are
            public; never paste API secrets here.
          </p>
          {check("notifications", "email", "Send order email notifications")}
          <p>
            Email provider:{" "}
            {capabilities.email
              ? "Configured"
              : "Not configured — notifications will stay queued until a provider is configured."}
          </p>
          {text("marketing", "newsletterTitle", "Signup heading")}
          {text(
            "marketing",
            "consentText",
            "Signup consent wording",
            "textarea",
          )}
        </div>
      )}
      {tab === "Discounts" && <ResourceManager kind="discounts"/>}
      {tab === "Customers" && <Customers />}
      {tab === "Advanced" && (
        <div className={css.form}>
          <Field label="Store availability">
            <select
              value={config.identity.status}
              onChange={(e) => set("identity", "status", e.target.value)}
            >
              <option value="live">Open</option>
              <option value="closed">Temporarily closed</option>
            </select>
          </Field>
          <MediaInfrastructure />
          <Analytics />
        </div>
      )}
      {error && (
        <p role="alert" className={css.error}>
          {error}
        </p>
      )}
      {section&&tab!=="SEO"&&<div className={css.contextSave}><Button variant="secondary" disabled={busy||!sectionDirty} onClick={()=>setConfig(c=>({...c,[section]:saved[section]}))}>Cancel</Button><Button disabled={busy||!sectionDirty} onClick={saveSection}>{busy?'Saving…':`Save ${tab.toLowerCase()}`}</Button></div>}
      {discard && (
        <Modal
          title="Discard settings changes?"
          onClose={() => setDiscard(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDiscard(false)}>
                Keep editing
              </Button>
              <Button
                onClick={() => {
                  setConfig(saved);
                  setDiscard(false);
                }}
              >
                Discard changes
              </Button>
            </>
          }
        />
      )}
      {entry && (entry.kind === "rules" || entry.kind === "zones" || entry.kind === "pickups") && (
        <DeliveryEntryEditor
          entry={entry}
          currency={config.checkout.currency}
          onClose={() => setEntry(null)}
          onSave={async (value) => {
            await saveDeliveryEntry(entry.kind, entry.index, value);
            setEntry(null);
          }}
        />
      )}
      {entry?.kind === "bank" && (
        <EntryEditor
          entry={entry}
          onClose={() => setEntry(null)}
          onSave={async (value) => {
            await apiRequest("/v1-1/store-studio/settings", {
              method: "PATCH",
              body: JSON.stringify(value),
            });
            notify.success("Bank details saved");
            setEntry(null);
          }}
        />
      )}
      {deleteEntry && (
        <Modal
          tone="orange"
          title={`Remove ${deleteEntry.kind === "rules" || deleteEntry.kind === "zones" ? "delivery location" : "pickup location"}?`}
          description="This change takes effect immediately. Existing orders keep their original details."
          onClose={() => setDeleteEntry(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteEntry(null)}>Keep it</Button>
              <Button
                onClick={async () => {
                  try {
                    await removeDeliveryEntry(deleteEntry.kind, deleteEntry.index);
                    setDeleteEntry(null);
                  } catch (saveError) {
                    setError(saveError.message);
                    setDeleteEntry(null);
                  }
                }}
              >
                Remove
              </Button>
            </>
          }
        >
          <p className={css.deleteDeliveryCopy}>
            {deleteEntry.value.name || "This location"} will no longer be offered to new orders.
          </p>
        </Modal>
      )}
    </>
  );
}

function DeliveryEmpty({ icon, title, description, action }) {
  return (
    <div className={css.deliveryEmpty}>
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      <button type="button" onClick={action}>Add</button>
    </div>
  );
}

function DeliveryRow({ zone, currency, onEdit, onDelete, onToggle, legacyNotice }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const enabled = zone.enabled !== false;
  return (
    <article className={`${css.deliveryRow} ${legacyNotice ? css.deliveryLegacyRow : ""}`} aria-disabled={legacyNotice ? "true" : undefined}>
      <span className={css.deliveryRowIcon}><MapPin size={16} /></span>
      <div className={css.deliveryRowCopy}>
        <div>
          <strong>{locationName(zone)}</strong>
          {legacyNotice ? <span className={css.deliveryLegacyStatus}>Legacy</span> : !enabled && <span className={css.deliveryStatus}>Paused</span>}
        </div>
        <small>
          {formatMoney(zone.feeMinor, currency)} · {estimateText(zone)}
        </small>
      </div>
      {legacyNotice ? (
        <button type="button" className={css.deliveryLegacyRemove} onClick={onDelete}>
          <Trash2 size={13} /> Remove
        </button>
      ) : (
        <div className={css.deliveryRowActions}>
          <button type="button" onClick={onEdit}><Pencil size={13} /> Edit</button>
          <button
            type="button"
            aria-expanded={actionsOpen}
            aria-label={`More options for ${locationName(zone)}`}
            onClick={() => setActionsOpen((open) => !open)}
          >
            <MoreHorizontal size={16} />
          </button>
          {actionsOpen && (
            <div className={css.deliveryMoreMenu}>
              <button type="button" onClick={() => { setActionsOpen(false); onToggle(!enabled); }}>
                {enabled ? "Disable location" : "Enable location"}
              </button>
              <button type="button" className={css.deliveryDanger} onClick={() => { setActionsOpen(false); onDelete(); }}>
                Remove location
              </button>
            </div>
          )}
        </div>
      )}
      {legacyNotice && (
        <p className={css.deliveryLegacyNotice}>
          {legacyNotice} Add a new Nigeria location, then remove this record when ready.
        </p>
      )}
    </article>
  );
}

function PickupRow({ pickup, onEdit, onDelete, onToggle }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const enabled = pickup.enabled !== false;
  return (
    <article className={css.deliveryRow}>
      <span className={`${css.deliveryRowIcon} ${css.pickupRowIcon}`}><Store size={15} /></span>
      <div className={css.deliveryRowCopy}>
        <div>
          <strong>{pickup.name || "Pickup location"}</strong>
          {!enabled && <span className={css.deliveryStatus}>Paused</span>}
        </div>
        <small>{pickup.address || "Address not set"}{pickup.readiness ? ` · ${pickup.readiness}` : ""}</small>
      </div>
      <div className={css.deliveryRowActions}>
        <button type="button" onClick={onEdit}><Pencil size={13} /> Edit</button>
        <button
          type="button"
          aria-expanded={actionsOpen}
          aria-label={`More options for ${pickup.name || "pickup location"}`}
          onClick={() => setActionsOpen((open) => !open)}
        >
          <MoreHorizontal size={16} />
        </button>
        {actionsOpen && (
          <div className={css.deliveryMoreMenu}>
            <button type="button" onClick={() => { setActionsOpen(false); onToggle(!enabled); }}>
              {enabled ? "Disable location" : "Enable location"}
            </button>
            <button type="button" className={css.deliveryDanger} onClick={() => { setActionsOpen(false); onDelete(); }}>
              Remove location
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function matchLocation(items, id, fallbackName = "") {
  const normaliseName = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const normalized = normaliseName(fallbackName);
  return items.find((item) => item.id === id) || items.find((item) =>
    [item.name, ...(item.aliases || [])]
      .filter(Boolean)
      .some((name) => normaliseName(name) === normalized),
  );
}

function useDeliveryLocations(countryCode, regionId) {
  const [countries, setCountries] = useState([NIGERIA]);
  const [regions, setRegions] = useState(NIGERIA_REGIONS);
  const [areas, setAreas] = useState([]);
  useEffect(() => {
    let active = true;
    apiRequest(`${root}/locations/countries`)
      .then((data) => {
        if (!active || !Array.isArray(data.items)) return;
        // New locations are intentionally Nigeria-only. Existing foreign
        // rules are shown separately as read-only legacy records.
        const nigeria = data.items.find((item) => item.id === "NG" || item.code === "NG");
        setCountries([nigeria || NIGERIA]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    const country = countryCode || "NG";
    apiRequest(`${root}/locations/regions?country=${encodeURIComponent(country)}`)
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.items) && data.items.length) setRegions(data.items);
        else if (country === "NG") setRegions(NIGERIA_REGIONS);
        else setRegions([]);
      })
      .catch(() => active && setRegions(country === "NG" ? NIGERIA_REGIONS : []));
    return () => { active = false; };
  }, [countryCode]);
  useEffect(() => {
    let active = true;
    if (!regionId) {
      setAreas([]);
      return undefined;
    }
    apiRequest(`${root}/locations/areas?region=${encodeURIComponent(regionId)}`)
      .then((data) => active && setAreas(Array.isArray(data.items) ? data.items : []))
      .catch(() => active && setAreas([]));
    return () => { active = false; };
  }, [regionId]);
  return { countries, regions, areas };
}

function LocationPicker({ label, value, onChange, items, placeholder, disabled, error, searchable = true }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = items.find((item) => item.id === value || item.code === value);
  const normalized = query.trim().toLowerCase();
  const visible = items.filter((item) => !normalized || [item.name, item.code, ...(item.aliases || [])]
    .filter(Boolean).some((part) => String(part).toLowerCase().includes(normalized)));
  return (
    <Field label={label} error={error}>
      <div className={css.deliveryPicker}>
        <button
          type="button"
          className={css.deliveryPickerTrigger}
          disabled={disabled}
          aria-expanded={open}
          onClick={() => { setOpen((shown) => !shown); setQuery(""); }}
        >
          <span>{selected?.name || placeholder}</span><ChevronDown size={15} />
        </button>
        {open && (
          <div className={css.deliveryPickerMenu}>
            {searchable && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}`} />}
            <div>
              {visible.map((item) => (
                <button key={item.id || item.code} type="button" onClick={() => { onChange(item); setOpen(false); }}>
                  <strong>{item.name}</strong>{item.code && <small>{item.code}</small>}
                </button>
              ))}
              {!visible.length && <p>No verified options found. Choose a broader location instead.</p>}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

function AreaPicker({ value = [], onChange, items, disabled, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = items.filter((item) => value.includes(item.id));
  const normalized = query.trim().toLowerCase();
  const visible = items.filter((item) => !normalized || [item.name, ...(item.aliases || [])]
    .filter(Boolean).some((part) => String(part).toLowerCase().includes(normalized)));
  const toggle = (id) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  return (
    <Field label="Cities or areas" hint="Only choose verified areas you serve." error={error}>
      <div className={css.deliveryPicker}>
        <button type="button" className={css.deliveryPickerTrigger} disabled={disabled} aria-expanded={open} onClick={() => { setOpen((shown) => !shown); setQuery(""); }}>
          <span>{selected.length ? `${selected.length} area${selected.length === 1 ? "" : "s"} selected` : "Select cities or areas"}</span><ChevronDown size={15} />
        </button>
        {selected.length > 0 && <div className={css.selectedAreaChips}>{selected.map((item) => <button type="button" key={item.id} onClick={() => toggle(item.id)}>{item.name} ×</button>)}</div>}
        {open && (
          <div className={css.deliveryPickerMenu}>
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cities or areas" />
            <div>
              {visible.map((item) => (
                <button className={value.includes(item.id) ? css.deliveryPickerSelected : ""} key={item.id} type="button" onClick={() => toggle(item.id)}>
                  <strong>{item.name}</strong><small>{value.includes(item.id) ? "Selected" : "Add area"}</small>
                </button>
              ))}
              {!visible.length && <p>No verified areas are available yet. Choose Entire state instead.</p>}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

function DeliveryEntryEditor({ entry, currency, onClose, onSave }) {
  const isZone = entry.kind === "rules" || entry.kind === "zones";
  const [value, setValue] = useState(() => {
    const initial = entry.value || {};
    const initialRange = initial.estimateRange || ESTIMATE_PRESETS[3];
    return {
      ...initial,
      countryCode: zoneCountryCode(initial),
      coverage: isZone ? zoneCoverage(initial) : undefined,
      areaIds: initial.areaIds || [],
      estimateRange: initialRange,
      enabled: initial.enabled !== false,
    };
  });
  const [fee, setFee] = useState(money(entry.value?.feeMinor || 0));
  const [freeAbove, setFreeAbove] = useState(entry.value?.freeAboveMinor === null || entry.value?.freeAboveMinor === undefined ? "" : money(entry.value.freeAboveMinor));
  const [preset, setPreset] = useState(() => {
    const range = entry.value?.estimateRange;
    return ESTIMATE_PRESETS.find((item) => range && item.min === range.min && item.max === range.max && item.unit === range.unit && item.businessDays === range.businessDays)?.id || "custom";
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { countries, regions, areas } = useDeliveryLocations(value.countryCode, value.regionId);
  const set = (key, next) => setValue((current) => ({ ...current, [key]: next }));

  // Existing merchants may have legacy text locations. Resolve those to IDs as
  // soon as the shared location library is available, without discarding them.
  useEffect(() => {
    if (!isZone || !regions.length) return;
    const existingRegion = regions.find((region) => region.id === value.regionId);
    if (existingRegion) return;
    const region = matchLocation(regions, value.regionId, value.states?.[0]);
    if (region && region.id !== value.regionId) set("regionId", region.id);
  }, [isZone, regions, value.regionId, value.states]);
  useEffect(() => {
    if (!isZone || !value.cities?.length || value.areaIds?.length || !areas.length) return;
    const ids = value.cities.map((city) => matchLocation(areas, "", city)?.id).filter(Boolean);
    if (ids.length) set("areaIds", ids);
  }, [areas, isZone, value.areaIds, value.cities]);

  const selectedCountry = matchLocation(countries, value.countryCode) || NIGERIA;
  const selectedRegion = matchLocation(regions, value.regionId, value.states?.[0]);
  const selectPreset = (id) => {
    setPreset(id);
    const item = ESTIMATE_PRESETS.find((option) => option.id === id);
    if (item) set("estimateRange", { min: item.min, max: item.max, unit: item.unit, businessDays: item.businessDays });
  };
  const validateAmount = (raw) => /^\d{1,10}(\.\d{1,2})?$/.test(String(raw).trim());
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!value.countryCode) nextErrors.country = "Choose a country.";
    if (isZone && value.coverage !== "country" && !value.regionId) nextErrors.region = "Choose a state or region.";
    if (isZone && value.coverage === "areas" && !value.areaIds?.length) nextErrors.areas = "Choose at least one area or use Entire state.";
    if (isZone && !validateAmount(fee)) nextErrors.fee = "Enter a valid delivery fee.";
    if (isZone && freeAbove && !validateAmount(freeAbove)) nextErrors.freeAbove = "Enter a valid free-delivery threshold.";
    if (isZone && (!Number.isInteger(Number(value.estimateRange?.min)) || !Number.isInteger(Number(value.estimateRange?.max)) || Number(value.estimateRange.min) < 0 || Number(value.estimateRange.max) < Number(value.estimateRange.min))) nextErrors.estimate = "Enter a valid delivery time range.";
    if (!isZone && !String(value.name || "").trim()) nextErrors.name = "Name this pickup location.";
    if (!isZone && !value.regionId) nextErrors.region = "Choose a state or region.";
    if (!isZone && !String(value.address || "").trim()) nextErrors.address = "Enter the pickup address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const selectedAreas = areas.filter((item) => value.areaIds?.includes(item.id));
    const range = value.estimateRange;
    const presetText = ESTIMATE_PRESETS.find((item) => item.id === preset)?.text;
    const fallbackEstimate = range.min === range.max
      ? `${range.min} ${range.unit === "hour" ? "hours" : range.businessDays ? "business days" : "days"}`
      : `${range.min}–${range.max} ${range.unit === "hour" ? "hours" : range.businessDays ? "business days" : "days"}`;
    const next = isZone
      ? {
          ...value,
          id: value.id || createId(),
          countryCode: value.countryCode,
          countries: [value.countryCode],
          regionId: value.coverage === "country" ? "" : value.regionId,
          states: value.coverage === "country" || !selectedRegion ? [] : [selectedRegion.name],
          coverage: value.coverage,
          areaIds: value.coverage === "areas" ? value.areaIds : [],
          cities: value.coverage === "areas" ? selectedAreas.map((item) => item.name) : [],
          postcodes: [],
          name: value.coverage === "country"
            ? selectedCountry.name
            : value.coverage === "areas" && selectedAreas.length
              ? selectedAreas.map((item) => item.name).join(", ")
              : selectedRegion?.name || value.name || "Delivery location",
          feeMinor: minor(fee),
          freeAboveMinor: freeAbove ? minor(freeAbove) : null,
          estimate: presetText || fallbackEstimate,
          estimateRange: { min: Number(range.min), max: Number(range.max), unit: range.unit === "hour" ? "hour" : "day", businessDays: Boolean(range.businessDays) },
          priority: 0,
          excluded: false,
        }
      : {
          ...value,
          id: value.id || createId(),
          countryCode: value.countryCode,
          regionId: value.regionId,
          state: selectedRegion?.name || "",
          areaId: value.areaId || "",
          enabled: value.enabled !== false,
        };
    setBusy(true);
    try {
      await onSave(next);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      wide
      tone={isZone ? "purple" : "teal"}
      className={css.deliveryEditor}
      headerIcon={isZone ? <Truck /> : <Store />}
      title={isZone ? (entry.index < 0 ? "Add delivery location" : "Edit delivery location") : (entry.index < 0 ? "Add pickup location" : "Edit pickup location")}
      description={isZone ? "Choose where you deliver, the fee, and the delivery time." : "Customers can select an active pickup location at checkout."}
      onClose={() => !busy && onClose()}
      footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" form="delivery-entry" disabled={busy}>{busy ? "Saving…" : "Save location"}</Button></>}
    >
      <form id="delivery-entry" className={`${css.form} ${css.deliveryForm}`} onSubmit={submit}>
        {!isZone && <Field label="Location name" error={errors.name}><input value={value.name || ""} onChange={(event) => set("name", event.target.value)} placeholder="e.g. Lekki pickup desk" /></Field>}
        <LocationPicker
          label="Country"
          value={value.countryCode}
          items={countries}
          error={errors.country}
          placeholder="Choose a country"
          onChange={(country) => setValue((current) => ({ ...current, countryCode: country.code || country.id, regionId: "", areaIds: [] }))}
        />
        <LocationPicker
          label="State / region"
          value={value.regionId}
          items={regions}
          disabled={!value.countryCode}
          error={errors.region}
          placeholder="Choose a state or region"
          onChange={(region) => setValue((current) => ({ ...current, regionId: region.id, areaIds: [], areaId: "" }))}
        />
        {isZone ? <>
          <section className={css.deliveryFormBlock}>
            <div><b>Where do you deliver?</b><small>Choose the broadest area that matches this fee.</small></div>
            <div className={css.coverageCards}>
              {[ ["state", "Entire state", "Serve anywhere in this state"], ["areas", "Specific cities or areas", "Set a different rate for selected areas"], ["country", "Countrywide fallback", "Use this when no state rule matches"] ].map(([id, title, description]) => (
                <button key={id} type="button" className={value.coverage === id ? css.coverageCardActive : ""} onClick={() => set("coverage", id)}>
                  <strong>{title}</strong><small>{description}</small><Check size={15} />
                </button>
              ))}
            </div>
          </section>
          {value.coverage === "areas" && <AreaPicker value={value.areaIds || []} onChange={(areaIds) => set("areaIds", areaIds)} items={areas} disabled={!value.regionId} error={errors.areas} />}
          <Field label={`Delivery fee (${currency || "NGN"})`} error={errors.fee} hint="Use 0 for free delivery."><input inputMode="decimal" value={fee} onChange={(event) => setFee(event.target.value)} placeholder="0.00" /></Field>
          <Field label="Free delivery threshold (optional)" error={errors.freeAbove} hint="Orders at or above this total get free delivery."><input inputMode="decimal" value={freeAbove} onChange={(event) => setFreeAbove(event.target.value)} placeholder="e.g. 50000" /></Field>
          <section className={css.deliveryFormBlock}>
            <div><b>Estimated delivery time</b><small>Show customers a clear, realistic range.</small></div>
            <div className={css.estimateChoices}>
              {ESTIMATE_PRESETS.map((item) => <button key={item.id} type="button" className={preset === item.id ? css.estimateChoiceActive : ""} onClick={() => selectPreset(item.id)}>{item.label}</button>)}
              <button type="button" className={preset === "custom" ? css.estimateChoiceActive : ""} onClick={() => setPreset("custom")}>Custom range</button>
            </div>
            {preset === "custom" && <div className={css.estimateCustom}><Field label="From" error={errors.estimate}><NumericInput type="number" min="0" value={value.estimateRange?.min ?? ""} onChange={(event) => set("estimateRange", { ...value.estimateRange, min: Number(event.target.value) })} /></Field><Field label="To"><NumericInput type="number" min="0" value={value.estimateRange?.max ?? ""} onChange={(event) => set("estimateRange", { ...value.estimateRange, max: Number(event.target.value) })} /></Field><Field label="Unit"><select value={value.estimateRange?.unit || "day"} onChange={(event) => set("estimateRange", { ...value.estimateRange, unit: event.target.value })}><option value="day">Days</option><option value="hour">Hours</option></select></Field><label className={css.businessDaysCheck}><input type="checkbox" checked={Boolean(value.estimateRange?.businessDays)} onChange={(event) => set("estimateRange", { ...value.estimateRange, businessDays: event.target.checked })} /> Business days</label></div>}
          </section>
        </> : <>
          <LocationPicker label="City / area (optional)" value={value.areaId || ""} items={areas} disabled={!value.regionId} placeholder="Choose a city or area" onChange={(area) => set("areaId", area.id)} />
          <Field label="Full pickup address" error={errors.address}><textarea rows={3} value={value.address || ""} onChange={(event) => set("address", event.target.value)} placeholder="Enter the full address customers should visit" /></Field>
          <Field label="Collection hours (optional)"><input value={value.hours || ""} onChange={(event) => set("hours", event.target.value)} placeholder="e.g. Mon–Sat, 9am–5pm" /></Field>
          <Field label="Estimated readiness (optional)"><input value={value.readiness || ""} onChange={(event) => set("readiness", event.target.value)} placeholder="e.g. Ready within 2 hours" /></Field>
          <Field label="Contact number (optional)"><input inputMode="tel" value={value.phone || ""} onChange={(event) => set("phone", event.target.value)} placeholder="For collection questions" /></Field>
          <Field label="Pickup instructions (optional)"><textarea rows={3} value={value.instructions || ""} onChange={(event) => set("instructions", event.target.value)} placeholder="Anything customers should know before collecting" /></Field>
        </>}
        <label className={css.entryEnabled}><input type="checkbox" checked={value.enabled !== false} onChange={(event) => set("enabled", event.target.checked)} /> <span><b>Available to customers</b><small>Turn this off without deleting the location.</small></span></label>
      </form>
    </Modal>
  );
}

export function ResourceManager({ kind = "collections" }) {
  const [items, setItems] = useState([]),
    [page, setPage] = useState(1),
    [hasMore, setMore] = useState(false),
    [edit, setEdit] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [reload, setReload] = useState(0),
    [archive, setArchive] = useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(() => {
    setLoading(true);setError("");
    const c = new AbortController();
    const t = setTimeout(
      () =>
        apiRequest(
          `${root}/${kind}?page=${page}&search=${encodeURIComponent(search)}`,
          { signal: c.signal },
        )
          .then((d) => {
            setItems(d.items);
            setMore(d.hasMore);
          })
          .catch((e) => {
            if (!c.signal.aborted) setError(e.message);
          }).finally(()=>{if(!c.signal.aborted)setLoading(false);}),
      200,
    );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [kind, page, search, reload]);
  const fresh =
    kind === "collections"
      ? {
          name: "",
          slug: "",
          description: "",
          image: "",
          visible: true,
          sortOrder: 0,
          mode: "manual",
          priceUnderMinor: 0,
          productIds: [],
        }
      : {
          code: "",
          type: "percent",
          value: 1000,
          minimumMinor: 0,
          usageLimit: 0,
          perCustomerLimit: 1,
          enabled: true,
          automatic: false,
          startsAt: "",
          endsAt: "",
          productIds: [],
        };
  return (
    <>
      {loading&&<SmallLoading label="Loading entries…"/>}
      <div className={css.panelHeading}>
        <div><h3>{kind === "collections" ? "Collections" : "Discounts"} <SettingsHelp topic={kind === "collections" ? "Collections" : "Discount codes"}/></h3>{kind==="discounts"&&<p>Create codes and automatic offers. One discount applies per order; a code replaces automatic offers.</p>}</div>
        <Button onClick={() => setEdit(fresh)}>
          <Plus size={14} /> Add
        </Button>
      </div>
      <label className={css.search}>
        <input
          aria-label={`Search ${kind}`}
          placeholder={`Search ${kind}`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <div className={css.categoryList}>
        {items.map((item) => (
          <article key={item._id}>
            <div>
              <strong>{item.name || item.code}</strong>
              <small>
                {kind === "collections"
                  ? item.mode
                  : `${item.uses || 0} uses · ${item.enabled ? "Enabled" : "Disabled"}`}
              </small>
            </div>
            <Button variant="secondary" onClick={() => setEdit(item)}>
              Edit
            </Button>
            <button
              aria-label={`Archive ${item.name || item.code}`}
              onClick={() => setArchive(item)}
            >
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>
      {!items.length && <p>No {kind} yet.</p>}
      {error && (
        <p role="alert" className={css.error}>
          {error}
        </p>
      )}
      <div className={css.pagination}>
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="secondary"
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
      {edit && (
        <ResourceEditor
          kind={kind}
          value={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            setReload((v) => v + 1);
          }}
        />
      )}
      {archive && (
        <Modal
          title="Archive this entry?"
          description="It will no longer be available to customers."
          onClose={() => setArchive(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setArchive(null)}>
                Cancel
              </Button>
              <Button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await apiRequest(`${root}/${kind}/${archive._id}`, {
                      method: "DELETE",
                    });
                    setArchive(null);
                    setReload((v) => v + 1);
                  } catch (e) {
                    setError(e.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Archive
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
function ResourceEditor(props){return props.kind==="collections"?<CollectionEditor {...props}/>:<DiscountEditor {...props}/>;}
function DiscountEditor({ kind, value, onClose, onSaved }) {
  const [categorySearch, setCategorySearch] = useState(""),
    [categoryChoices, setCategoryChoices] = useState([]);
  useEffect(() => {
    if (kind !== "discounts") return;
    const c = new AbortController();
    const t = setTimeout(
      () =>
        apiRequest(
          `/v1-1/store-studio/categories?search=${encodeURIComponent(categorySearch)}`,
          { signal: c.signal },
        )
          .then((d) => setCategoryChoices(d.categories))
          .catch((e) => {
            if (!c.signal.aborted) setError(e.message);
          }),
      250,
    );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [kind, categorySearch]);
  const [form, setForm] = useState(value),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const field = (k, label, type = "text") => (
    <Field key={k} label={label}>
      <input
        type={type}
        value={form[k] ?? ""}
        onChange={(e) =>
          set(k, e.target.value)
        }
      />
    </Field>
  );
  return (
    <Modal
      title={value._id ? "Edit discount" : "Add discount"}
      onClose={() => !busy && onClose()}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button form="resource-editor" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form
        id="resource-editor"
        className={css.form}
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await apiRequest(
              `${root}/${kind}${form._id ? "/" + form._id : ""}`,
              {
                method: form._id ? "PATCH" : "POST",
                body: JSON.stringify(form),
              },
            );
            notify.success("Saved");
            onSaved();
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >

          <>
            {field("code", "Code")}
            <Field label="Discount type">
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
                <option value="shipping">Free delivery</option>
              </select>
            </Field>
            {form.type !== "shipping" && (
              <Field
                label={
                  form.type === "percent" ? "Percentage off" : "Amount off"
                }
              >
                <NumericInput
                  type="number"
                  step="0.01"
                  value={money(form.value)}
                  onChange={(e) => set("value", minor(e.target.value))}
                />
              </Field>
            )}
            <Field label="Minimum order">
              <NumericInput
                type="number"
                step="0.01"
                value={money(form.minimumMinor)}
                onChange={(e) => set("minimumMinor", minor(e.target.value))}
              />
            </Field>
            {field("usageLimit", "Total uses (0 = unlimited)", "number")}
            {field(
              "perCustomerLimit",
              "Uses per customer (0 = unlimited)",
              "number",
            )}
            {["startsAt", "endsAt"].map((k) => (
              <Field label={k === "startsAt" ? "Starts at" : "Ends at"} key={k}>
                <input
                  type="datetime-local"
                  value={localDate(form[k])}
                  onChange={(e) =>
                    set(
                      k,
                      e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    )
                  }
                />
              </Field>
            ))}
            {["enabled", "automatic"].map((k) => (
              <label key={k} className={css.check}>
                <input
                  type="checkbox"
                  checked={form[k]}
                  onChange={(e) => set(k, e.target.checked)}
                />
                {k === "enabled"
                  ? "Enabled"
                  : "Apply automatically (best eligible offer)"}
              </label>
            ))}
          </>
        {kind === "discounts" && (
          <fieldset>
            <legend>Eligible categories</legend>
            <p>
              Leave products and categories empty for all items. Otherwise, an
              item must match either selection.
            </p>
            <input
              aria-label="Search eligible categories"
              placeholder="Search categories"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
            {[
              ...new Set([
                ...(form.categoryNames || []),
                ...categoryChoices.map((c) => c.name),
              ]),
            ].map((name) => (
              <label className={css.check} key={name}>
                <input
                  type="checkbox"
                  checked={(form.categoryNames || []).includes(name)}
                  onChange={(e) =>
                    set(
                      "categoryNames",
                      e.target.checked
                        ? [...(form.categoryNames || []), name]
                        : (form.categoryNames || []).filter((n) => n !== name),
                    )
                  }
                />
                {name}
              </label>
            ))}
          </fieldset>
        )}
        <fieldset><legend>Eligible products (optional)</legend><ProductSelection value={form.productIds||[]} onChange={v=>set('productIds',v)}/></fieldset>
        {error && (
          <p role="alert" className={css.error}>
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
function Customers() {
  const [rows, setRows] = useState([]),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [mode, setMode] = useState("customers"),
    [customer, setCustomer] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    apiRequest(`${root}/${mode}?page=${page}`)
      .then((d) => {
        setRows(d.customers || d.items);
        setMore(d.hasMore);
      })
      .catch((e) => setError(e.message));
  }, [page, mode]);
  const download = () => {
    const quote = (v) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""') +
      '"';
    const csv = [
      "Name,Email,Phone,Orders,Marketing consent",
      ...rows.map((r) =>
        [
          r.name,
          r.email,
          mode === "customers" ? r._id : "",
          r.orders || "",
          mode === "customers" ? !!r.consent : !r.unsubscribedAt,
        ]
          .map(quote)
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `store-${mode}-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <div className={css.panelHeading}>
        <select
          aria-label="Customer list"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            setPage(1);
          }}
        >
          <option value="customers">Order customers</option>
          <option value="leads">Newsletter subscribers</option>
        </select>
        <Button variant="secondary" onClick={download} disabled={!rows.length}>
          <Download size={15} /> Export this page
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className={css.categoryList}>
        {rows.map((r) => (
          <article key={r._id}>
            <div>
              <strong>{r.name || r.email}</strong>
              <small>
                {r.email} {r.orders ? `· ${r.orders} orders` : ""}
              </small>
              <small>
                {(mode === "customers" ? r.consent : !r.unsubscribedAt)
                  ? "Marketing consent recorded"
                  : "No marketing consent"}
              </small>
            </div>
            {mode === "customers" && (
              <Button variant="secondary" onClick={() => setCustomer(r)}>
                History
              </Button>
            )}
            {mode === "customers" && (
              <a
                href={`https://wa.me/${String(r._id).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
          </article>
        ))}
      </div>
      {customer && (
        <CustomerHistory
          customer={customer}
          onClose={() => setCustomer(null)}
        />
      )}
      <div className={css.pagination}>
        <Button
          disabled={page === 1}
          variant="secondary"
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          variant="secondary"
          disabled={!more}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </>
  );
}
function ReviewManager() {
  const [rows, setRows] = useState([]),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [error, setError] = useState("");
  const load = () =>
    apiRequest(`${root}/reviews?page=${page}`)
      .then((d) => {
        setRows(d.items);
        setMore(d.hasMore);
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, [page]);
  const moderate = async (id, status) => {
    try {
      await apiRequest(`${root}/reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <section>
      <h3>Customer reviews <SettingsHelp topic="Customer reviews"/></h3>
      {error && <p role="alert">{error}</p>}
      {rows.map((r) => (
        <article key={r._id} className={css.note}>
          <strong>
            {r.name} · {r.rating}/5 · {r.status}
          </strong>
          <p>{r.text}</p>
          <Button
            variant="secondary"
            onClick={() => moderate(r._id, "approved")}
          >
            Approve
          </Button>{" "}
          <Button
            variant="secondary"
            onClick={() => moderate(r._id, "rejected")}
          >
            Reject
          </Button>
        </article>
      ))}
      {!rows.length && <p>No reviews to moderate.</p>}
      <Button
        disabled={page === 1}
        variant="secondary"
        onClick={() => setPage((p) => p - 1)}
      >
        Previous
      </Button>{" "}
      <Button
        disabled={!more}
        variant="secondary"
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </Button>
    </section>
  );
}
function Analytics() {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  const load = () =>
    apiRequest(`${root}/analytics`)
      .then(setData)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);
  if (!data) return <p>{error || "Loading activity…"}</p>;
  const totals = data.days.reduce(
    (a, d) =>
      Object.fromEntries(
        ["views", "productViews", "addToCart", "checkout"].map((k) => [
          k,
          (a[k] || 0) + (d[k] || 0),
        ]),
      ),
    {},
  );
  return (
    <section>
      <h3>Last 30 days <SettingsHelp topic="Last 30 days"/></h3>
      <div className={css.note}>
        {Object.entries(totals).map(([k, v]) => (
          <p key={k}>
            {k.replace(/([A-Z])/g, " $1")}: <b>{v}</b>
          </p>
        ))}
        {data.sales.map((s) => (
          <p key={s._id}>
            Confirmed sales: {s._id} {money(s.totalMinor)} · {s.orders} orders
          </p>
        ))}
      </div>
      <p>
        Queued emails: {data.notifications.queued} · Failed:{" "}
        {data.notifications.failed}
      </p>
      {data.notifications.failed > 0 && (
        <Button
          variant="secondary"
          onClick={async () => {
            await apiRequest(`${root}/notifications/retry`, { method: "POST" });
            load();
          }}
        >
          Retry failed notifications
        </Button>
      )}
    </section>
  );
}
function CustomerHistory({ customer, onClose }) {
  const [page, setPage] = useState(1),
    [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    apiRequest(
      `${root}/customers/orders?phone=${encodeURIComponent(customer._id)}&page=${page}`,
      { signal: c.signal },
    )
      .then(setData)
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [customer._id, page]);
  return (
    <Modal title={`${customer.name || "Customer"} · Orders`} onClose={onClose}>
      {error && <p role="alert">{error}</p>}
      {data?.orders.map((o) => (
        <article
          key={o._id}
          style={{ borderBottom: "1px solid #ddd", padding: "14px 0" }}
        >
          <strong>{o.orderNumber}</strong>
          <p>
            {new Date(o.createdAt).toLocaleString()} · {o.paymentStatus}
          </p>
          <p>{o.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}</p>
          <b>
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: o.totals?.currency || "NGN",
            }).format(o.totals ? o.totals.totalMinor / 100 : o.subtotal || 0)}
          </b>
        </article>
      ))}
      <div className={css.pagination}>
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={!data?.hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </Modal>
  );
}

function MediaInfrastructure() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      setData(await apiRequest(`${root}/media/jobs`));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <section>
      <h3>Image processing <SettingsHelp topic="Image processing"/></h3>
      <p>
        Images are compressed in the background. Refresh to check progress or
        recover a completed image. No automatic polling runs on this page.
      </p>
      <Button variant="secondary" disabled={busy} onClick={load}>
        {busy ? "Checking…" : "Refresh media status"}
      </Button>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <p>
            {data.counts.map((c) => `${c.count} ${c._id}`).join(" · ") ||
              "No uploads yet"}
          </p>
          <ul>
            {data.jobs.map((job) => (
              <li key={job._id}>
                <strong>{job.status}</strong> ·{" "}
                {new Date(job.createdAt).toLocaleString()} · {job.attempts || 0}{" "}
                attempts{job.lastError && <p>{job.lastError}</p>}
                {job.status === "ready" && (
                  <>
                    <a href={job.url} target="_blank" rel="noreferrer">
                      View image
                    </a>{" "}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(job.url)
                          .then(() => notify.success("Image URL copied"))
                          .catch(() => notify.error("Could not copy image URL"))
                      }
                    >
                      Copy image URL
                    </Button>
                  </>
                )}
                {job.status === "failed" &&
                  job.retryable !== false &&
                  job.attempts < 8 && (
                    <Button
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await apiRequest(`${root}/media/${job._id}/retry`, {
                            method: "POST",
                          });
                          await load();
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Retry processing
                    </Button>
                  )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
