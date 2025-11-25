// components/EditRedirectModal.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RotateCw,
  Lock,
} from "lucide-react";
import styles from "@/styles/EditModal.module.css";

/**
 * Props:
 *  - link (object)
 *  - setShowModal(fn)
 *  - onUpdated(fn) -> refresh list after save
 *  - userPlan (string) e.g. "free", "standard_monthly", "pro_monthly"
 */
export default function EditRedirectModal({
  link,
  setShowModal,
  onUpdated,
  userPlan = "free",
}) {
  const sheetRef = useRef(null);
  const dragZoneRef = useRef(null);

  const isPro = String(userPlan || "")
    .toLowerCase()
    .includes("pro");

  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(true);
  const [showPreviewForTplId, setShowPreviewForTplId] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");

  // form state
  const [title, setTitle] = useState(link?.title || "");
  const [linkType, setLinkType] = useState(link?.linkType || "dm");
  const [whatsInput, setWhatsInput] = useState(
    String(link?.whatsappCode || "")
  );
  const [prefill, setPrefill] = useState(link?.prefill || "");
  const [selectedTplId, setSelectedTplId] = useState(
    link?.templateId?._id || link?.templateId || null
  );
  const [slug, setSlug] = useState(link?.linkId || "");
  const [submitting, setSubmitting] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "";
  const PREVIEW_BASE = API.replace(/\/api\/?$/i, "") || "http://localhost:5000";

  useEffect(() => {
    const parsed = parseWhatsAppCode(whatsInput);

    // If switching to DM → ensure number format
    if (linkType === "dm" && parsed.type === "group") {
      setWhatsInput("");
      setPrefill("");
    }

    // If switching to Group → ensure group code format
    if (linkType === "group" && parsed.type === "dm") {
      setWhatsInput("");
    }
  }, [linkType]);

  // DRAG to close (mobile)
  useEffect(() => {
    const zone = dragZoneRef.current;
    const sheet = sheetRef.current;
    if (!zone || !sheet) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;

    const onStart = (e) => {
      dragging = true;
      startY = e.touches?.[0]?.clientY || e.clientY;
      sheet.style.transition = "none";
    };
    const onMove = (e) => {
      if (!dragging) return;
      currentY = (e.touches?.[0]?.clientY || e.clientY) - startY;
      if (currentY > 0) sheet.style.transform = `translateY(${currentY}px)`;
    };
    const onEnd = () => {
      dragging = false;
      sheet.style.transition = "";
      if (currentY > 120) {
        sheet.style.transform = "translateY(100%)";
        setTimeout(() => setShowModal(false), 180);
      } else {
        sheet.style.transform = "";
      }
      currentY = 0;
    };

    zone.addEventListener("touchstart", onStart);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
    zone.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    return () => {
      zone.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      zone.removeEventListener("mousedown", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [setShowModal]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setTplLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/templates`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!mounted) return;

        setTemplates(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load templates:", e);
      } finally {
        if (mounted) setTplLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [API]);

  // sanitize slug helper
  const sanitizeSlug = (v) =>
    (v || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  const onChangeSlug = (v) => setSlug(sanitizeSlug(v));

  // parse input helper
  const parseWhatsAppCode = (input) => {
    let type = "dm";
    let code = String(input || "").trim();
    const base = code.split("?")[0];
    if (base.includes("chat.whatsapp.com")) {
      const parts = base.split("/");
      code = parts[parts.length - 1];
      type = "group";
    } else if (base.includes("wa.me/")) {
      const parts = base.split("/");
      code = parts[parts.length - 1];
      type = "dm";
    } else if (code.includes("send?phone=")) {
      const m = code.match(/phone=(\d+)/);
      if (m) code = m[1];
      type = "dm";
    } else if (/^[A-Za-z0-9]{20,25}$/.test(code)) {
      type = "group";
    } else if (/^\+?\d+$/.test(code)) {
      code = code.replace(/\D/g, "");
      type = "dm";
    }
    return { code, type };
  };

  // build preview URL (adds preview=1 so backend can render safe preview)
  const buildPreviewURL = (tplId) => {
    if (!tplId || !title.trim()) return "";
    const params = new URLSearchParams({
      templateId: tplId,
      title: title.trim(),
      type: linkType,
      plan: "pro",
      preview: "1", // <--- tell backend to not include redirect code OR use sandbox
    });

    if (linkType === "dm") {
      const phone = parseWhatsAppCode(whatsInput).code || "";
      if (!phone) return "";
      params.set("phone", phone);
      if (prefill) params.set("text", prefill);
    } else {
      if (!whatsInput.trim()) return "";
      params.set("group", whatsInput.trim());
    }

    return `${PREVIEW_BASE}/templates/preview?${params.toString()}`;
  };

  const openLivePreview = (tpl) => {
    setShowPreviewForTplId(tpl._id);
    setPreviewSrc(buildPreviewURL(tpl._id));
  };
  const closeLivePreview = () => {
    setShowPreviewForTplId(null);
    setPreviewSrc("");
  };

  const canNext = () => {
    if (step === 0) return !!title.trim();
    if (step === 1) {
      const parsed = parseWhatsAppCode(whatsInput);
      return linkType === "dm"
        ? parsed.type === "dm" && !!parsed.code
        : parsed.type === "group" && !!parsed.code;
    }
    if (step === 2) return !!selectedTplId;
    return true;
  };

  // save update -> calls backend PUT /api/links/:linkId
  const handleSave = async () => {
    if (!title.trim()) return toast.error("Please add a title.");
    const parsed = parseWhatsAppCode(whatsInput);
    if (linkType === "dm" && parsed.type !== "dm")
      return toast.error("Enter a valid WhatsApp number.");
    if (linkType === "group" && parsed.type !== "group")
      return toast.error("Enter a valid group invite code or link.");
    if (!selectedTplId) return toast.error("Select a template.");

    const finalSlug = isPro ? slug || link.linkId : link.linkId;
    const payload = {
      title: title.trim(),
      linkType,
      whatsappCode: parsed.code,
      prefill: linkType === "dm" ? prefill || "" : "",
      templateId: selectedTplId,
      linkId: finalSlug,
    };
    const noChanges =
      title.trim() === link.title &&
      linkType === link.linkType &&
      parseWhatsAppCode(whatsInput).code === link.whatsappCode &&
      (linkType === "dm" ? prefill === link.prefill : true) &&
      selectedTplId === (link.templateId?._id || link.templateId) &&
      slug === link.linkId;

    if (noChanges) {
      toast.error("You did not edit anything.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API}/links/${link.linkId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status >= 200 && res.status < 300) {
        toast.success("Updated successfully");
        onUpdated?.();
        setShowModal(false);
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setSlug(sanitizeSlug(slug || link?.linkId || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close on escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowModal]);

  return (
    <div className={styles.backdrop} onClick={() => setShowModal(false)}>
      <div
        className={styles.container}
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dragZone} ref={dragZoneRef}>
          <div className={styles.handle} />
        </div>

        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h3>Edit Link</h3>
            <small className={styles.stepTag}>Step {step + 1} / 4</small>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          {step === 0 && (
            <div className={styles.step}>
              <label className={styles.label}>Link Name</label>
              <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Wholesale Group"
              />
              <label className={styles.label}>
                Where do you want the Link to direct people to? (Select One)
              </label>
              <div className={styles.segment}>
                <button
                  className={`${styles.segmentBtn} ${
                    linkType === "dm" ? styles.segmentActive : ""
                  }`}
                  onClick={() => setLinkType("dm")}
                >
                  Whatsapp DM
                </button>
                <button
                  className={`${styles.segmentBtn} ${
                    linkType === "group" ? styles.segmentActive : ""
                  }`}
                  onClick={() => setLinkType("group")}
                >
                  Whatsapp Group
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.step}>
              {linkType === "dm" ? (
                <>
                  <label className={styles.label}>WhatsApp number</label>
                  <input
                    className={styles.input}
                    value={whatsInput}
                    onChange={(e) => setWhatsInput(e.target.value)}
                    placeholder="e.g. 2348012345678"
                  />
                  <label className={styles.label}>
                    Prefill message (Optional)
                  </label>
                  <input
                    className={styles.input}
                    value={prefill}
                    onChange={(e) => setPrefill(e.target.value)}
                    placeholder="e.g Hello! I'm interested in…"
                  />
                </>
              ) : (
                <>
                  <label className={styles.label}>Whatsapp Group Link</label>
                  <input
                    className={styles.input}
                    value={whatsInput}
                    onChange={(e) => setWhatsInput(e.target.value)}
                    placeholder="e.g https://chat.whatsapp.com/XXXXX"
                  />
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className={styles.step}>
              <div className={styles.templatesHead}>
                <span>Select a Template</span>

                <div />
              </div>

              {tplLoading && (
                <div className={styles.loadingRow}>Loading templates...</div>
              )}

              {!tplLoading && (
                <div className={styles.tplGridWrap}>
                  <div
                    className={styles.tplGrid}
                    onScroll={(e) => {
                      const el = e.target;
                      const thumb = document.getElementById("tpl-thumb");
                      const ratio =
                        el.scrollTop / (el.scrollHeight - el.clientHeight);
                      thumb.style.top = `${ratio * (el.clientHeight - 60)}px`;
                    }}
                  >
                    {templates.map((tpl) => {
                      const normalizedPlan = String(userPlan).toLowerCase();

                      const locked =
                        Array.isArray(tpl.allowedPlans) &&
                        tpl.allowedPlans.length > 0
                          ? !tpl.allowedPlans
                              .map((p) => String(p).toLowerCase())
                              .some((p) => normalizedPlan.includes(p))
                          : false;

                      const isSelected = selectedTplId === tpl._id && !locked;

                      return (
                        <div
                          key={tpl._id}
                          className={`${styles.tplCard} ${
                            isSelected ? styles.activeTpl : ""
                          }`}
                          onClick={() => !locked && setSelectedTplId(tpl._id)}
                        >
                          <div className={styles.tplThumbWrap}>
                            <img
                              src={tpl.thumbnailUrl}
                              alt={tpl.name}
                              className={styles.tplThumb}
                            />

                            {locked && (
                              <div className={styles.lockOverlay}>
                                <Lock size={18} />
                                <button
                                  className={styles.upgradeBtnSmall}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRequestUpgrade?.();
                                  }}
                                >
                                  Upgrade
                                </button>
                              </div>
                            )}
                          </div>

                          <div className={styles.tplRow}>
                            <div className={styles.tplName}>{tpl.name}</div>
                            <div className={styles.tplActions}>
                              <button
                                className={styles.previewBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (locked) return onRequestUpgrade?.();
                                  openLivePreview(tpl);
                                }}
                              >
                                <Eye size={14} /> Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.tplScrollTrack}>
                    <div id="tpl-thumb" className={styles.tplScrollThumb}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className={styles.step}>
              <label className={styles.label}>Custom link</label>
              <input
                className={styles.input}
                value={slug}
                onChange={(e) => onChangeSlug(e.target.value)}
                disabled={!isPro}
                placeholder="custom-slug"
              />
              {!isPro && (
                <div className={styles.note}>
                  Custom links are available for Pro users only.
                </div>
              )}

              <div className={styles.slugPreview}>
                <span className={styles.label}>Shortened Link</span>

                <p className={styles.shortInline}>
                  {(process.env.NEXT_PUBLIC_FRONTEND_URL || "").replace(
                    "/api",
                    ""
                  )}
                  <span className={styles.dim}>/r/</span>
                  <span className={styles.liveSlug}>{slug || link.linkId}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        {showPreviewForTplId && (
          <div className={styles.previewPane}>
            <div className={styles.previewBar}>
              <button
                className={styles.backBtn}
                onClick={() => {
                  setShowPreviewForTplId(null);
                  setPreviewSrc("");
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>
              <div className={styles.previewNote}>
                Live Preview (no redirect)
              </div>
            </div>

            <div className={styles.phone}>
              {/* sandbox blocks top-navigation so preview cannot redirect parent */}
              <iframe
                className={styles.frame}
                title="Template Preview"
                src={previewSrc}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
        <div className={styles.footer}>
          <div className={styles.nav}>
            <button
              className={styles.secondary}
              onClick={() =>
                step === 0 ? setShowModal(false) : setStep((s) => s - 1)
              }
            >
              {step === 0 ? "Close" : "Back"}
            </button>

            {step < 3 && (
              <button
                className={styles.primary}
                onClick={() => {
                  if (!canNext())
                    return toast.error("Please fill required fields");
                  setStep((s) => s + 1);
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            )}

            {step === 3 && (
              <button
                className={styles.primary}
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className={styles.spin} />
                ) : (
                  "Save changes"
                )}
              </button>
            )}
          </div>
        </div>
        {showPreviewForTplId && (
          <div className={styles.fullPreview}>
            <button
              className={styles.closePreviewBtn}
              onClick={closeLivePreview}
            >
              <X size={22} />
            </button>

            <iframe
              className={styles.fullPreviewFrame}
              src={previewSrc}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
