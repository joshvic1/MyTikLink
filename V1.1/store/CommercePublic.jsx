import {trackingData} from "../tracking/browser";
import {uploadPaymentProof} from "@/services/uploadService";
import {cartQuantityLimit} from "@/components/store/context/cartLimits.mjs";
import {storeThemeStyle,productHref} from "./StoreTheme";
import {storeImageSrcSet} from "./storeMedia";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, X, Minus, Plus, ShoppingCart, Copy, Check, CheckCircle2 } from "lucide-react";
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
                <input
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
export function CommerceCheckout({ store, config, design, onClose, onEvent, onAccount }) {
  const { cart, removeFromCart, updateQty, refreshProducts } = useCart(),
    items = cart.filter((p) => p.storeSlug === store.slug),
    [form, setForm] = useState(() => {
      let saved = {};
      try { saved = JSON.parse(sessionStorage.getItem(`store-checkout-handoff:${store.slug}`) || "{}"); } catch {}
      return {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      address: { line: "", country: "NG", state: "", city: "", postcode: "" },
      pickupId: "",
      coupon: "",
      paymentMethod: config.checkout.paymentMethods[0] || "bank",
      notes: "",
      marketingConsent: false,
      ...saved,
    }; }),
    [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(null),
    [step, setStep] = useState("cart");
  const [proofFile,setProofFile]=useState(null),[uploadPercent,setUploadPercent]=useState(0),[proofUploaded,setProofUploaded]=useState(false),[proofComplete,setProofComplete]=useState(false);const uploadedProof=useRef("");
  const reviewRef=useRef(null);const [copied,setCopied]=useState("");const copyTimer=useRef(null);
  const copyPayment=async(label,value)=>{try{await navigator.clipboard.writeText(String(value));setCopied(label);clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(""),2000);}catch{setCopied("Copy failed. Select and copy the value manually.");}};
  useEffect(()=>()=>clearTimeout(copyTimer.current),[]);
  useEffect(()=>{if(!["review","proof"].includes(step)||!quote)return;const frame=requestAnimationFrame(()=>{const node=reviewRef.current;if(!node)return;node.focus({preventScroll:true});let parent=node.parentElement;while(parent){if(parent.scrollHeight>parent.clientHeight&&/auto|scroll/.test(getComputedStyle(parent).overflowY)){parent.scrollTop=0;break;}parent=parent.parentElement;}});return()=>cancelAnimationFrame(frame);},[step,quote]);
  const key = useRef(""),
    lock = useRef(false),
    root = `/v1-1/store-studio/commerce/public/${encodeURIComponent(store.slug)}`;
  const physical = items.some((p) => p.productType === "physical"),
    payload = () => ({
      ...form,
      tracking:trackingData("store",store.slug),
      items: items.map((p) => ({
        productId: p._id,
        quantity: p.quantity,
        selectedVariants: p.selectedVariants || {},
      })),
    });
  const change = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setQuote(null);
    key.current = "";
  };
  const address = (k, v) => change("address", { ...form.address, [k]: v });
  const review = async (e) => {
    e?.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const q = await apiRequest(`${root}/quote`, {
        token: null,
        method: "POST",
        body: JSON.stringify(payload()),
      });
      setQuote(q);
      setStep("review");
      onEvent?.("checkout");
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const submit = async () => {
    if (lock.current || !quote) return;
    lock.current = true;
    setBusy(true);
    setError("");
    if (!key.current) key.current = crypto.randomUUID();
    try {
      let paymentProof="";
      if(form.paymentMethod==="bank"){
        if(!proofFile)throw new Error("Choose your payment proof first.");
        if(!uploadedProof.current){
          setProofUploaded(false);setUploadPercent(0);
          const upload=await uploadPaymentProof(proofFile,event=>{if(event.total)setUploadPercent(Math.min(99,Math.round(event.loaded/event.total*100)));});
          if(!upload.url)throw new Error("Proof upload did not finish. Please try again.");
          uploadedProof.current=upload.url;
        }
        paymentProof=uploadedProof.current;setUploadPercent(100);setProofUploaded(true);
      }
      const result = await apiRequest(`${root}/checkout`, {
        token: null,
        method: "POST",
        body: JSON.stringify({ ...payload(), paymentProof, idempotencyKey: key.current }),
        timeoutMs: 30000,
      });
      setDone({ ...result, lines: quote.lines });
      try { sessionStorage.removeItem(`store-checkout-handoff:${store.slug}`); } catch {}
      try {
        sessionStorage.setItem(
          `store-receipt:${store.slug}`,
          result.receiptToken,
        );
      } catch {}
      items.forEach((p) => removeFromCart(p._id, p.selectedVariants));
      if(form.paymentMethod==="bank"){setProofComplete(true);await new Promise(resolve=>setTimeout(resolve,650));}
      setStep("done");
    } catch (e) {
      setError(e.message);
      if (e.status === 409 || e.status === 400) {
        key.current = "";
        setQuote(null);
        setStep("details");
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const title =
    step === "done"
      ? (form.paymentMethod==="bank"?"Order pending confirmation":"Order received")
      : step === "proof" ? "Upload payment proof" : step === "cart"
        ? `Your cart (${new Set(items.map(p=>p._id)).size})`
        : step === "review"
          ? "Review your order"
          : "Checkout";
  const whats = String(store.phone || "")
    .replace(/\D/g, "")
    .replace(/^0(?=\d{10}$)/, "234");
  const summary = done
    ? `Hello ${store.name}, my order is ${done.orderNumber}.\n${done.lines.map((l) => `${l.quantity} × ${l.name}`).join("\n")}\nTotal: ${formatMoney(done.totals.totalMinor, done.totals.currency)}\nName: ${form.customerName}`
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
          <Button onClick={onClose}>Done</Button>
        ) : step === "proof" ? (
          <div className={css.checkoutActions}><Button variant="secondary" disabled={busy} onClick={()=>setStep("review")}>Back</Button><Button className={css.proofUploadButton} disabled={busy||!proofFile} onClick={submit} aria-busy={busy}><span className={css.uploadFill} style={{width:`${busy?uploadPercent:0}%`}} aria-hidden="true"/><span>{busy?(proofComplete?<CheckCircle2 className={css.proofSuccessTick} size={22} aria-label="Proof received"/>:proofUploaded?"Confirming…":`Uploading ${uploadPercent}%`):"Upload proof"}</span></Button></div>
        ) : step === "cart" ? (
          <div className={css.cartFooter}><div className={css.cartSubtotal}><span>Subtotal</span><strong>{formatMoney(items.reduce((sum,p)=>sum+Math.round(Number(p.price||0)*100)*p.quantity,0),store.currency)}</strong></div><small>Delivery and discounts calculated at checkout.</small><Button disabled={!items.length||items.some(p=>p.quantity<1)} onClick={() => setStep("details")}>
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
            <Button form="atelier-checkout" type="submit" disabled={busy}>
              {busy ? "Calculating…" : "Confirm Order"}
            </Button>
          </div>
        ) : (
          <div className={css.checkoutActions}>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setQuote(null);
                setStep("details");
              }}
            >
              Edit details
            </Button>
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
                    {formatMoney(Math.round(p.price * 100), store.currency)}
                  </span>
                </div>
                <div className={css.quantity}>
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
                </div>{p.quantity>=cartQuantityLimit(p)&&<small>{cartQuantityLimit(p)===0?"Out of stock — remove this item to continue.":"Stock limit reached"}</small>}<div className={css.lineTotal}><strong>{formatMoney(Math.round(Number(p.price||0)*100)*p.quantity,store.currency)}</strong><button onClick={()=>removeFromCart(p._id,p.selectedVariants)} aria-label={`Remove ${p.name}`}>Remove</button></div>
              </article>
            ))}
            {!items.length && <p>Your cart is empty.</p>}
            <p>
              Final prices, stock and delivery are checked before you place the
              order.
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
            <Field label="WhatsApp number">
              <input
                required
                type="tel"
                autoComplete="tel"
                value={form.customerPhone}
                onChange={(e) => change("customerPhone", e.target.value)}
              />
            </Field>
            <Field
              label={
                (config.checkout.requireEmail||form.paymentMethod==="bank") ? "Email" : "Email (optional)"
              }
            >
              <input
                type="email"
                required={config.checkout.requireEmail||form.paymentMethod==="bank"}
                autoComplete="email"
                value={form.customerEmail}
                onChange={(e) => change("customerEmail", e.target.value)}
              />
            </Field>
            {physical && (
              <>
                <Field label="Delivery method">
                  <select
                    value={form.pickupId}
                    onChange={(e) => change("pickupId", e.target.value)}
                  >
                    <option value="">Deliver to my address</option>
                    {config.delivery.pickups
                      .filter((p) => p.enabled)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          Pickup: {p.name}
                        </option>
                      ))}
                  </select>
                </Field>
                {form.pickupId ? (
                  <p>
                    {
                      config.delivery.pickups.find(
                        (p) => p.id === form.pickupId,
                      )?.address
                    }
                  </p>
                ) : (
                  <>
                    <Field label="Street address">
                      <input
                        required
                        autoComplete="street-address"
                        value={form.address.line}
                        onChange={(e) => address("line", e.target.value)}
                      />
                    </Field>
                    {[
                      ["country", "Country code (e.g. NG)"],
                      ["state", "State / region"],
                      ["city", "City"],
                      ["postcode", "Postal code (optional)"],
                    ].map(([k, label]) => (
                      <Field key={k} label={label}>
                        <input
                          required={k === "country"}
                          maxLength={k === "country" ? 2 : 80}
                          value={form.address[k]}
                          onChange={(e) =>
                            address(
                              k,
                              k === "country"
                                ? e.target.value.toUpperCase()
                                : e.target.value,
                            )
                          }
                        />
                      </Field>
                    ))}
                  </>
                )}
              </>
            )}
            <Field label="Discount code (optional)">
              <input
                value={form.coupon}
                maxLength={30}
                onChange={(e) => change("coupon", e.target.value.toUpperCase())}
              />
            </Field>
            <Field label="Payment method">
              <select
                value={form.paymentMethod}
                onChange={(e) => change("paymentMethod", e.target.value)}
              >
                {config.checkout.paymentMethods.map((m) => (
                  <option value={m} key={m}>
                    {
                      {
                        bank: "Bank transfer",
                        cod: "Cash on delivery",
                        whatsapp: "Arrange on WhatsApp",
                      }[m]
                    }
                  </option>
                ))}
              </select>
            </Field>
            {config.checkout.allowNotes && (
              <Field label="Order notes (optional)">
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={form.notes}
                  onChange={(e) => change("notes", e.target.value)}
                />
              </Field>
            )}
            <label className={css.consent}>
              <input
                type="checkbox"
                checked={form.marketingConsent}
                onChange={(e) => change("marketingConsent", e.target.checked)}
              />
              {config.marketing.consentText}
            </label>
          </form>
        )}
        {step === "review" && quote && (
          <section ref={reviewRef} tabIndex={-1} className={css.reviewPanel}>
            {form.paymentMethod === "bank" && quote.bank && (
              <section className={css.transferCard} aria-label="Bank transfer details">
                <header><small>Bank transfer</small><h3>{store.name}</h3><p>Make payment to the account below, then tap “I have paid”.</p></header>
                {[["Bank",quote.bank.name],["Account name",quote.bank.accountName],["Account number",quote.bank.accountNumber],["Amount",(quote.totals.totalMinor/100).toFixed(2)]].map(([label,value])=><div className={css.transferRow} key={label}><div><small>{label}</small><strong>{label==="Amount"?formatMoney(quote.totals.totalMinor,quote.totals.currency):value}</strong></div><button type="button" onClick={()=>copyPayment(label,value)} aria-label={`Copy ${label.toLowerCase()}`} title={`Copy ${label.toLowerCase()}`}>{copied===label?<Check size={14}/>:<Copy size={14}/>}</button></div>)}
                <p className={css.transferNote}>Upload your transfer receipt next. Payment stays pending until the store confirms it.</p>
                <span className={css.copyStatus} role="status">{copied?(copied.startsWith("Copy failed")?copied:`${copied} copied`):""}</span>
              </section>
            )}
            <h3 className={css.reviewTitle}>Order summary</h3>
            <dl className={`${css.totals} ${css.reviewTotals}`}>
              {[["subtotalMinor","Subtotal"],["discountMinor","Discount"],["shippingMinor","Delivery"],["taxMinor",`${config.checkout.taxLabel}${quote.totals.taxInclusive?" (included)":""}`],["totalMinor","Total"]].map(([k,label])=><div key={k}><dt>{label}</dt><dd>{k==="discountMinor"?"-":""}{formatMoney(quote.totals[k],quote.totals.currency)}</dd></div>)}
            </dl>
            <details className={css.reviewItems}><summary>Items & delivery · {quote.lines.length} {quote.lines.length===1?"item":"items"}</summary><p>{form.customerName} · {form.customerPhone}</p>{quote.lines.map((l,i)=><p key={i}>{l.quantity} × {l.name} — {formatMoney(l.unitMinor*l.quantity,quote.totals.currency)}</p>)}<p>{quote.delivery.name}{quote.delivery.estimate?` · ${quote.delivery.estimate}`:""}</p></details>
            {quote.delivery.unconfigured&&<p className={css.transferNote}>Any delivery charges must be arranged with the store separately.</p>}
          </section>
        )}
        {step === "proof" && <section ref={reviewRef} tabIndex={-1} className={css.proofPanel}><h3>Upload your transfer receipt</h3><p>{store.name} will review your payment before confirming the order.</p><label className={css.proofPicker}><Copy size={24}/><strong>{proofFile?proofFile.name:"Choose payment proof"}</strong><span>JPG, PNG or WebP · up to 5 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>{const file=event.target.files?.[0];if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setError("Choose a JPG, PNG or WebP image smaller than 5 MB.");event.target.value="";return;}setProofFile(file);uploadedProof.current="";setProofUploaded(false);setUploadPercent(0);setError("");}}/></label><p className={css.transferNote}>Make sure the amount, date and transaction reference are readable.</p></section>}
        {step === "done" && done && (
          <section className={css.confirmationCard}>
            <div className={css.confirmationIcon}><CheckCircle2 size={32}/></div>
            <span className={css.pendingBadge}>Pending confirmation</span>
            <h2>{form.paymentMethod==="bank"?"Your proof is received":"Your order is received"}</h2>
            <p>{form.paymentMethod==="bank"?"Your order is pending while the store confirms your payment.":"The store will confirm your order and payment."}</p>
            <dl className={css.confirmationDetails}><div><dt>Order code</dt><dd>{done.orderNumber}</dd></div><div><dt>Total</dt><dd>{formatMoney(done.totals.totalMinor,done.totals.currency)}</dd></div></dl>
            {config.notifications?.email&&form.customerEmail&&<p className={css.confirmationEmail}>You’ll receive an email when the store confirms your order.</p>}
            {onAccount&&<Button onClick={()=>{onClose();onAccount();}}>View my orders</Button>}
            <a className={css.trackOrder} href={`/v1-1/store-receipt/${encodeURIComponent(store.slug)}?token=${encodeURIComponent(done.receiptToken)}`}>Track this order</a>
            {form.paymentMethod!=="bank"&&whats&&<a className={css.whatsapp} href={`https://wa.me/${whats}?text=${encodeURIComponent(summary)}`} target="_blank" rel="noreferrer"><FaWhatsapp/> Send order on WhatsApp</a>}
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
