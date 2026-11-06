import {currencyDigits} from "./currencies.mjs";
import {useDisplayCurrency} from "./DisplayCurrency";
import NumericInput from "../components/NumericInput";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {normalizeLeadPhone} from "../lib/leadPhone";
import {notify} from "../components/Notifications";
import { deliveryLocations, countryFlag } from "./deliveryLocations";
import {trackingData} from "../tracking/browser";
import {uploadPaymentProof} from "@/services/uploadService";
import {cartQuantityLimit} from "@/components/store/context/cartLimits.mjs";
import {storeThemeStyle,productHref} from "./StoreTheme";
import {storeImageSrcSet} from "./storeMedia";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, X, Minus, Plus, ShoppingCart, Copy, Check, CheckCircle2, MapPin, Store, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/components/store/context/CartContext";
import { apiRequest } from "../lib/api";
import { Modal, Button, Field } from "../components/UI";
import css from "./CommercePublic.module.css";
const brandStyle = (store) => {
  const c = store.accent || "#194d46",
    rgb = [1, 3, 5]
      .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return {
    "--store-accent": c,
    "--store-on-accent":
      rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
        ? "#111"
        : "#fff",
  };
};
export const formatMoney = (minor, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(
    Number(minor || 0) / 100,
  );

const activeRows = (rows) => (Array.isArray(rows) ? rows : []).filter((row) => row?.enabled !== false);
const locationId = (item = {}) => String(item?.id || item?.code || "");
const locationLabel = (item = {}) => String(item?.name || item?.label || item?.code || "");
const sameLocation = (one, two) => String(one || "").trim().toLowerCase() === String(two || "").trim().toLowerCase();
const estimateLabel = (estimate, fallback = "") => {
  if (!estimate) return fallback || "";
  if (typeof estimate === "string") return estimate;
  const min = Number(estimate.min), max = Number(estimate.max);
  if (!Number.isFinite(min) || min < 0) return fallback || "";
  const range = Number.isFinite(max) && max >= min && max !== min ? `${min}–${max}` : String(min);
  const unit = estimate.unit === "calendar_days" ? "days" : "business days";
  return `${range} ${unit}`;
};
const zoneCountryValue = (zone = {}) => String(zone.countryCode || zone.countries?.[0] || "").trim();
const zoneRegion = (zone = {}) => String(zone.regionName || zone.stateName || zone.states?.[0] || "");
const zoneAreas = (zone = {}) => Array.isArray(zone.areaNames) ? zone.areaNames : Array.isArray(zone.cities) ? zone.cities : [];
const countryMatchesZone = (country, zone) => {
  const configured = zone.countries?.length ? zone.countries : [zone.countryCode];
  return configured.filter(Boolean).some(code => [country?.code, country?.id, country?.name].some(value => sameLocation(value, code)));

};
const countrywideZone = (zone = {}) => {
  const coverage = String(zone.coverage || "").trim().toLowerCase();
  if (coverage) return coverage === "country";
  // Legacy zones did not carry coverage. With no state/area constraint, they
  // have always meant countrywide delivery.
  return !zone.regionId && !zone.states?.length && !zone.areaIds?.length && !zone.cities?.length;
};

function LocationSelect({label,items=[],value='',onChange,placeholder,disabled=false,required=false,style,loading=false}) {
 const [open,setOpen]=useState(false),[search,setSearch]=useState(''),[query,setQuery]=useState('');
 useEffect(()=>{const timer=setTimeout(()=>setQuery(search.trim().toLowerCase()),150);return()=>clearTimeout(timer);},[search]);
 const selected=items.find(item=>locationId(item)===value);
 const visible=items.filter(item=>`${locationLabel(item)} ${item.aliases?.join(' ')||''}`.toLowerCase().includes(query));
 return <><Field label={label}><button type="button" className={css.locationTrigger} aria-label={`Choose ${label.toLowerCase()}`} disabled={disabled} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setSearch('');setOpen(true);}}>{selected?`${label==='Country'?countryFlag(selected.code)+' ':''}${locationLabel(selected)}`:placeholder||`Choose ${label}`}<span>⌄</span></button>{required&&<input tabIndex={-1} aria-hidden="true" className={css.requiredLocation} value={selected?value:''} required onChange={()=>{}} onInvalid={e=>{e.preventDefault();setOpen(true);}}/>}</Field>
 {open&&<Modal className={`${css.publicModal} ${css.locationSheet}`} style={style} title={`Choose ${label.toLowerCase()}`} onClose={()=>setOpen(false)}><input autoFocus type="search" aria-label={`Search ${label.toLowerCase()}`} placeholder={`Search ${label.toLowerCase()}`} value={search} onChange={e=>setSearch(e.target.value)}/><div className={css.locationResults} role="listbox" aria-label={label}>{loading?<p role="status">Loading locations…</p>:visible.map(item=><button type="button" role="option" aria-selected={locationId(item)===value} key={locationId(item)} onClick={()=>{onChange(item);setOpen(false);}}><span>{label==='Country'?countryFlag(item.code)+' ':''}{locationLabel(item)}</span>{locationId(item)===value&&<Check size={16}/>}</button>)}{!loading&&!visible.length&&<p>No matching locations.</p>}</div>{value&&<button type="button" className={css.clearLocation} onClick={()=>{onChange(null);setOpen(false);}}>Clear selection</button>}</Modal>}</>;
}
export function ProductDetails({
  quick=false,
  design,
  product,
  store,
  related = [],
  onProduct,
  onClose,
  onAdded,
}) {
  const {formatMinor:formatMoney}=useDisplayCurrency();
  if(store.businessType === "digital")product={...product,productType:"digital",trackStock:false};
  const { addToCart, getItemQty } = useCart(),
    [image, setImage] = useState(0),
    [quantity, setQuantity] = useState(1),
    [variants, setVariants] = useState({}),
    [error, setError] = useState("");
  const [attempted,setAttempted]=useState(false),[optionToast,setOptionToast]=useState(0);
  const optionsRef=useRef(null);
  useEffect(()=>{if(!optionToast)return;const timer=setTimeout(()=>setOptionToast(0),4000);return()=>clearTimeout(timer);},[optionToast]);
  const groups = product.variantGroups || [],
    row = product.inventory?.find((r) =>
      groups.every((g) => r.values?.[g.name] === variants[g.name]),
    ),
    stock = groups.length ? row?.stock || 0 : product.stock,
    ready = groups.every((g) => variants[g.name]);
  return (
    <article className={`${css.productPage} ${["streetline","streetline-services"].includes(design?.theme)?css.streetline:""} ${quick?css.quickProduct:""}`} style={storeThemeStyle(design)}>
      {optionToast>0&&<div className={css.optionToast} role="alert"><AlertCircle size={18}/><strong>Select an option, please.</strong><button type="button" onClick={()=>setOptionToast(0)} aria-label="Dismiss option reminder"><X size={15}/></button></div>}
      {!quick&&<nav className={css.productBreadcrumb} aria-label="Product breadcrumb"><a href={`/v1-1/s/${encodeURIComponent(store.slug)}`}>{['atelier-services','streetline-services'].includes(design?.theme)?'Services':'Shop'}</a><span>/</span><span>{product.name}</span></nav>}
      <div className={css.product}>
        <div>
          {product.images?.[image] && (
            <img
              className={css.mainImage}
              src={product.images[image]}
              srcSet={storeImageSrcSet(product.images[image])}
              sizes="(max-width:700px) 100vw, 50vw"
              alt={product.name}
            />
          )}
          {(!quick||product.images?.length>1)&&<div className={css.thumbs}>
            {product.images?.map((url, i) => (
              <button
                key={url}
                aria-label={`View image ${i + 1}`}
                aria-pressed={image === i}
                onClick={() => setImage(i)}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>}
        </div>
        <div>
          <h1>{product.name}</h1>
          <strong className={css.productPrice}>
            {formatMoney(Math.round(product.price * 100), store.currency)}
          </strong>
          {product.comparePrice > product.price && (
            <del>
              {formatMoney(
                Math.round(product.comparePrice * 100),
                store.currency,
              )}
            </del>
          )}

          <div ref={optionsRef}>{groups.map((g) => quick?<fieldset className={css.optionGroup} key={g.name} aria-invalid={attempted&&!variants[g.name]||undefined}><legend>{g.name}</legend><div>{g.options.map(v=><button type="button" key={v} aria-pressed={variants[g.name]===v} onClick={()=>setVariants(previous=>({...previous,[g.name]:v}))}>{v}</button>)}</div>{attempted&&!variants[g.name]&&<small className={css.optionError}>Please select {g.name}.</small>}</fieldset>:(
            <Field key={g.name} label={g.name}>
              <select
                aria-invalid={attempted&&!variants[g.name]||undefined}
                value={variants[g.name] || ""}
                onChange={(e) =>
                  setVariants((v) => ({ ...v, [g.name]: e.target.value }))
                }
              >
                <option value="">Choose {g.name}</option>
                {g.options.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              {attempted&&!variants[g.name]&&<small className={css.optionError}>Please select {g.name}.</small>}
            </Field>
          ))}</div>
          {product.productType === "physical" && (
            <>
              <Field label="Quantity">
                <NumericInput
                  type="number"
                  min={1}
                  max={
                    product.trackStock === false ? 100 : Math.min(100, stock)
                  }
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </Field>
              <p>
                {product.trackStock === false
                  ? "Available to order"
                  : ready
                    ? `${stock} available`
                    : "Choose your options to see availability."}
              </p>
            </>
          )}
          {error && <p role="alert">{error}</p>}
          <Button
            aria-disabled={!ready||undefined}
            className={!ready?css.needsOptions:undefined}
            disabled={
              ready && (product.productType === "physical" &&
                product.trackStock !== false &&
                stock < 1)
            }
            onClick={() => {
              if(!ready){setAttempted(true);setOptionToast(Date.now());optionsRef.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});return;}
              setError('');
              if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 100 ||
                (product.productType === "physical" &&
                  product.trackStock !== false &&
                  quantity + getItemQty(product._id, variants) > stock)
              ) {
                setError("Choose an available quantity, including what is already in your cart.");
                return;
              }
              addToCart(
                {
                  ...product,
                  selectedVariants: variants,
                  store: { slug: store.slug },
                },
                product.productType === "digital" ? 1 : quantity,
              );
              onAdded();
            }}
          >
            <ShoppingCart size={17} /> {['atelier-services','streetline-services'].includes(design?.theme)?'Add service to cart':'Add to cart'}
          </Button>
          {!quick&&product.description&&<details className={css.productDescription} open><summary>Product details</summary><p className={css.description}>{product.description}</p></details>}
        </div>
      </div>
      {related.length > 0 && (
        <section>
          <h3>You may also like</h3>
          <div className={css.related}>
            {related.map((p) => (
              <button key={p._id} onClick={() => onProduct(p)}>
                {p.images?.[0] && (
                  <img src={p.images[0]} alt="" loading="lazy" />
                )}
                <span>{p.name}</span>
                <strong>
                  {formatMoney(Math.round(p.price * 100), store.currency)}
                </strong>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
export function CommerceCheckout({ store, config: initialConfig, fulfillment: initialFulfillment = initialConfig?.fulfillment || {}, design, onClose, onEvent, onAccount }) {
  const display=useDisplayCurrency(),formatBaseMoney=formatMoney;
  const displayMoney=display.formatMinor;
  const [live, setLive] = useState({ config: initialConfig, fulfillment: initialFulfillment });
  const config = live.config, fulfillment = live.fulfillment;
  useEffect(()=>{display.setConfiguration?.(config.checkout);},[config.checkout,display.setConfiguration]);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsRetry, setSettingsRetry] = useState(0);
  const { cart, removeFromCart, updateQty, refreshProducts } = useCart();
  const items = cart.filter((p) => p.storeSlug === store.slug).map(p => store.businessType === "digital" || p.productType === "digital" ? {...p,productType:"digital",quantity:1} : p).filter((p,index,all)=>p.productType!=="digital"||all.findIndex(other=>other._id===p._id)===index);
  const itemsKey = items.map((item) => `${item._id}:${item.quantity}:${JSON.stringify(item.selectedVariants || {})}`).join("|");
  const physical = store.businessType !== "digital" && items.some((p) => p.productType === "physical");
  const methods = config.checkout.paymentMethods.filter(m => ["bank","cod","whatsapp"].includes(m) && (m !== "cod" || physical));
  const zones = activeRows(config?.delivery?.zones).filter((zone) => !zone.excluded);
  // New public responses expose a deliberately small fulfillment summary.
  // Keep the saved config fallback so storefronts cached before this release
  // continue to expose their existing delivery options. Pickup stays disabled.
  const pickups = activeRows(
    Array.isArray(fulfillment?.pickupLocations)
      ? fulfillment.pickupLocations
      : config?.delivery?.pickups,
  );
  const legacyDeliveryAvailable = config?.delivery?.enabled === true
    ? zones.length > 0
    : config?.delivery?.enabled !== false && zones.length > 0;
  const deliveryAvailable = typeof fulfillment?.deliveryAvailable === "boolean"
    ? fulfillment.deliveryAvailable
    : legacyDeliveryAvailable;
  const pickupAvailable = false;
  const availableFulfillment = [
    ...(deliveryAvailable ? ["delivery"] : []),
    ...(pickupAvailable ? ["pickup"] : []),
  ];
  const [form, setForm] = useState(() => {
      let saved = {};
      try { saved = JSON.parse(sessionStorage.getItem(`store-checkout-handoff:${store.slug}`) || "{}"); } catch {}
      const savedAddress = saved.address || {};
      const defaultCountry = savedAddress.countryCode || savedAddress.country || zoneCountryValue(zones[0]);
      const savedMethod = saved.fulfillmentMethod || (saved.pickupId ? "pickup" : deliveryAvailable ? "delivery" : pickupAvailable ? "pickup" : "");
      return {
      ...saved,
      customerName: saved.customerName || "",
      customerPhone: saved.customerPhone || "",
      customerEmail: saved.customerEmail || "",
      address: {
        line: savedAddress.line || savedAddress.streetAddress || "",
        streetAddress: savedAddress.streetAddress || savedAddress.line || "",
        directions: savedAddress.directions || "",
        countryCode: defaultCountry || "",
        country: savedAddress.country || defaultCountry || "",
        regionId: savedAddress.regionId || "",
        state: savedAddress.state || "",
        areaId: savedAddress.areaId || "",
        city: savedAddress.city || "",
        postcode: savedAddress.postcode || "",
      },
      pickupId: "",
      fulfillmentMethod: deliveryAvailable ? "delivery" : "",
      coupon: saved.coupon || "",
      paymentMethod: methods.includes("bank") ? "bank" : methods[0] || "",
      notes: saved.notes || "",
      marketingConsent: Boolean(saved.marketingConsent),
    }; }),
    [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(null),
    [step, setStep] = useState("cart");
  useEffect(()=>{if(done)return;setForm(current=>methods.includes(current.paymentMethod)?current:{...current,paymentMethod:methods.includes("bank")?"bank":methods[0]||""});},[methods.join(","),done]);
  const [quoteBusy, setQuoteBusy] = useState(false),
    [quoteError, setQuoteError] = useState(""),
    [countries, setCountries] = useState([]),
    [regions, setRegions] = useState([]),
    [areas, setAreas] = useState([]);
  const [proofFile,setProofFile]=useState(null),[uploadPercent,setUploadPercent]=useState(0),[proofUploaded,setProofUploaded]=useState(false),[proofComplete,setProofComplete]=useState(false);const uploadedProof=useRef("");
  const reviewRef=useRef(null);const [copied,setCopied]=useState("");const copyTimer=useRef(null);
  const copyPayment=async(label,value)=>{try{await navigator.clipboard.writeText(String(value));setCopied(label);clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(""),2000);}catch{setCopied("Copy failed. Select and copy the value manually.");}};
  useEffect(()=>()=>clearTimeout(copyTimer.current),[]);
  useEffect(()=>{if(!["review","proof"].includes(step)||!quote)return;const frame=requestAnimationFrame(()=>{const node=reviewRef.current;if(!node)return;node.focus({preventScroll:true});let parent=node.parentElement;while(parent){if(parent.scrollHeight>parent.clientHeight&&/auto|scroll/.test(getComputedStyle(parent).overflowY)){parent.scrollTop=0;break;}parent=parent.parentElement;}});return()=>cancelAnimationFrame(frame);},[step,quote]);
  const submittedRequest=useRef(null),checkoutStarted=useRef(false);
  const key = useRef(""),
    lock = useRef(false),
    root = `/v1-1/store-studio/commerce/public/${encodeURIComponent(store.slug)}`;
  const payload = () => ({
      ...form,
      displayCurrency:display.code,
      // The existing order API deliberately treats an omitted/blank method as
      // a digital checkout. Do not send a new "digital" enum to legacy APIs.
      fulfillmentMethod: physical ? form.fulfillmentMethod : "",
      address: {
        ...form.address,
        line: form.address.streetAddress || form.address.line || "",
        streetAddress: form.address.streetAddress || form.address.line || "",
      },
      tracking:trackingData("store",store.slug),
      items: items.map((p) => ({
        productId: p._id,
        quantity: p.quantity,
        selectedVariants: p.selectedVariants || {},
      })),
    });
  const change = (k, v) => {
    if(submittedRequest.current){setError("Retry your order submission before editing details.");return;}
    setForm((f) => ({ ...f, [k]: v }));
    const deliveryChange = k === 'address' && ['countryCode', 'regionId', 'state', 'areaId', 'city', 'postcode'].some(field => form.address[field] !== v[field]);
    if (deliveryChange || ['pickupId', 'coupon', 'fulfillmentMethod'].includes(k)) { setQuote(null); setQuoteError(''); }
    key.current = "";
  };
  const address = (k, v) => change("address", { ...form.address, [k]: v });
  const setFulfillment = (fulfillmentMethod) => {
    if(submittedRequest.current)return;
    setForm((current) => ({
      ...current,
      fulfillmentMethod,
      pickupId: fulfillmentMethod === "pickup" ? current.pickupId : "",
    }));
    setQuote(null);
    setQuoteError("");
    key.current = "";
  };
  // The curated location API currently supplies the countries it knows about.
  // A live legacy store can still have a countrywide zone outside that list,
  // so merge configured zones in rather than losing an existing checkout.
  const countryCandidates = [
    ...countries.filter((country) => zones.some((zone) => countryMatchesZone(country, zone))),
    ...zones.flatMap(zone => (zone.countries?.length ? zone.countries : [zone.countryCode]).filter(Boolean).map(value => {
      const aliases={NG:"Nigeria",GH:"Ghana"};
      const canonical=Object.keys(aliases).find(code=>sameLocation(code,value)||sameLocation(aliases[code],value))||value;
      const known = countries.find(country => [country.code, country.name].some(v => sameLocation(v, canonical))) || (aliases[canonical]?{id:canonical,code:canonical,name:aliases[canonical]}:null);
      return known || { id: value, code: value, name: value };
    })),
  ];
  const countryItems = countryCandidates.filter((item, index, all) => all.findIndex(other => sameLocation(locationId(other), locationId(item))) === index);
  const countryProfile = config.delivery?.countries?.find(c => c.countryCode === form.address.countryCode && c.enabled !== false);
  const selectedCountry = countryItems.find((item) =>
    sameLocation(locationId(item), form.address.countryCode) ||
    sameLocation(locationLabel(item), form.address.countryCode) ||
    sameLocation(locationLabel(item), form.address.country),
  );
  const selectedCountryZones = zones.filter((zone) =>
    countryMatchesZone(selectedCountry || { code: form.address.countryCode, name: form.address.country }, zone),
  );
  const countrywideDelivery = selectedCountryZones.some(countrywideZone);
  const allRegionItems = regions.length
    ? regions
    : zones
        .filter((zone) => !form.address.countryCode || countryMatchesZone(selectedCountry || { code: form.address.countryCode, name: form.address.country }, zone))
        .map((zone) => ({ id: zone.regionId || zoneRegion(zone), name: zoneRegion(zone) }))
        .filter((item) => item.id && item.name)
        .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
  const regionItems = countryProfile && !countryProfile.allStates
    ? allRegionItems.filter(region => countryProfile.states.some(state => state.enabled !== false && state.regionId === locationId(region)))
    : allRegionItems;
  const regionRequired = true;
  const deliveryLocationReady = Boolean(form.address.countryCode && (!regionRequired || regionItems.some(item => locationId(item) === form.address.regionId)));
  const showRegionSelector = Boolean(form.address.countryCode && (regionRequired || regionItems.length));
  const areaItems = areas.length
    ? areas
    : zones
        .filter((zone) => !form.address.regionId || zone.regionId === form.address.regionId || sameLocation(zoneRegion(zone), form.address.state))
        .flatMap((zone) => zoneAreas(zone).map((name) => ({ id: name, name })))
        .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
  const activePickup = pickups.find((pickup) => pickup.id === form.pickupId);
  const detailsReady = !physical || (
    form.fulfillmentMethod === "pickup"
      ? Boolean(activePickup)
      : form.fulfillmentMethod === "delivery" && deliveryLocationReady
  );
  const canRequestQuote = physical && step === "details" && !settingsBusy && !settingsError && (
    form.fulfillmentMethod === "pickup"
      ? Boolean(activePickup)
      : form.fulfillmentMethod === "delivery" && deliveryLocationReady
  );

  useEffect(() => {
    if (step !== 'details') return;
    let active = true;
    setSettingsBusy(true); setSettingsError(''); setQuote(null);
    apiRequest(`${root}/config`, { token: null, cache: 'no-store' }).then(result => {
      if (active) setLive({ config: result.config, fulfillment: result.fulfillment || {} });
    }).catch(e => { if (active) setSettingsError(e.message); }).finally(() => { if (active) setSettingsBusy(false); });
    return () => { active = false; };
  }, [physical, step, root, settingsRetry]);

  useEffect(() => {
    if (!physical) return;
    const allowed = [
      ...(deliveryAvailable ? ["delivery"] : []),
      ...(pickupAvailable ? ["pickup"] : []),
    ];
    setForm((current) => {
      const fulfillmentMethod = allowed.includes(current.fulfillmentMethod)
        ? current.fulfillmentMethod
        : allowed.length === 1
          ? allowed[0]
          : "";
      const pickupId = fulfillmentMethod === "pickup" && pickups.some((pickup) => pickup.id === current.pickupId)
        ? current.pickupId
        : "";
      return current.fulfillmentMethod === fulfillmentMethod && current.pickupId === pickupId
        ? current
        : { ...current, fulfillmentMethod, pickupId };
    });
  }, [physical, deliveryAvailable, pickupAvailable, pickups]);

  useEffect(() => {
    let active = true;
    if(!physical)return;
    deliveryLocations("countries")
      .then((items) => {
        if (active) setCountries(items);
      })
      .catch(() => {
        // Existing storefronts keep working while the new location library is rolled out.
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!form.address.countryCode || !countryItems.length) return;
    const match = countryItems.find((item) =>
      sameLocation(locationId(item), form.address.countryCode) ||
      sameLocation(locationLabel(item), form.address.countryCode) ||
      sameLocation(locationLabel(item), form.address.country),
    );
    if (!match) return;
    const countryCode = match.code || locationId(match);
    const country = locationLabel(match) || countryCode;
    if (form.address.countryCode === countryCode && form.address.country === country) return;
    setForm((current) => ({
      ...current,
      address: { ...current.address, countryCode, country },
    }));
  }, [form.address.countryCode, form.address.country, countryItems]);

  useEffect(() => {
    const country = form.address.countryCode;
    if (!physical || !country) {
      setRegions([]);
      return undefined;
    }
    let active = true;
    setRegions([]);
    deliveryLocations("regions", { country })
      .then((items) => {
        if (active) setRegions(items);
      })
      .catch(() => {
        if (active) setRegions([]);
      });
    return () => { active = false; };
  }, [form.address.countryCode]);

  useEffect(() => {
    const region = form.address.regionId;
    if (!physical || !region || countryProfile) {
      setAreas([]);
      return undefined;
    }
    let active = true;
    setAreas([]);
    deliveryLocations("areas", { region })
      .then((items) => {
        if (active) setAreas(items);
      })
      .catch(() => {
        if (active) setAreas([]);
      });
    return () => { active = false; };
  }, [form.address.regionId]);

  useEffect(() => {
    if (form.address.regionId || !form.address.state || !regionItems.length) return;
    const match = regionItems.find((item) => sameLocation(locationLabel(item), form.address.state) || item.aliases?.some((alias) => sameLocation(alias, form.address.state)));
    if (match) setForm((current) => ({ ...current, address: { ...current.address, regionId: locationId(match), state: locationLabel(match) } }));
  }, [form.address.regionId, form.address.state, regionItems]);

  useEffect(() => {
    if (form.address.areaId || !form.address.city || !areaItems.length) return;
    const match = areaItems.find((item) => sameLocation(locationLabel(item), form.address.city) || item.aliases?.some((alias) => sameLocation(alias, form.address.city)));
    if (match) setForm((current) => ({ ...current, address: { ...current.address, areaId: locationId(match), city: locationLabel(match) } }));
  }, [form.address.areaId, form.address.city, areaItems]);

  useEffect(() => {
    if (step !== "details") return undefined;
    if (physical && !form.fulfillmentMethod) {
      setQuoteBusy(false);
      setQuote(null);
      setQuoteError("This store has not enabled a delivery or pickup option for physical products.");
      return undefined;
    }
    if (settingsBusy || settingsError || (physical && !canRequestQuote)) {
      setQuoteBusy(false);
      setQuote(null);
      setQuoteError(
        form.fulfillmentMethod === "pickup"
          ? "Choose a pickup location to see your total."
          : !form.address.countryCode
            ? "Choose your country to see delivery options."
            : "Choose your state or region to see delivery availability.",
      );
      return undefined;
    }
    let active = true;
    setQuoteBusy(true);
    setQuoteError("");
    const timer = setTimeout(() => {
      apiRequest(`${root}/quote`, {
        token: null,
        method: "POST",
        body: JSON.stringify(payload()),
      })
        .then((nextQuote) => {
          if (active) setQuote(nextQuote);
        })
        .catch((nextError) => {
          if (active) {
            setQuote(null);
            setQuoteError(nextError.message || "Delivery is not available for this location.");
          }
        })
        .finally(() => {
          if (active) setQuoteBusy(false);
        });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    physical,
    step,
    form.fulfillmentMethod,
    form.pickupId,
    form.address.countryCode,
    form.address.regionId,
    form.address.state,
    form.address.areaId,
    form.address.city,
    form.address.postcode,
    live,
    form.coupon,
    itemsKey,
    canRequestQuote,
    root,
  ]);
  useEffect(()=>{try{const pending=JSON.parse(sessionStorage.getItem(`store-bank-pending:${store.slug}`)||"null");if(pending&&new Date(pending.order.reservationExpiresAt)>new Date()){setDone(pending.order);setQuote(pending.quote);setForm(pending.form);setStep("review");}}catch{}},[store.slug]);
  const rememberOrder=result=>{
    setDone({...result,lines:quote?.lines||[]});
    try{sessionStorage.removeItem(`store-checkout-handoff:${store.slug}`);sessionStorage.setItem(`store-receipt:${store.slug}`,result.receiptToken);}catch{}
  };
  const review = async e => {
    e?.preventDefault();
    if(lock.current||settingsBusy||settingsError)return;
    const phone=normalizeLeadPhone(form.customerPhone,'NG');
    if(!phone){setError('Enter a valid WhatsApp number with its country code.');return;}
    if(!methods.includes(form.paymentMethod)){setError('This store has no available payment method for this order.');return;}
    if(physical&&!detailsReady){setError('Choose your delivery location.');return;}
    lock.current=true;setBusy(true);setError('');
    if(!key.current)key.current=crypto.randomUUID();
    try{
      const body=submittedRequest.current||{...payload(),customerPhone:phone};
      const q=submittedRequest.current?quote:await apiRequest(`${root}/quote`,{token:null,method:'POST',body:JSON.stringify(body)});
      if(!submittedRequest.current&&quote&&['currency','totalMinor','shippingMinor','subtotalMinor'].some(k=>quote.totals[k]!==q.totals[k])){setQuote(q);setError('Your total changed. Review the updated total and confirm again.');return;}
      if(!submittedRequest.current)submittedRequest.current={...body,idempotencyKey:key.current,expectedTotals:q.totals};
      const result=await apiRequest(`${root}/checkout`,{token:null,method:'POST',body:JSON.stringify(submittedRequest.current),timeoutMs:30000});
      submittedRequest.current=null;
      setQuote({...q,bank:result.paymentSnapshot?.bank||q.bank});rememberOrder(result);setDone({...result,lines:q.lines});
      if(form.paymentMethod==='bank'){try{sessionStorage.setItem(`store-bank-pending:${store.slug}`,JSON.stringify({order:{...result,lines:q.lines},quote:{...q,bank:result.paymentSnapshot?.bank||q.bank},form}));}catch{}setStep('review');}else{items.forEach(p=>removeFromCart(p._id,p.selectedVariants));setStep('done');}
    }catch(e){setError(e.message);if(e.status===400||e.status===409){submittedRequest.current=null;key.current='';setQuote(null);}else if(submittedRequest.current){setError('We could not confirm the response. Retry Confirm Order to recover the same order.');}}
    finally{lock.current=false;setBusy(false);}
  };
  const submit = async () => {
    if(lock.current||!done)return;
    if(!proofFile){notify.error('Please upload your payment proof.');return;}
    lock.current=true;setBusy(true);setError('');
    try{
      if(!['image/jpeg','image/png','image/webp'].includes(proofFile.type)||proofFile.size>5*1024*1024||proofFile.size===0)throw Error('Choose a JPG, PNG or WebP image smaller than 5 MB.');
      if(!uploadedProof.current){const upload=await uploadPaymentProof(proofFile,event=>{if(event.total)setUploadPercent(Math.min(99,Math.round(event.loaded/event.total*100)));});if(!upload.url)throw Error('Proof upload did not finish. Please try again.');uploadedProof.current=upload.url;}
      setProofUploaded(true);setUploadPercent(100);
      await apiRequest(`${root}/receipt/${done.receiptToken}/proof`,{token:null,method:'POST',body:JSON.stringify({paymentProof:uploadedProof.current})});
      try{sessionStorage.removeItem(`store-bank-pending:${store.slug}`);}catch{}setProofComplete(true);items.forEach(p=>removeFromCart(p._id,p.selectedVariants));setStep('done');
    }catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}
  };
  const title =
    step === "done"
      ? (form.paymentMethod==="bank"?"Order pending confirmation":"Order received")
      : step === "proof" ? "Upload payment proof" : step === "cart"
        ? `Your cart (${new Set(items.map(p=>p._id)).size})`
        : step === "review"
          ? "Review your order"
          : "Checkout";
  const receivedTotal=done?.displayCurrency ? new Intl.NumberFormat('en-NG',{style:'currency',currency:done.displayCurrency.currency}).format(done.displayCurrency.amountMinor/10**currencyDigits(done.displayCurrency.currency)) : done ? formatBaseMoney(done.totals.totalMinor,done.totals.currency) : '';
  const whats = String(done?.paymentSnapshot?.whatsapp || store.whatsappDestination || store.phone || "")
    .replace(/\D/g, "")
    .replace(/^0(?=\d{10}$)/, "234");
  const summary = done
    ? `Hello ${store.name}, my order is ${done.orderNumber}.\n${done.lines.map((l) => `${l.productType === "digital" ? "" : l.quantity+" × "}${l.name}`).join("\n")}\nTotal: ${formatBaseMoney(done.totals.totalMinor, done.totals.currency)}\nName: ${form.customerName}\nWhatsApp: ${form.customerPhone}${form.customerEmail?`\nEmail: ${form.customerEmail}`:""}${physical?`\nDelivery: ${form.fulfillmentMethod}\n${[form.address.line,form.address.state,form.address.country].filter(Boolean).join(", ")}`:""}`
    : "";
  useEffect(() => {
    let cancelled=false;
    const ids=[...new Map(items.map(item=>[item._id,item])).values()];
    Promise.all(ids.map(item=>apiRequest(`/v1-1/store-studio/commerce/public/${encodeURIComponent(store.slug)}/products/${encodeURIComponent(item.slug)}`,{token:null}).then(result=>result.product))).then(products=>{if(!cancelled)refreshProducts(products);}).catch(()=>{});
    return()=>{cancelled=true;};
  }, [store.slug]);
  return (
    <Modal
      wide
      className={`${css.publicModal} ${["streetline","streetline-services"].includes(design?.theme)?css.streetline:""} ${css.cartDrawer}`}
      backdropClassName={css.drawerBackdrop}
      style={storeThemeStyle(design)}
      title={title}
      onClose={() => !busy && onClose()}
      footer={
        step === "done" ? (
          form.paymentMethod === "whatsapp" ? null : <Button onClick={onClose}>Done</Button>
        ) : step === "proof" ? (
          <div className={css.checkoutActions}><Button variant="secondary" disabled={busy} onClick={()=>setStep("review")}>Back</Button><Button className={css.proofUploadButton} disabled={busy} onClick={submit} aria-busy={busy}><span className={css.uploadFill} style={{width:`${busy?uploadPercent:0}%`}} aria-hidden="true"/><span>{busy?(proofComplete?<CheckCircle2 className={css.proofSuccessTick} size={22} aria-label="Proof received"/>:proofUploaded?"Confirming…":`Uploading ${uploadPercent}%`):"Upload proof"}</span></Button></div>
        ) : step === "cart" ? (
          <div className={css.cartFooter}><div className={css.cartSubtotal}><span>Subtotal</span><strong>{displayMoney(items.reduce((sum,p)=>sum+Math.round(Number(p.price||0)*100)*p.quantity,0),store.currency)}</strong></div><small>Delivery and discounts are calculated at checkout.</small><Button disabled={!items.length||items.some(p=>p.quantity<1)} onClick={() => {if(!checkoutStarted.current){checkoutStarted.current=true;onEvent?.("checkout");}setStep("details");}}>
            Checkout
          </Button></div>
        ) : step === "details" ? (
          <div className={css.checkoutActions}>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setStep("cart")}
            >
              Back to Cart
            </Button>
            <Button form="atelier-checkout" type="submit" disabled={busy || settingsBusy || Boolean(settingsError) || !methods.length || !detailsReady || quoteBusy || !quote || Boolean(quoteError)}>
              {busy ? "Calculating…" : "Confirm Order"}
            </Button>
          </div>
        ) : (
          <div className={css.checkoutActions}>
            <Button disabled={busy || !quote} onClick={form.paymentMethod==="bank"?()=>{setError("");setStep("proof");}:submit}>
              {busy ? "Placing order…" : form.paymentMethod==="bank"?"I have paid":"Place order"}
            </Button>
          </div>
        )
      }
    >
      <div className={css.checkout}>
        {step === "cart" && (
          <>
            {items.map((p) => (
              <article className={css.cartItem} key={p.cartKey}>
                {p.images?.[0] && <img src={p.images[0]} alt="" />}
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {Object.values(p.selectedVariants || {}).join(" · ")}
                  </small>
                  <span>
                    {displayMoney(Math.round(p.price * 100), store.currency)}
                  </span>
                </div>
                {p.productType !== "digital" && <div className={css.quantity}>
                  <button
                    disabled={p.quantity<=1} aria-label={`Reduce ${p.name}`}
                    onClick={() =>
                      updateQty(p._id, p.quantity - 1, p.selectedVariants)
                    }
                  >
                    <Minus size={13} />
                  </button>
                  <span aria-live="polite">{p.quantity}</span>
                  <button
                    disabled={p.quantity >= cartQuantityLimit(p)}
                    aria-label={`Increase ${p.name}`}
                    onClick={() =>
                      updateQty(p._id, p.quantity + 1, p.selectedVariants)
                    }
                  >
                    <Plus size={13} />
                  </button>
                </div>}{p.productType !== "digital" && p.quantity>=cartQuantityLimit(p)&&<small>{cartQuantityLimit(p)===0?"Out of stock — remove this item to continue.":"Stock limit reached"}</small>}<div className={css.lineTotal}><strong>{displayMoney(Math.round(Number(p.price||0)*100)*p.quantity,store.currency)}</strong><button onClick={()=>removeFromCart(p._id,p.selectedVariants)} aria-label={`Remove ${p.name}`}>Remove</button></div>
              </article>
            ))}
            {!items.length && <p>Your cart is empty.</p>}
            <p>
              Confirm you've selected the right products before placing your order.
            </p>
          </>
        )}
        {step === "details" && (
          <form id="atelier-checkout" onSubmit={review} className={css.form}>
            <Field label="Full name">
              <input
                required
                maxLength={120}
                autoComplete="name"
                value={form.customerName}
                onChange={(e) => change("customerName", e.target.value)}
              />
            </Field>
            <Field label="WhatsApp number"><PhoneInput country="ng" enableSearch value={form.customerPhone} countryCodeEditable={false} containerClass={css.phoneInput} inputProps={{onPaste:event=>{const value=normalizeLeadPhone(event.clipboardData.getData('text'),'NG');if(value){event.preventDefault();change('customerPhone',value);}},required:true,name:'customerPhone',autoComplete:'tel','aria-label':'WhatsApp number'}} onChange={value=>change('customerPhone','+'+value.replace(/^2340/,'234'))}/></Field>
            <Field
              label={
                (config.checkout.requireEmail||!physical) ? "Email" : "Email (optional)"
              }
            >
              <input
                type="email"
                required={config.checkout.requireEmail||!physical}
                autoComplete="email"
                value={form.customerEmail}
                onChange={(e) => change("customerEmail", e.target.value)}
              />
            </Field>
            {physical && (
              <section className={css.fulfillmentSection} aria-labelledby="fulfillment-heading">
                <div className={css.fulfillmentHeading}>
                  <span className={css.fulfillmentIcon}><Truck size={16} /></span>
                  <div>
                    <strong id="fulfillment-heading">How would you like to receive your order?</strong>

                  </div>
                </div>
                {availableFulfillment.length > 1 && (
                  <div className={css.fulfillmentChoices} role="radiogroup" aria-labelledby="fulfillment-heading">
                    {deliveryAvailable && (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={form.fulfillmentMethod === "delivery"}
                        className={form.fulfillmentMethod === "delivery" ? css.fulfillmentChoiceActive : ""}
                        onClick={() => setFulfillment("delivery")}
                      >
                        <Truck size={16} /><span><b>Delivery</b><small>Send it to my address</small></span>
                      </button>
                    )}
                    {pickupAvailable && (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={form.fulfillmentMethod === "pickup"}
                        className={form.fulfillmentMethod === "pickup" ? css.fulfillmentChoiceActive : ""}
                        onClick={() => setFulfillment("pickup")}
                      >
                        <Store size={16} /><span><b>Pickup</b><small>Collect from the store</small></span>
                      </button>
                    )}
                  </div>
                )}
                {!availableFulfillment.length && (
                  <p className={css.fulfillmentUnavailable} role="alert">This store has not enabled delivery or pickup for physical products yet.</p>
                )}
                {form.fulfillmentMethod === "pickup" && (
                  <div className={css.pickupPanel}>
                    <Field label="Pickup location">
                      <select required value={form.pickupId} onChange={(event) => change("pickupId", event.target.value)}>
                        <option value="">Choose a pickup location</option>
                        {pickups.map((pickup) => <option key={pickup.id} value={pickup.id}>{pickup.name}</option>)}
                      </select>
                    </Field>
                    {activePickup && (
                      <div className={css.pickupDetails}>
                        <MapPin size={15} /><div><strong>{activePickup.name}</strong><span>{activePickup.address}</span>{activePickup.hours && <small>{activePickup.hours}</small>}{activePickup.instructions && <small>{activePickup.instructions}</small>}</div>
                      </div>
                    )}
                  </div>
                )}
                {form.fulfillmentMethod === "delivery" && (
                  <div className={css.deliveryAddress}>
                    <div className={css.deliveryAddressHeading}><MapPin size={16}/><span><strong>Delivery address</strong><small>Choose a supported location to see the delivery price.</small></span></div>
                    <LocationSelect
                      label="Country"
                      style={storeThemeStyle(design)}
                      required
                      items={countryItems}
                      value={form.address.countryCode}
                      placeholder="Choose your country"
                      onChange={(item) => change("address", {
                        ...form.address,
                        countryCode: item?.code || locationId(item),
                        country: locationLabel(item) || item?.code || locationId(item),
                        regionId: "", state: "", areaId: "", city: "",
                      })}
                    />
                    {showRegionSelector && (
                      <LocationSelect
                        label="State / Region"
                        style={storeThemeStyle(design)}
                        loading={!regions.length && !regionItems.length}
                        required={regionRequired}
                        items={regionItems}
                        value={form.address.regionId}
                        disabled={!form.address.countryCode}
                        placeholder={regionRequired ? "Choose your state or region" : "Choose a state or region if applicable"}
                        onChange={(item) => change("address", {
                          ...form.address,
                          regionId: locationId(item),
                          state: locationLabel(item),
                          areaId: "", city: "",
                        })}
                      />
                    )}
                    {!countryProfile && areaItems.length > 0 && (
                      <LocationSelect
                        label="City / area (optional)"
                        items={areaItems}
                        value={form.address.areaId}
                        disabled={!form.address.regionId}
                        placeholder="Choose an area if applicable"
                        onChange={(item) => change("address", {
                          ...form.address,
                          areaId: locationId(item),
                          city: locationLabel(item),
                        })}
                      />
                    )}
                    <Field label="Street address">
                      <textarea rows={2}
                        required
                        autoComplete="street-address"
                        value={form.address.streetAddress || form.address.line}
                        placeholder="House number, street and estate"
                        onChange={(event) => change("address", { ...form.address, line: event.target.value, streetAddress: event.target.value })}
                      />
                    </Field>
                    {!countryProfile && <Field label="City / Area"><input required autoComplete="address-level2" value={form.address.city} onChange={event => change("address", { ...form.address, city: event.target.value, areaId: "" })} /></Field>}
                    {selectedCountryZones.some(zone => zone.postcodes?.length) && <Field label="Postal code"><input autoComplete="postal-code" value={form.address.postcode} onChange={event => address("postcode", event.target.value)} /></Field>}
                    <Field label="Additional directions (optional)">
                      <input
                        autoComplete="off"
                        value={form.address.directions}
                        placeholder="Landmark, gate code or other useful detail"
                        onChange={(event) => address("directions", event.target.value)}
                      />
                    </Field>
                  </div>
                )}
                {(form.fulfillmentMethod || quoteBusy || quoteError) && (
                  <section className={css.deliveryQuote} aria-live="polite">
                    {settingsBusy ? <span>Refreshing delivery settings…</span> : settingsError ? <p role="alert">{settingsError} <button type="button" onClick={() => setSettingsRetry(v => v + 1)}>Retry</button></p> : quoteBusy ? <span>Checking delivery options…</span> : quote ? <>
                      <div><span>{form.fulfillmentMethod === "pickup" ? "Pickup" : "Delivery"}</span><strong>{quote.delivery?.name || (form.fulfillmentMethod === "pickup" ? activePickup?.name : "Selected location")}</strong></div>
                      {estimateLabel(quote.delivery?.estimate, quote.delivery?.estimateLabel) && <small>Estimated arrival: {estimateLabel(quote.delivery?.estimate, quote.delivery?.estimateLabel)}</small>}
                      <div><span>Subtotal</span><strong>{displayMoney(quote.totals?.subtotalMinor, quote.totals?.currency || store.currency)}</strong></div>
                      <div className={css.deliveryQuotePrice}><span>Delivery fee</span><strong>{Number(quote.totals?.shippingMinor || 0) === 0 ? "Free" : displayMoney(quote.totals?.shippingMinor, quote.totals?.currency || store.currency)}</strong></div>
                      <div><span>Total</span><strong>{displayMoney(quote.totals?.totalMinor, quote.totals?.currency || store.currency)}</strong></div>
                    </> : quoteError ? <p role="alert">{quoteError}</p> : <span>Choose your location to see delivery availability and your total.</span>}
                  </section>
                )}
              </section>
            )}
            {physical && config.checkout.allowNotes && (
              <Field label="Order notes (optional)">
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={form.notes}
                  onChange={(e) => change("notes", e.target.value)}
                />
              </Field>
            )}
            <Field label="Payment method">
              <select
                value={form.paymentMethod}
                onChange={(e) => change("paymentMethod", e.target.value)}
              >
                {methods.map((m) => (
                  <option value={m} key={m}>
                    {
                      {
                        bank: "Manual Bank Transfer",
                        cod: "Cash on Delivery",
                        whatsapp: "Pay on WhatsApp",
                      }[m]
                    }
                  </option>
                ))}
              </select>
            </Field>
            <label className={css.consent}>
              <input
                type="checkbox"
                checked={form.marketingConsent}
                onChange={(e) => change("marketingConsent", e.target.checked)}
              />
              I agree to receive updates from this store.
            </label>
            {config.checkout.paymentInstructions?.[form.paymentMethod]&&<p className={css.transferNote}>{config.checkout.paymentInstructions[form.paymentMethod]}</p>}
            <Field label="Discount code (optional)">
              <input
                value={form.coupon}
                maxLength={30}
                onChange={(e) => change("coupon", e.target.value.toUpperCase())}
              />
            </Field>
            {settingsError&&<p role="alert">{settingsError} <button type="button" onClick={()=>setSettingsRetry(v=>v+1)}>Retry</button></p>}
            {!methods.length&&<p role="alert">This store has no available payment methods. Contact the store to order.</p>}
            {!physical&&quoteError&&<p role="alert">{quoteError}</p>}
            {quote&&<section aria-label="Order summary"><h3>Order summary</h3>{quote.lines.map(line=><p key={line.productId}>{line.name}{line.productType==='physical'?` × ${line.quantity}`:''}</p>)}<strong>Total: {displayMoney(quote.totals.totalMinor,quote.totals.currency)}</strong></section>}
          </form>
        )}
        {step === "review" && quote && (
          <section ref={reviewRef} tabIndex={-1} className={css.reviewPanel}>
            {form.paymentMethod === "bank" && quote.bank && (
              <section className={css.transferCard} aria-label="Bank transfer details">
                <header><small>Bank transfer</small><h3>{store.name}</h3><p>{physical?"Make payment to the account below, then tap ‘I have paid’.":"Transfer the amount to the account below. Once your payment is confirmed, you’ll receive the access details for your digital product or service."}</p></header>
                {[["Order reference",done?.orderNumber],["Bank",quote.bank.name],["Account name",quote.bank.accountName],["Account number",quote.bank.accountNumber],["Amount",(quote.totals.totalMinor/100).toFixed(2)]].map(([label,value])=><div className={css.transferRow} key={label}><div><small>{label}</small><strong>{label==="Amount"?formatBaseMoney(quote.totals.totalMinor,quote.totals.currency):value}</strong></div><button type="button" onClick={()=>copyPayment(label,value)} aria-label={`Copy ${label.toLowerCase()}`} title={`Copy ${label.toLowerCase()}`}>{copied===label?<Check size={14}/>:<Copy size={14}/>}</button></div>)}
                <p className={css.transferNote}>Upload your transfer receipt next.</p>
                <span className={css.copyStatus} role="status">{copied?(copied.startsWith("Copy failed")?copied:`${copied} copied`):""}</span>
              </section>
            )}
            <h3 className={css.reviewTitle}>Order summary</h3>
            <dl className={`${css.totals} ${css.reviewTotals}`}>
              {[["subtotalMinor","Subtotal"],["discountMinor","Discount"],["shippingMinor","Delivery"],["taxMinor",`${config.checkout.taxLabel}${quote.totals.taxInclusive?" (included)":""}`],["totalMinor","Total"]].filter(([k])=>physical||k!=="shippingMinor").map(([k,label])=><div key={k}><dt>{label}</dt><dd>{k === "shippingMinor" && Number(quote.totals[k] || 0) === 0 ? "Free" : <>{k === "discountMinor" ? "-" : ""}{displayMoney(quote.totals[k],quote.totals.currency)}</>}</dd></div>)}
            </dl>
            <p><strong>Amount payable: {formatBaseMoney(quote.totals.totalMinor,quote.totals.currency)}</strong>{display.code!==quote.totals.currency&&<small> · Display prices are estimates. Payment is collected in {quote.totals.currency}.</small>}</p><details className={css.reviewItems}><summary>Items & delivery · {quote.lines.length} {quote.lines.length===1?"item":"items"}</summary><p>{form.customerName} · {form.customerPhone}</p>{quote.lines.map((l,i)=><p key={i}>{l.productType==="physical"?`${l.quantity} × `:""}{l.name} — {displayMoney(l.unitMinor*l.quantity,quote.totals.currency)}</p>)}<p>{physical&&quote.delivery.name}{estimateLabel(quote.delivery.estimate,quote.delivery.estimateLabel) ? ` · ${estimateLabel(quote.delivery.estimate, quote.delivery.estimateLabel)}` : ""}</p></details>
            {quote.delivery.unconfigured&&<p className={css.transferNote}>Any delivery charges must be arranged with the store separately.</p>}
          </section>
        )}
        {step === "proof" && <section ref={reviewRef} tabIndex={-1} className={css.proofPanel}><h3>Upload your transfer receipt</h3><p>{store.name} will review your payment before confirming the order.</p><label className={css.proofPicker}><Copy size={24}/><strong>{proofFile?proofFile.name:"Choose payment proof"}</strong><span>JPG, PNG or WebP · up to 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>{const file=event.target.files?.[0];if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setError("Choose a JPG, PNG or WebP image smaller than 5 MB.");event.target.value="";return;}setProofFile(file);uploadedProof.current="";setProofUploaded(false);setUploadPercent(0);setError("");}}/></label><p className={css.transferNote}>Make sure the amount, date and transaction reference are readable.</p></section>}
        {step === "done" && done && (
          <section className={css.confirmationCard}>
            <div className={css.confirmationIcon}><CheckCircle2 size={32}/></div>
            {form.paymentMethod!=="whatsapp"&&<span className={css.pendingBadge}>Pending confirmation</span>}
            <h2>{form.paymentMethod==="bank"?"Your proof is received":"Your order is received"}</h2>
            <p><strong>Amount payable: {formatBaseMoney(done.totals.totalMinor,done.totals.currency)}</strong></p><p>{form.paymentMethod==="bank"?"Your order is pending while the store confirms your payment.":form.paymentMethod==="whatsapp"?"Your order has been created. Tap the button below to send the details to the store on WhatsApp and complete your purchase.":"The store will confirm your order and payment."}</p>
            {done.paymentSnapshot?.instructions&&<p className={css.transferNote}>{done.paymentSnapshot.instructions}</p>}
            <dl className={css.confirmationDetails}><div><dt>Order code</dt><dd>{done.orderNumber}</dd></div><div><dt>Total</dt><dd>{receivedTotal}</dd></div></dl>
            {config.notifications?.email&&form.customerEmail&&<p className={css.confirmationEmail}>You’ll receive an email when the store confirms your order.</p>}
            {form.paymentMethod!=="whatsapp"&&onAccount&&<Button onClick={()=>{onClose();onAccount();}}>View my orders</Button>}
            {form.paymentMethod!=="whatsapp"&&<a className={css.trackOrder} href={`/v1-1/store-receipt/${encodeURIComponent(store.slug)}?token=${encodeURIComponent(done.receiptToken)}`}>Track this order</a>}
            {(form.paymentMethod==="whatsapp"||done.paymentSnapshot?.showOrderWhatsapp)&&whats&&<a className={css.whatsapp} href={`https://wa.me/${whats}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noreferrer"><FaWhatsapp/> Send Order on WhatsApp</a>}
          </section>
        )}
        {error && (
          <p role="alert" className={css.error}>
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
export function ReviewForm({ slug, onClose }) {
  const [form, setForm] = useState({ name: "", rating: 5, text: "" }),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <Modal title="Leave a review" onClose={onClose}>
      <form
        className={css.form}
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          try {
            const r = await apiRequest(
              `/v1-1/store-studio/commerce/public/${encodeURIComponent(slug)}/reviews`,
              {
                token: null,
                method: "POST",
                body: JSON.stringify({
                  ...form,
                  receiptToken:
                    sessionStorage.getItem(`store-receipt:${slug}`) || "",
                }),
              },
            );
            setMessage(r.message);
          } catch (e) {
            setMessage(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Your name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Field>
        <Field label="Rating">
          <select
            value={form.rating}
            onChange={(e) =>
              setForm((f) => ({ ...f, rating: Number(e.target.value) }))
            }
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </Field>
        <Field label="Your review">
          <textarea
            required
            maxLength={1500}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          />
        </Field>
        <Button disabled={busy}>{busy ? "Sending…" : "Submit review"}</Button>
        {message && <p role="status">{message}</p>}
      </form>
    </Modal>
  );
}

export function QuickProductDialog({product,store,design,onClose,onAdded}){return <Modal title="Choose options" backdropClassName={css.optionsBackdrop} className={`${css.publicModal} ${["streetline","streetline-services"].includes(design?.theme)?css.streetline:""} ${css.quickModal}`} style={storeThemeStyle(design)} onClose={onClose}><ProductDetails quick product={product} store={store} design={design} onAdded={onAdded}/></Modal>;}
