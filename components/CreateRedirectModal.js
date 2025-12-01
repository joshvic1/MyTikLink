"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X,
  Lock,
  CheckCircle2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Hash,
  Link2,
  MessageSquare,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import s from "@/styles/CreateRedirectModal.module.css";

/**
 * Props:
 * - setShowModal(boolean)
 * - onSuccess()
 * - userPlan: "free" | "standard_monthly" | "pro_monthly" etc.
 * - onRequestUpgrade()
 */
export default function CreateRedirectModal({
  setShowModal,
  onSuccess,
  userPlan = "free",
  onRequestUpgrade,
}) {
  const sheetRef = useRef(null);
  const dragZoneRef = useRef(null);
  const trackRef = useRef(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "";
  const PREVIEW_BASE = API.replace(/\/api\/?$/i, "") || "http://localhost:5000";
  const placeholderThumb = "/mnt/data/Screenshot 2025-11-23 232011.png";
  const tutorialVideo = "https://www.youtube.com/embed/oNGguNKnpoQ";

  // steps: 0 Title, 1 Type & Whatsapp, 2 Templates, 3 Create
  const [step, setStep] = useState(0);

  // form
  const [title, setTitle] = useState("");
  const [linkType, setLinkType] = useState(""); // dm | group
  const [whatsInput, setWhatsInput] = useState("");
  const [prefill, setPrefill] = useState("");

  // templates
  const [templates, setTemplates] = useState([]);
  const [tplLoading, setTplLoading] = useState(true);
  const [tplError, setTplError] = useState("");
  const [selectedTplId, setSelectedTplId] = useState(null);

  // preview
  const [showPreviewForTplId, setShowPreviewForTplId] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showTikTokHelp, setShowTikTokHelp] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // fetch templates
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
        setTplError("");
      } catch (e) {
        console.error("Failed to load templates:", e);
        if (mounted) setTplError("Failed to load templates.");
      } finally {
        if (mounted) setTplLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [API]);

  // drag to close (mobile)
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

  // helpers
  const onlyDigits = (v) => (v || "").replace(/\D/g, "");

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
      code = onlyDigits(code);
      type = "dm";
    }

    return { code, type };
  };

  // auto flip type if input suggests other type
  const handleDirectInput = (val) => {
    const { type } = parseWhatsAppCode(val);
    if (type === "group" && linkType !== "group") setLinkType("group");
    setWhatsInput(val);
  };
  const handleGroupInput = (val) => {
    const { type } = parseWhatsAppCode(val);
    if (type === "dm" && linkType !== "dm") setLinkType("dm");
    setWhatsInput(val);
  };

  // target fallback url display
  const cleaned = useMemo(
    () => parseWhatsAppCode(whatsInput),
    [whatsInput, linkType]
  );
  const targetUrl = useMemo(() => {
    if (linkType === "group") {
      const code = cleaned.type === "group" ? cleaned.code : "";
      return code ? `https://chat.whatsapp.com/${code}` : "";
    }
    const phone = cleaned.type === "dm" ? cleaned.code : "";
    if (!phone) return "";
    const q = prefill ? `?text=${encodeURIComponent(prefill)}` : "";
    return `https://wa.me/${phone}${q}`;
  }, [linkType, cleaned, prefill]);

  // template selection
  const handleSelectTemplate = (tpl) => {
    const locked = !tpl.allowedPlans?.includes(userPlan);
    if (locked) return onRequestUpgrade?.();
    setSelectedTplId(tpl._id);
    toast.success(`Selected: ${tpl.name}`);
  };

  // preview url builder
  const buildPreviewURL = (tplId) => {
    if (!tplId || !title.trim()) return "";
    const params = new URLSearchParams({
      templateId: tplId,
      title: title.trim(),
      type: linkType,
      plan: "pro",
      redirectDelay: "2000",
    });

    if (linkType === "dm") {
      const phone = cleaned.type === "dm" ? cleaned.code : "";
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
  const refreshPreview = () => {
    if (!showPreviewForTplId) return;
    setPreviewSrc(buildPreviewURL(showPreviewForTplId));
    toast.success("Preview refreshed");
  };

  // carousel scroll helpers
  const scrollCarousel = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amt = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? amt : -amt, behavior: "smooth" });
  };

  // create submit
  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Please enter a name.");
    if (!selectedTplId) return toast.error("Please select a template.");

    const { code: finalCode, type: detectedType } =
      parseWhatsAppCode(whatsInput);
    if (linkType === "dm") {
      if (detectedType !== "dm" || !finalCode) {
        return toast.error("Enter a valid WhatsApp number.");
      }
    } else {
      if (detectedType !== "group" || !finalCode) {
        return toast.error("Paste a valid group invite link or code.");
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        linkType,
        whatsappCode: finalCode,
        ...(linkType === "dm" && prefill ? { prefill: prefill.trim() } : {}),
        templateId: selectedTplId,
      };

      const res = await axios.post(`${API}/links`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status >= 200 && res.status < 300) {
        toast.success("Link created!");
        onSuccess?.();
        setShowModal(false);
      } else {
        toast.error(res.data?.message || "Could not create link.");
      }
    } catch (e) {
      console.error("Create error:", e?.response?.data || e);
      toast.error(e?.response?.data?.message || "Failed to create link.");
    } finally {
      setSubmitting(false);
    }
  };

  // esc to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowModal]);

  // small guard: when templates change ensure selectedTplId still exists
  useEffect(() => {
    if (!selectedTplId) return;
    if (!templates.find((t) => t._id === selectedTplId)) {
      setSelectedTplId(null);
    }
  }, [templates]);
  const isTemplateLocked = (tplId) => {
    const tpl = templates.find((t) => t._id === tplId);
    if (!tpl) return false;

    return !tpl.allowedPlans?.includes(userPlan);
  };

  // UI
  return (
    <div className={s.backdrop} onClick={() => setShowModal(false)}>
      <div
        className={s.container}
        onClick={(e) => e.stopPropagation()}
        ref={sheetRef}
      >
        <div className={s.dragZone} ref={dragZoneRef}>
          <div className={s.handle} />
        </div>

        <div className={s.header}>
          <div className={s.titleRow}>
            <h3>Create New Link</h3>
            <small className={s.stepTag}>Step {step + 1} / 4</small>
          </div>

          <button
            className={s.closeBtn}
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={s.content}>
          {/* Left column: form */}
          <div
            className={s.step}
            style={{ display: step === 2 ? "none" : "flex" }}
          >
            {step === 0 && (
              <>
                <label className={s.label}>Name your Link</label>
                <input
                  className={s.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Wholesale Group"
                />
              </>
            )}

            {step === 1 && (
              <>
                <label className={s.label}>
                  <Hash size={14} /> Where do you want your link to send people
                  to?
                </label>
                <div className={s.segment}>
                  <button
                    className={`${s.segmentBtn} ${
                      linkType === "dm" ? s.segmentActive : ""
                    }`}
                    onClick={() => setLinkType("dm")}
                  >
                    Whatsapp DM (Message)
                  </button>
                  <button
                    className={`${s.segmentBtn} ${
                      linkType === "group" ? s.segmentActive : ""
                    }`}
                    onClick={() => setLinkType("group")}
                  >
                    Whatsapp Group
                  </button>
                </div>

                {linkType === "dm" ? (
                  <>
                    <label className={s.label}>WhatsApp Number</label>
                    <input
                      className={s.input}
                      placeholder="e.g. 2348012345678"
                      value={whatsInput}
                      onChange={(e) => handleDirectInput(e.target.value)}
                    />
                    <label className={s.label}>
                      Prefill message (optional)
                    </label>
                    <input
                      className={s.input}
                      placeholder="Hello! I'm interested in…"
                      value={prefill}
                      onChange={(e) => setPrefill(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <label className={s.label}>WhatsApp Group link</label>
                    <input
                      className={s.input}
                      placeholder="https://chat.whatsapp.com/XXXXX or CODE"
                      value={whatsInput}
                      onChange={(e) => handleGroupInput(e.target.value)}
                    />
                  </>
                )}

                <div className={s.metaBlock}>
                  <div className={s.metaHead}>Preview URL</div>
                  <div
                    className={`${s.metaVal} ${s.ellipsis}`}
                    title={targetUrl || "—"}
                  >
                    {targetUrl || "—"}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right column: templates / preview */}
          {step === 2 && (
            <div className={s.templatesColumn}>
              <div className={s.templatesHead}>
                <span>Templates</span>
              </div>

              {tplLoading && (
                <div className={s.skelGrid}>
                  <div className={s.skel} />
                  <div className={s.skel} />
                </div>
              )}

              {!tplLoading && !tplError && (
                <div className={s.tplGrid}>
                  {templates.map((tpl) => {
                    const locked = !tpl.allowedPlans?.includes(userPlan);
                    const isSelected = selectedTplId === tpl._id;

                    return (
                      <div
                        key={tpl._id}
                        className={`${s.tplCard} ${isSelected ? s.active : ""}`}
                        onClick={() => !locked && handleSelectTemplate(tpl)}
                      >
                        <div className={s.tplThumbWrap}>
                          <img
                            src={tpl.thumbnailUrl}
                            alt={tpl.name}
                            className={s.tplThumb}
                          />

                          {locked && (
                            <div className={s.lockOverlay}>
                              <Lock size={18} />
                              <button
                                className={s.upgradeBtnSmall}
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

                        <div className={s.tplInfoRow}>
                          <div className={s.tplName}>{tpl.name}</div>
                          <div className={s.tplActions}>
                            <button
                              className={s.miniGhost}
                              onClick={(e) => {
                                e.stopPropagation();
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
              )}
            </div>
          )}

          {step === 3 && (
            <div
              className={s.step}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <h4 className={s.label}>Before you continue…</h4>

              <p className={s.infoText}>
                To make your link work on your TikTok profile, you must switch
                your TikTok account to a <b>Business Account</b>. Without doing
                this,This link you are about to create might not work properly.
              </p>

              <a
                href="https://vt.tiktok.com/ZSfgsdUcU/"
                target="_blank"
                rel="noopener noreferrer"
                className={s.businessLink}
              >
                How to switch to Business Account →
              </a>

              {/* OPTIONAL: add TikTok video popup trigger */}
              <button className={s.primary} onClick={() => setShowVideo(true)}>
                Watch Tutorial Video
              </button>
            </div>
          )}
        </div>

        <div className={s.footer}>
          <div className={s.nav}>
            <button
              className={s.secondary}
              onClick={() =>
                step === 0 ? setShowModal(false) : setStep((s) => s - 1)
              }
            >
              {step === 0 ? "Close" : "Back"}
            </button>

            {step < 3 && (
              <button
                className={s.primary}
                onClick={() => {
                  // validation per step
                  if (step === 0 && !title.trim())
                    return toast.error("Please Name Your Link");
                  if (step === 1) {
                    if (!linkType) {
                      return toast.error(
                        "Please select where you want your link to send people to."
                      );
                    }

                    const parsed = parseWhatsAppCode(whatsInput);

                    if (
                      linkType === "dm" &&
                      (parsed.type !== "dm" || !parsed.code)
                    ) {
                      return toast.error("Enter a valid WhatsApp number");
                    }

                    if (
                      linkType === "group" &&
                      (parsed.type !== "group" || !parsed.code)
                    ) {
                      return toast.error("Enter a valid group link");
                    }
                  }

                  if (step === 2 && !selectedTplId)
                    return toast.error("Please select a template");
                  setStep((s) => s + 1);
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            )}

            {step === 3 && (
              <button
                className={s.primary}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  "Creating..."
                ) : (
                  <>
                    <CheckCircle2 size={14} /> I Know, Create Link
                  </>
                )}
              </button>
            )}

            {showPreviewForTplId && (
              <div className={s.fullPreview}>
                <div className={s.previewTopBar}>
                  <button
                    className={s.selectTemplateBtn}
                    onClick={() => {
                      if (isTemplateLocked(showPreviewForTplId)) {
                        toast.error("Template only available for Pro users.");
                        closeLivePreview();
                        return;
                      }

                      setSelectedTplId(showPreviewForTplId);
                      toast.success("Template selected");
                      closeLivePreview();
                    }}
                  >
                    Select This Template
                  </button>

                  <button
                    className={s.closePreviewBtn2}
                    onClick={closeLivePreview}
                  >
                    ✕
                  </button>
                </div>

                <iframe
                  className={s.fullPreviewFrame}
                  src={previewSrc}
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}

            {showVideo && (
              <div
                className={s.videoOverlay}
                onClick={() => setShowVideo(false)}
              >
                <div
                  className={s.videoBox}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={s.videoClose}
                    onClick={() => setShowVideo(false)}
                  >
                    ✕ Close Video
                  </button>

                  <iframe
                    className={s.videoIframe}
                    src={tutorialVideo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
