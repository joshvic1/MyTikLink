import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUpRight,
  RefreshCw,
  Download,
  Check,
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
const split = (v) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export function CommerceSettingsPanel({ tab, setup = {}, onDirtyChange }) {
  const [config, setConfig] = useState(null),
    [saved, setSaved] = useState(null),
    [revision, setRevision] = useState(0),
    [history, setHistory] = useState([]),
    [capabilities, setCapabilities] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [entry, setEntry] = useState(null),
    [discard, setDiscard] = useState(false);
  const lock = useRef(false);
  const load = async () => {
    const d = await apiRequest(`${root}/config`);
    const loadedConfig={...d.config,identity:{showFloatingWhatsapp:true,showRecommendations:true,...d.config.identity}};
    setConfig(loadedConfig);
    setSaved(loadedConfig);
    setRevision(d.revision);
    setHistory(d.history);
    setCapabilities(d.capabilities);
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
  const save = async () => {
    const d = await apiRequest(`${root}/config`, {
      method: "PUT",
      body: JSON.stringify({ config, revision }),
    });
    const loadedConfig={...d.config,identity:{showFloatingWhatsapp:true,showRecommendations:true,...d.config.identity}};
    setConfig(loadedConfig);
    setSaved(loadedConfig);
    setRevision(d.revision);
    return d.revision;
  };
  const action = async (publish) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const rev = dirty || revision === 0 ? await save() : revision;
      if (publish) {
        const d = await apiRequest(`${root}/publish`, {
          method: "POST",
          body: JSON.stringify({ revision: rev }),
        });
        setRevision(d.revision);
      }
      notify.success(
        publish ? "Store settings published" : "Settings draft saved",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  if (!config)
    return (
      <p role={error ? "alert" : "status"}>{error || "Loading settings…"}</p>
    );
  const text = (group, key, label, type = "text", hint = "") => (
    <Field key={`${group}-${key}`} label={label} hint={hint}>
      {type === "textarea" ? (
        <textarea
          rows={4}
          value={config[group][key] || ""}
          onChange={(e) => set(group, key, e.target.value)}
        />
      ) : (
        <input
          type={type}
          value={config[group][key] ?? ""}
          placeholder={setup[key] || ""}
          onChange={(e) =>
            set(
              group,
              key,
              type === "number" ? Number(e.target.value) : e.target.value,
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
        onChange={(e) => set(group, key, e.target.checked)}
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
  const remove = (kind, index) =>
    set(
      "delivery",
      kind,
      config.delivery[kind].filter((_, i) => i !== index),
    );
  return (
    <>
      <div className={css.panelHeading}>
        <div>
          <h2>{tab}</h2>
          <p>Save a draft, then publish when you’re ready.</p>
        </div>
      </div>
      {tab === "Branding" && (
        <div className={css.form}>
          {text("identity", "name", "Brand name")}
          {text("identity", "description", "Store introduction", "textarea")}
          {text("identity", "phone", "WhatsApp number")}
          {text("identity", "email", "Contact email", "email")}
          {text("identity", "address", "Store address", "textarea")}
          {text("identity", "hours", "Opening hours", "textarea")}
          {check("identity", "showPhone", "Show contact number")}
          {check("identity", "showEmail", "Show contact email")}
          {check("identity", "showFloatingWhatsapp", "Show floating WhatsApp button")}
          {check("identity", "showRecommendations", "Show You may also like on product pages")}
          {Object.keys(config.identity.socials).map((key) => (
            <Field label={`${key} link`} key={key}>
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
        <>
          <p>
            Add specific zones before broader ones by giving them a higher
            priority. Country values use two-letter codes, for example NG.
          </p>
          {[
            ["zones", "Delivery zones"],
            ["pickups", "Pickup locations"],
          ].map(([kind, label]) => (
            <section key={kind}>
              <div className={css.panelHeading}>
                <h3>{label}</h3>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setEntry({
                      kind,
                      index: -1,
                      value:
                        kind === "zones"
                          ? {
                              id: crypto.randomUUID(),
                              name: "",
                              countries: ["NG"],
                              states: [],
                              cities: [],
                              postcodes: [],
                              priority: 0,
                              feeMinor: 0,
                              freeAboveMinor: null,
                              estimate: "",
                              enabled: true,
                              excluded: false,
                            }
                          : {
                              id: crypto.randomUUID(),
                              name: "",
                              address: "",
                              hours: "",
                              instructions: "",
                              enabled: true,
                            },
                    })
                  }
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className={css.categoryList}>
                {config.delivery[kind].map((v, index) => (
                  <article key={v.id}>
                    <div>
                      <strong>{v.name}</strong>
                      <small>
                        {kind === "zones"
                          ? `${v.excluded ? "Excluded" : money(v.feeMinor)} · ${v.countries.join(", ")}`
                          : v.address}
                      </small>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setEntry({ kind, index, value: v })}
                    >
                      Edit
                    </Button>
                    <button
                      aria-label={`Remove ${v.name}`}
                      onClick={() => remove(kind, index)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </article>
                ))}
              </div>
              {!config.delivery[kind].length && (
                <p>No {label.toLowerCase()} yet.</p>
              )}
            </section>
          ))}
          {text("delivery", "instructions", "Delivery information", "textarea")}
        </>
      )}
      {tab === "Payments" && (
        <div className={css.form}>
          {method("bank", "Manual bank transfer")}
          {method("cod", "Cash on delivery")}
          {method("whatsapp", "Arrange payment on WhatsApp")}
          <p className={css.note}>
            Bank payments stay pending until you confirm receipt. Online
            provider payments are not connected to this store.
          </p>
          <a
            href="/v1-1/store/settings?tab=bank"
            className={css.textLink}
            onClick={(e) => {
              e.preventDefault();
              setEntry({
                kind: "bank",
                value: {
                  name: setup.name,
                  phone: setup.phone,
                  category: setup.category,
                  businessType: setup.businessType,
                  bankName: setup.bankName || "",
                  accountName: setup.accountName || "",
                  accountNumber: setup.accountNumber || "",
                  address: setup.address,
                  description: setup.description,
                  showFeatured: setup.showFeatured,
                },
              });
            }}
          >
            Edit bank transfer details
          </a>
        </div>
      )}
      {tab === "Checkout" && (
        <div className={css.form}>
          <Field label="Currency">
            <select
              value={config.checkout.currency}
              onChange={(e) => set("checkout", "currency", e.target.value)}
            >
              {["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <p>
            Currency changes are blocked once your store has products or orders.
            Prices are never silently converted.
          </p>
          {check("checkout", "requireEmail", "Require an email address")}
          {check("checkout", "allowNotes", "Allow order notes")}
          <Field label="Tax rate (%)">
            <input
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
            These are your store’s policies. Review the wording before
            publishing.
          </p>
          <ReviewManager />
        </div>
      )}
      {tab === "SEO" && (
        <div className={css.form}>
          {text("seo", "title", "Search title")}
          {text("seo", "description", "Search description", "textarea")}
          <ImagePicker
            label="Social sharing image"
            value={config.seo.image}
            onChange={(v) => set("seo", "image", v)}
          />
          {check(
            "seo",
            "noindex",
            "Ask search engines not to index this store",
          )}
          <div className={css.note}>
            <strong>
              {config.seo.title || config.identity.name || setup.name}
            </strong>
            <p>
              {config.seo.description ||
                config.identity.description ||
                setup.description}
            </p>
          </div>
        </div>
      )}
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
      {tab === "Discounts" && (
        <>
          <p>
            One discount applies per order. A code replaces automatic offers;
            automatic offers use the best eligible saving.
          </p>
          <ResourceManager kind="discounts" />
        </>
      )}
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
          <h3>Published settings history</h3>
          {history.map((h) => (
            <Button
              variant="secondary"
              key={h.id}
              disabled={busy}
              onClick={async () => {
                try {
                  const d = await apiRequest(`${root}/restore`, {
                    method: "POST",
                    body: JSON.stringify({ revision, id: h.id }),
                  });
                  const loadedConfig={...d.config,identity:{showFloatingWhatsapp:true,showRecommendations:true,...d.config.identity}};
    setConfig(loadedConfig);
                  setSaved(loadedConfig);
                  setRevision(d.revision);
                  notify.success("Revision restored to draft");
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Restore {new Date(h.date).toLocaleString()}
            </Button>
          ))}
          {!history.length && (
            <p>
              Earlier published settings appear here after your next
              publication.
            </p>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className={css.error}>
          {error}
        </p>
      )}
      {!["Discounts", "Customers"].includes(tab) && (
        <footer className={css.saveBar}>
          <span>{dirty ? "Unsaved changes" : "Draft saved"}</span>
          <Button
            variant="secondary"
            disabled={busy || !dirty}
            onClick={() => setDiscard(true)}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            disabled={busy || !dirty}
            onClick={() => action(false)}
          >
            Save draft
          </Button>
          <Button disabled={busy} onClick={() => action(true)}>
            {busy ? "Saving…" : "Publish settings"}
          </Button>
        </footer>
      )}
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
      {entry && (
        <EntryEditor
          entry={entry}
          onClose={() => setEntry(null)}
          onSave={async (value) => {
            if (entry.kind === "bank") {
              await apiRequest("/v1-1/store-studio/settings", {
                method: "PATCH",
                body: JSON.stringify(value),
              });
              notify.success("Bank details saved");
            } else
              set(
                "delivery",
                entry.kind,
                entry.index < 0
                  ? [...config.delivery[entry.kind], value]
                  : config.delivery[entry.kind].map((v, i) =>
                      i === entry.index ? value : v,
                    ),
              );
            setEntry(null);
          }}
        />
      )}
    </>
  );
}
function EntryEditor({ entry, onClose, onSave }) {
  const [value, setValue] = useState(entry.value),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const set = (k, v) => setValue((s) => ({ ...s, [k]: v }));
  const field = (key, label, type = "text") => (
    <Field label={label} key={key}>
      <input
        type={type}
        value={value[key] ?? ""}
        onChange={(e) =>
          set(key, type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </Field>
  );
  return (
    <Modal
      title={
        entry.kind === "zones"
          ? "Delivery zone"
          : entry.kind === "bank"
            ? "Bank transfer details"
            : "Pickup location"
      }
      onClose={() => !busy && onClose()}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="store-entry" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form
        id="store-entry"
        className={css.form}
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setBusy(true);
          try {
            await onSave(value);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {entry.kind === "bank" ? (
          ["bankName", "accountName", "accountNumber"].map((k) =>
            field(
              k,
              {
                bankName: "Bank name",
                accountName: "Account holder",
                accountNumber: "Account number",
              }[k],
            ),
          )
        ) : (
          <>
            {field("name", "Name")}
            {entry.kind === "zones" ? (
              <>
                {["countries", "states", "cities", "postcodes"].map((k) => (
                  <Field label={`${k} (comma-separated)`} key={k}>
                    <input
                      defaultValue={value[k].join(", ")}
                      onBlur={(e) => set(k, split(e.target.value))}
                    />
                  </Field>
                ))}
                {field("priority", "Priority", "number")}
                <Field label="Delivery fee">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={money(value.feeMinor)}
                    onChange={(e) => set("feeMinor", minor(e.target.value))}
                  />
                </Field>
                <Field label="Free delivery above (optional)">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={
                      value.freeAboveMinor === null
                        ? ""
                        : money(value.freeAboveMinor)
                    }
                    onChange={(e) =>
                      set(
                        "freeAboveMinor",
                        e.target.value === "" ? null : minor(e.target.value),
                      )
                    }
                  />
                </Field>
                {field("estimate", "Delivery estimate")}
                <label className={css.check}>
                  <input
                    type="checkbox"
                    checked={value.excluded}
                    onChange={(e) => set("excluded", e.target.checked)}
                  />{" "}
                  Exclude this zone
                </label>
              </>
            ) : (
              <>
                {field("address", "Address")}
                {field("hours", "Opening hours")}
                {field("instructions", "Pickup instructions")}
              </>
            )}
            <label className={css.check}>
              <input
                type="checkbox"
                checked={value.enabled}
                onChange={(e) => set("enabled", e.target.checked)}
              />{" "}
              Enabled
            </label>
          </>
        )}
        {error && (
          <p role="alert" className={css.error}>
            {error}
          </p>
        )}
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
  useEffect(() => {
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
          }),
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
      <div className={css.panelHeading}>
        <h3>{kind === "collections" ? "Collections" : "Discount codes"}</h3>
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
function ResourceEditor({ kind, value, onClose, onSaved }) {
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
    [error, setError] = useState(""),
    [products, setProducts] = useState([]),
    [search, setSearch] = useState("");
  useEffect(() => {
    const c = new AbortController();
    const timer = setTimeout(
      () =>
        apiRequest(`/products/me?page=1&search=${encodeURIComponent(search)}`, {
          signal: c.signal,
        })
          .then((d) => setProducts(d.products || []))
          .catch(() => {}),
      250,
    );
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [search]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const field = (k, label, type = "text") => (
    <Field key={k} label={label}>
      <input
        type={type}
        value={form[k] ?? ""}
        onChange={(e) =>
          set(k, type === "number" ? Number(e.target.value) : e.target.value)
        }
      />
    </Field>
  );
  return (
    <Modal
      title={kind === "collections" ? "Edit collection" : "Edit discount"}
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
        {kind === "collections" ? (
          <>
            {field("name", "Collection name")}
            {field("slug", "URL slug")}
            {field("description", "Description")}
            <ImagePicker
              label="Collection image"
              value={form.image}
              onChange={(v) => set("image", v)}
            />
            <Field label="Products to include">
              <select
                value={form.mode}
                onChange={(e) => set("mode", e.target.value)}
              >
                <option value="manual">Selected products</option>
                <option value="new">Added in the last 30 days</option>
                <option value="sale">Products on sale</option>
                <option value="price">Products below a price</option>
              </select>
            </Field>
            {form.mode === "price" && (
              <Field label="Price ceiling">
                <input
                  type="number"
                  step="0.01"
                  value={money(form.priceUnderMinor)}
                  onChange={(e) =>
                    set("priceUnderMinor", minor(e.target.value))
                  }
                />
              </Field>
            )}
            {field("sortOrder", "Display order", "number")}
            <label className={css.check}>
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => set("visible", e.target.checked)}
              />{" "}
              Show collection
            </label>
          </>
        ) : (
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
                <input
                  type="number"
                  step="0.01"
                  value={money(form.value)}
                  onChange={(e) => set("value", minor(e.target.value))}
                />
              </Field>
            )}
            <Field label="Minimum order">
              <input
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
        )}
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
        {(kind === "discounts" || form.mode === "manual") && (
          <fieldset>
            <legend>
              {kind === "discounts"
                ? "Eligible products (optional)"
                : "Select products"}
            </legend>
            <input
              aria-label="Search products to include"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {products.map((p) => (
              <label key={p._id} className={css.check}>
                <input
                  type="checkbox"
                  checked={form.productIds.includes(p._id)}
                  onChange={(e) =>
                    set(
                      "productIds",
                      e.target.checked
                        ? [...form.productIds, p._id]
                        : form.productIds.filter((id) => id !== p._id),
                    )
                  }
                />
                {p.name}
              </label>
            ))}
            <small>{form.productIds.length} selected</small>
          </fieldset>
        )}
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
      <h3>Customer reviews</h3>
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
      <h3>Last 30 days</h3>
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
      <h3>Image processing</h3>
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
