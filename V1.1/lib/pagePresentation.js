const imageKeys = ["thumbnailUrl", "thumbnail", "coverImage", "heroImage", "backgroundImage", "imageUrl", "image", "src"];

const usableImage = (value) => typeof value === "string" && /^(https?:\/\/|data:image\/|blob:\/)/i.test(value.trim()) ? value.trim() : "";

export function findFirstPageImage(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return "";
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) { const found = findFirstPageImage(item, seen); if (found) return found; }
    return "";
  }
  for (const key of imageKeys) {
    const candidate = usableImage(value[key]);
    if (candidate) return candidate;
  }
  for (const nested of Object.values(value)) {
    const found = findFirstPageImage(nested, seen);
    if (found) return found;
  }
  return "";
}

export function pageThumbnail(page) {
  return usableImage(page?.template?.thumbnailUrl) || usableImage(page?.templateId?.thumbnailUrl) || findFirstPageImage(page?.customContent) || findFirstPageImage(page?.config);
}

export function pageInitial(page) {
  return String(page?.title || "P").trim().charAt(0).toUpperCase() || "P";
}

export function pageHasLeadForm(page) {
  const html = String(page?.template?.html || page?.html || "").toLowerCase();
  if (/<form\b|type=["'](?:email|tel)["']|name=["'](?:name|email|phone|whatsapp)["']/.test(html)) return true;
  const formKeys = /^(form|lead|leadform|captureform|contactform|whatsappform)$/i;
  const visit = (value, seen = new Set()) => {
    if (!value || typeof value !== "object" || seen.has(value)) return false;
    seen.add(value);
    if (Array.isArray(value)) return value.some((item) => visit(item, seen));
    if (Object.entries(value).some(([key, item]) => formKeys.test(key) && item !== false && item != null)) return true;
    if ([value.type, value.blockType, value.component, value.kind].some((item) => typeof item === "string" && /form|lead|contact|capture/i.test(item))) return true;
    return Object.values(value).some((item) => visit(item, seen));
  };
  return visit(page?.customContent) || visit(page?.config);
}
