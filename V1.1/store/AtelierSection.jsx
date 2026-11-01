import { storeImageSrcSet } from "./storeMedia";
import { useState } from "react";
import {
  Truck,
  ShieldCheck,
  Heart,
  CheckCircle2,
  Leaf,
  Star,
  ArrowUpRight,
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { apiRequest } from "../lib/api";
import styles from "./AtelierStore.module.css";
const icons = {
  truck: Truck,
  shield: ShieldCheck,
  heart: Heart,
  check: CheckCircle2,
  leaf: Leaf,
  star: Star,
};
export default function AtelierSection({
  section: s,
  store,
  content,
  whatsapp,
  collections = [],
  reviews = [],
  preview = false,
  config = {},
  onCollection,
  productGrid,
  products = [],
  sectionProducts = {},
}) {
  const [email, setEmail] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const v = s.settings || {},
    action =
      v.ctaType === "whatsapp"
        ? whatsapp
        : v.ctaType === "link"
          ? v.ctaUrl
          : v.ctaType === "collection"
            ? `?collection=${encodeURIComponent(v.ctaUrl || "")}#atelier-products`
            : "#atelier-products";
  const cta =
    v.ctaLabel && action ? (
      <a
        className={`${styles.cta} ${s.type === "hero" && v.buttonStyle !== "brand" ? styles.heroLightButton : ""}`}
        href={action}
        onClick={
          v.ctaType === "collection" && onCollection
            ? (e) => {
                e.preventDefault();
                onCollection(v.ctaUrl);
              }
            : undefined
        }
      >
        {v.ctaType === "whatsapp" && <FaWhatsapp />}
        {v.ctaLabel}
      </a>
    ) : null;
  if (s.type === "hero")
    return (
      <section
        data-store-section={s.id}
        className={`${styles.hero} ${styles[v.height || "medium"]}`}
        style={{
          textAlign: v.alignment || "center",
          alignItems: ({top:"flex-start",center:"center",bottom:"flex-end"})[v.verticalPosition||"bottom"],
          "--hero-overlay": (v.overlay ?? 25) / 100,
          "--hero-text": v.textColour || "#fff",
          "--hero-focus": `${v.focalX ?? 50}% ${v.focalY ?? 50}%`,
        }}
      >
        {v.video ? (
          <video
            className={styles.heroMedia}
            src={v.video}
            poster={s.image || undefined}
            controls
            playsInline
            preload="none"
          />
        ) : s.image ? (
          <picture>
            <source
              media="(max-width:700px)"
              srcSet={
                storeImageSrcSet(v.mobileImage || s.image) ||
                v.mobileImage ||
                s.image
              }
              sizes="100vw"
            />
            <img
              className={styles.heroMedia}
              src={s.image}
              srcSet={storeImageSrcSet(s.image)}
              sizes="100vw"
              alt={v.alt || ""}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        ) : null}
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <h1>{content(s.title) || store.name}</h1>
          {content(s.text) && <p>{content(s.text)}</p>}
          {cta}
        </div>
      </section>
    );
  if (["new-arrivals", "best-sellers", "featured"].includes(s.type)) {
    const source = sectionProducts[s.type] || products;
    const list =
      s.type === "best-sellers"
        ? source.filter((p) => p.sales > 0).sort((a, b) => b.sales - a.sales)
        : s.type === "new-arrivals"
          ? [...source].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )
          : source.filter((p) => p.featured || s.productIds.includes(p._id));
    if (!list.length) return null;
    return (
      <section className={styles.catalogue} data-store-section={s.id}>
        <div className={styles.intro}>
          <h2>{content(s.title) || s.type.replaceAll("-", " ")}</h2>
          <p>{content(s.text)}</p>
        </div>
        {productGrid(list.slice(0, v.limit || 8))}
      </section>
    );
  }
  if (s.type === "collections")
    return collections.length ? (
      <section className={styles.catalogue} data-store-section={s.id}>
        <div className={styles.intro}>
          <h2>{content(s.title) || "Shop collections"}</h2>
        </div>
        <div className={styles.collectionGrid}>
          {collections.map((c) => (
            <a
              key={c._id}
              href={`?collection=${encodeURIComponent(c.slug)}#atelier-products`}
              onClick={
                onCollection
                  ? (e) => {
                      e.preventDefault();
                      onCollection(c.slug);
                    }
                  : undefined
              }
            >
              {c.image && (
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <h3>
                {c.name} <ArrowUpRight size={15} />
              </h3>
              {c.description && <p>{c.description}</p>}
            </a>
          ))}
        </div>
      </section>
    ) : null;
  if (["promotion", "about"].includes(s.type))
    return (
      <section
        className={styles.promotion}
        style={{ textAlign: v.alignment }}
        data-store-section={s.id}
      >
        {s.image && (
          <img
            src={s.image}
            srcSet={storeImageSrcSet(s.image)}
            sizes="100vw"
            alt={v.alt || ""}
            loading="lazy"
          />
        )}
        <div>
          <h2>{content(s.title)}</h2>
          <p>{content(s.text)}</p>
          {cta}
        </div>
      </section>
    );
  if (s.type === "gallery")
    return (
      <section className={styles.catalogue} data-store-section={s.id}>
        <div className={styles.intro}>
          <h2>{content(s.title)}</h2>
          <p>{content(s.text)}</p>
        </div>
        <div className={styles.collectionGrid}>
          {s.items
            .filter((i) => i.image)
            .map((item, index) => (
              <figure key={index}>
                <img
                  src={item.image}
                  alt={item.alt || item.title || ""}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  {item.title}
                  {item.text && <p>{item.text}</p>}
                </figcaption>
              </figure>
            ))}
        </div>
      </section>
    );
  if (s.type === "benefits")
    return (
      <section className={styles.benefits} data-store-section={s.id}>
        {s.items.map((item, index) => {
          const Icon = icons[item.icon] || CheckCircle2;
          return (
            <div key={index}>
              <Icon size={25} strokeWidth={1.5} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          );
        })}
      </section>
    );
  if (s.type === "reviews")
    return reviews.length ? (
      <section className={styles.story} data-store-section={s.id}>
        <h2>{content(s.title) || "From our customers"}</h2>
        <div className={styles.collectionGrid}>
          {reviews.map((r) => (
            <blockquote key={r._id}>
              <span aria-label={`${r.rating} out of 5 stars`}>
                {"★".repeat(r.rating)}
              </span>
              <p>{r.text}</p>
              <footer>
                {r.name}
                {r.verified ? " · Verified purchase" : ""}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    ) : null;
  if (s.type === "newsletter")
    return (
      <section className={styles.newsletter} data-store-section={s.id}>
        <h2>
          {content(s.title) ||
            config.marketing?.newsletterTitle ||
            "Stay in the loop"}
        </h2>
        <p>{content(s.text)}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (preview || busy) return;
            setBusy(true);
            try {
              await apiRequest(
                `/v1-1/store-studio/commerce/public/${encodeURIComponent(store.slug)}/leads`,
                {
                  token: null,
                  method: "POST",
                  body: JSON.stringify({ email, consent }),
                },
              );
              setMessage("You’re on the list. Thank you!");
              setEmail("");
            } catch (e) {
              setMessage(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.consent}>
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            {config.marketing?.consentText ||
              "I agree to receive updates from this store."}
          </label>
          <button className={`${styles.cta} ${s.type === "hero" && v.buttonStyle !== "brand" ? styles.heroLightButton : ""}`} disabled={preview || busy}>
            {busy ? "Joining…" : "Subscribe"}
          </button>
          {message && <p role="status">{message}</p>}
        </form>
      </section>
    );
  if (s.type === "contact") {
    const socialIcons = {
      instagram: FaInstagram,
      facebook: FaFacebook,
      tiktok: FaTiktok,
      youtube: FaYoutube,
    };
    return (
      <section
        className={styles.story}
        style={{ textAlign: v.alignment }}
        data-store-section={s.id}
      >
        <h2>{content(s.title) || "Let’s talk"}</h2>
        <p>{content(s.text)}</p>
        {store.address && <address>{store.address}</address>}
        {store.hours && <p>{store.hours}</p>}
        {cta ||
          (whatsapp && (
            <a className={`${styles.cta} ${s.type === "hero" && v.buttonStyle !== "brand" ? styles.heroLightButton : ""}`} href={whatsapp}>
              <FaWhatsapp /> Chat on WhatsApp
            </a>
          ))}
        <div className={styles.socials}>
          {Object.entries(store.socials || {})
            .filter(([, url]) => url)
            .map(([key, url]) => {
              const Icon = socialIcons[key] || ArrowUpRight;
              return (
                <a
                  href={url}
                  key={key}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={key}
                >
                  <Icon size={20} />
                </a>
              );
            })}
        </div>
      </section>
    );
  }
  return null;
}
