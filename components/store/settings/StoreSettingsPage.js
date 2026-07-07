"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Brush,
  Check,
  Copy,
  Eye,
  Globe,
  Image,
  Link2,
  MessageCircle,
  Palette,
  Save,
  Settings,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRef } from "react";
import { CheckCircle2, Info } from "lucide-react";

import DashboardHeader from "../dashboard/DashboardHeader";
import StoreMenu from "../dashboard/StoreMenu";
import Loader from "../Loader";
import styles from "./storeSettings.module.css";

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "branding", label: "Branding", icon: Image },
  { id: "payments", label: "Payments", icon: Banknote },
  { id: "experience", label: "Experience", icon: ShoppingCart },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "analytics", label: "Analytics", icon: Eye },
  { id: "domain", label: "Domain", icon: Globe },
];

export default function StoreSettingsPage() {
  const dnsRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [domainLoading, setDomainLoading] = useState(false);
  useEffect(() => {
    loadStore();
  }, []);

  const storeUrl = useMemo(() => {
    if (!store?.slug || typeof window === "undefined") return "";
    return `${window.location.origin}/s/${store.slug}`;
  }, [store?.slug]);

  const loadStore = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/store/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStore(res.data);
      setForm(res.data);
      setDomainInput(res.data.customDomain || "");
    } catch (err) {
      console.log(err);
      toast.error("Failed to load settings");
    }
  };
  const connectDomain = async () => {
    try {
      setDomainLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/store/custom-domain`,
        { domain: domainInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStore((prev) => ({ ...prev, ...res.data }));
      setTimeout(() => {
        dnsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
      setForm((prev) => ({ ...prev, ...res.data }));

      toast.success("Domain added. Add the DNS records below.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to connect domain");
    } finally {
      setDomainLoading(false);
    }
  };

  const verifyDomain = async () => {
    try {
      setDomainLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/store/custom-domain/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStore((prev) => ({ ...prev, ...res.data }));
      setForm((prev) => ({ ...prev, ...res.data }));

      toast.success("Domain verified");

      setStore((prev) => ({
        ...prev,
        customDomainStatus: "verified",
        customDomainVerifiedAt: new Date(),
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Domain not verified yet");
    } finally {
      setDomainLoading(false);
    }
  };

  const removeDomain = async () => {
    try {
      setDomainLoading(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/store/custom-domain`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDomainInput("");
      setStore((prev) => ({
        ...prev,
        customDomain: "",
        customDomainStatus: "none",
        customDomainToken: "",
      }));

      toast.success("Domain removed");
    } catch (err) {
      toast.error("Failed to remove domain");
    } finally {
      setDomainLoading(false);
    }
  };
  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success("Store link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const save = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/store/${store._id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStore(res.data);
      setForm(res.data);
      toast.success("Settings updated");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  const deleteStore = async () => {
    if (deleteText !== "DELETE") return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/store/${store._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Store deleted");

      window.location.href = "/dashboard";
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete store");
    } finally {
      setDeleting(false);
    }
  };

  const buttonTextWords = (form.addToCartButtonText || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const handleButtonTextChange = (value) => {
    const words = value.trim().split(/\s+/).filter(Boolean);

    if (words.length > 5) {
      toast.error("Button text cannot be more than 5 words");
      return;
    }

    update("addToCartButtonText", value);
  };
  if (!store) return <Loader />;
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Could not copy");
    }
  };
  const normalizeDomainInput = (value) =>
    String(value || "")
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
      .trim()
      .toLowerCase();

  const domainAlreadyConnected =
    store?.customDomain &&
    normalizeDomainInput(domainInput) === store.customDomain;
  return (
    <>
      <StoreMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        store={store}
      />

      <div className={styles.headerWrap}>
        <DashboardHeader store={store} onMenu={() => setMenuOpen(true)} />
      </div>

      <main className={styles.page}>
        <header className={styles.hero}>
          <div>
            <span>Store settings</span>
            <h1>Settings</h1>
            <p>
              Manage your storefront, payment details, customer experience, and
              brand appearance.
            </p>
          </div>
        </header>

        <section className={styles.layout}>
          <aside className={styles.sideNav}>
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={
                    activeSection === section.id ? styles.activeNav : ""
                  }
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={15} />
                  {section.label}
                </button>
              );
            })}
          </aside>

          <div className={styles.content}>
            {activeSection === "general" && (
              <>
                <section className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <h2>Store information</h2>
                      <p>Basic details customers see across your storefront.</p>
                    </div>
                    <BadgeCheck size={18} />
                  </div>

                  <div className={styles.grid}>
                    <label className={styles.field}>
                      <span>Store name</span>
                      <input
                        value={form.name || ""}
                        placeholder="Store name"
                        onChange={(e) => update("name", e.target.value)}
                      />
                    </label>

                    <label className={styles.field}>
                      <span>Phone number</span>
                      <input
                        value={form.phone || ""}
                        placeholder="Store phone"
                        onChange={(e) => update("phone", e.target.value)}
                      />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span>Email address</span>
                    <input
                      value={form.email || ""}
                      placeholder="Store email"
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>WhatsApp number</span>
                    <input
                      value={form.whatsappNumber || form.phone || ""}
                      placeholder="2348012345678"
                      onChange={(e) => update("whatsappNumber", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Description</span>
                    <textarea
                      value={form.description || ""}
                      placeholder="Tell customers what your store sells"
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </label>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <h2>Store link</h2>
                      <p>Share this link with customers.</p>
                    </div>
                    <Link2 size={18} />
                  </div>

                  <div className={styles.urlBox}>
                    <Globe size={16} />
                    <span>{storeUrl}</span>
                    <button type="button" onClick={copyUrl}>
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <h2>Visibility</h2>
                      <p>Control whether customers can access your store.</p>
                    </div>
                    <Eye size={18} />
                  </div>

                  <label className={styles.switchRow}>
                    <div>
                      <strong>Publish store</strong>
                      <span>Make your storefront visible to customers.</span>
                    </div>

                    <input
                      type="checkbox"
                      checked={Boolean(form.isPublished)}
                      onChange={(e) => update("isPublished", e.target.checked)}
                    />
                  </label>
                </section>
              </>
            )}

            {activeSection === "branding" && (
              <section className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h2>Branding</h2>
                    <p>
                      Upload a logo and banner to make your store feel familiar.
                    </p>
                  </div>
                  <Sparkles size={18} />
                </div>

                <div className={styles.mediaGrid}>
                  <div className={styles.mediaBox}>
                    <span>Store logo</span>
                    {form.logo ? (
                      <img
                        src={form.logo}
                        alt="Store logo"
                        className={styles.logo}
                      />
                    ) : (
                      <div className={styles.placeholder}>Logo</div>
                    )}
                    <button type="button">Upload logo</button>
                  </div>

                  <div className={styles.mediaBox}>
                    <span>Store banner</span>
                    {form.banner ? (
                      <img
                        src={form.banner}
                        alt="Store banner"
                        className={styles.banner}
                      />
                    ) : (
                      <div className={styles.placeholder}>Banner</div>
                    )}
                    <button type="button">Upload banner</button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "payments" && (
              <section className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h2>Payment details</h2>
                    <p>
                      Customers will use this bank information during checkout.
                    </p>
                  </div>
                  <Banknote size={18} />
                </div>

                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span>Bank name</span>
                    <input
                      value={form.bankName || ""}
                      placeholder="Bank name"
                      onChange={(e) => update("bankName", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Account number</span>
                    <input
                      value={form.accountNumber || ""}
                      placeholder="Account number"
                      onChange={(e) => update("accountNumber", e.target.value)}
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span>Account name</span>
                  <input
                    value={form.accountName || ""}
                    placeholder="Account name"
                    onChange={(e) => update("accountName", e.target.value)}
                  />
                </label>
              </section>
            )}

            {activeSection === "experience" && (
              <>
                <section className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <h2>Customer experience</h2>
                      <p>Choose what customers can do on your storefront.</p>
                    </div>
                    <ShoppingCart size={18} />
                  </div>

                  <label className={styles.switchRow}>
                    <div>
                      <strong>Enable shopping cart</strong>
                      <span>Let customers add products and checkout.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(form.enableCart)}
                      onChange={(e) => update("enableCart", e.target.checked)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Add to cart button text</span>

                    <input
                      value={form.addToCartButtonText || ""}
                      placeholder="Leave empty for default"
                      onChange={(e) => handleButtonTextChange(e.target.value)}
                    />

                    <small>
                      {buttonTextWords.length}/5 words. Default is BUY NOW for
                      digital products and ADD TO CART for physical products.
                    </small>
                  </label>
                  <label className={styles.switchRow}>
                    <div>
                      <strong>Show related products</strong>
                      <span>Recommend similar products on product pages.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(form.showRelatedProducts)}
                      onChange={(e) =>
                        update("showRelatedProducts", e.target.checked)
                      }
                    />
                  </label>

                  <label className={styles.switchRow}>
                    <div>
                      <strong>Show WhatsApp button</strong>
                      <span>
                        Allow customers to contact you from product pages.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(form.showWhatsappButton)}
                      onChange={(e) =>
                        update("showWhatsappButton", e.target.checked)
                      }
                    />
                  </label>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      <h2>WhatsApp</h2>
                      <p>Used for customer questions and quick support.</p>
                    </div>
                    <MessageCircle size={18} />
                  </div>
                </section>
              </>
            )}

            {activeSection === "appearance" && (
              <section className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h2>Appearance</h2>
                    <p>Keep your store design simple and consistent.</p>
                  </div>
                  <Brush size={18} />
                </div>

                <div className={styles.themeGrid}>
                  {["default", "minimal", "dark"].map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      className={form.theme === theme ? styles.activeTheme : ""}
                      onClick={() => update("theme", theme)}
                    >
                      <Check size={14} />
                      {theme}
                    </button>
                  ))}
                </div>

                <label className={styles.colorRow}>
                  <div>
                    <strong>Brand color</strong>
                    <span>Used for highlights and buttons.</span>
                  </div>

                  <input
                    type="color"
                    value={form.primaryColor || "#7c3aed"}
                    onChange={(e) => update("primaryColor", e.target.value)}
                  />
                </label>
              </section>
            )}

            {activeSection === "analytics" && (
              <section className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h2>Store analytics</h2>
                    <p>A quick snapshot of your storefront performance.</p>
                  </div>
                  <Eye size={18} />
                </div>

                <div className={styles.stats}>
                  <div>
                    <strong>{store.views || 0}</strong>
                    <span>Views</span>
                  </div>

                  <div>
                    <strong>{store.orders || 0}</strong>
                    <span>Orders</span>
                  </div>

                  <div>
                    <strong>
                      ₦{Number(store.revenue || 0).toLocaleString()}
                    </strong>
                    <span>Revenue</span>
                  </div>
                </div>
              </section>
            )}
            {activeSection === "domain" && (
              <section className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <h2>Custom domain</h2>
                    <p>Connect a domain you already own to your storefront.</p>
                  </div>
                  <Globe size={18} />
                </div>

                <label className={styles.field}>
                  <span>Your domain</span>
                  <input
                    value={domainInput}
                    placeholder="example.com"
                    onChange={(e) => setDomainInput(e.target.value)}
                  />
                </label>

                <div className={styles.domainActions}>
                  <button
                    type="button"
                    onClick={connectDomain}
                    disabled={domainLoading || domainAlreadyConnected}
                  >
                    {domainAlreadyConnected
                      ? "Domain connected"
                      : domainLoading
                        ? "Connecting..."
                        : "Connect domain"}
                  </button>

                  {store.customDomain && (
                    <button
                      type="button"
                      onClick={verifyDomain}
                      disabled={domainLoading}
                    >
                      Verify DNS
                    </button>
                  )}

                  {store.customDomain && (
                    <button
                      type="button"
                      onClick={removeDomain}
                      disabled={domainLoading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {store.customDomain && (
                  <div ref={dnsRef} className={styles.dnsBox}>
                    <div className={styles.dnsHeader}>
                      <div>
                        <h3>DNS records to add</h3>
                        <p>
                          Add these records inside your domain registrar DNS
                          settings.
                        </p>
                      </div>

                      <span
                        className={`${styles.statusBadge} ${
                          store?.customDomainStatus === "verified"
                            ? styles.statusVerified
                            : ""
                        }`}
                      >
                        {store?.customDomainStatus === "verified"
                          ? "Verified"
                          : "Pending"}
                      </span>
                    </div>

                    <div className={styles.instructionBox}>
                      <Info size={16} />

                      <div>
                        <strong>How to connect your domain</strong>
                        <p>
                          Open your domain provider, go to DNS settings, add the
                          TXT, CNAME and A records below records below, then
                          come back and click Verify DNS.
                        </p>
                      </div>
                    </div>

                    <div className={styles.recordCard}>
                      <span className={styles.recordType}>TXT</span>

                      <div className={styles.recordRow}>
                        <div>
                          <small>Host</small>
                          <strong>_mytiklink.{store?.customDomain}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            copyText(`_mytiklink.${store?.customDomain}`)
                          }
                          className={styles.copyBtn}
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <div className={styles.recordRow}>
                        <div>
                          <small>Value</small>
                          <strong>{store?.customDomainToken}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText(store?.customDomainToken)}
                          className={styles.copyBtn}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.recordCard}>
                      <span className={styles.recordType}>CNAME</span>

                      <div className={styles.recordRow}>
                        <div>
                          <small>Host</small>
                          <strong>www</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText("www")}
                          className={styles.copyBtn}
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <div className={styles.recordRow}>
                        <div>
                          <small>Value</small>
                          <strong>custom.mytiklink.com</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText("custom.mytiklink.com")}
                          className={styles.copyBtn}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.recordCard}>
                      <span className={styles.recordType}>A RECORD</span>

                      <div className={styles.recordRow}>
                        <div>
                          <small>Host</small>
                          <strong>@</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText("@")}
                          className={styles.copyBtn}
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <div className={styles.recordRow}>
                        <div>
                          <small>Value</small>
                          <strong>76.76.21.21</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText("76.76.21.21")}
                          className={styles.copyBtn}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    <p className={styles.dnsNote}>
                      DNS changes can take a few minutes to a few hours. After
                      adding the records, click Verify DNS.
                    </p>
                  </div>
                )}
              </section>
            )}
            <button className={styles.saveTop} onClick={save} disabled={saving}>
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={15} />
                  Save
                </>
              )}
            </button>
            <section className={styles.danger}>
              <div>
                <AlertTriangle size={18} />
                <div>
                  <h2>Danger zone</h2>
                  <p>
                    Delete store is disabled for now to protect your products
                    and orders.
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={14} />
                Delete store
              </button>
            </section>
          </div>
        </section>
      </main>
      {deleteOpen && (
        <div className={styles.deleteOverlay}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteIcon}>
              <AlertTriangle size={22} />
            </div>

            <h2>Delete store?</h2>

            <p>
              This will permanently delete your store, products, orders, and
              storefront data. This action cannot be undone.
            </p>

            <div className={styles.confirmBox}>
              <span>
                Type <strong>DELETE</strong> to confirm
              </span>

              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className={styles.deleteActions}>
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteText("");
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmDelete}
                onClick={deleteStore}
                disabled={deleteText !== "DELETE" || deleting}
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
