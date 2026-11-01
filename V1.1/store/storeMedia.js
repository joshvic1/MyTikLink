import { apiRequest } from "../lib/api";
export async function uploadStoreImage(file, { onProgress = () => {} } = {}) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw Error("Choose a JPG, PNG or WebP image under 5 MB.");
  const root = "/v1-1/store-studio/commerce/media";
  onProgress("Uploading image…");
  const signed = await apiRequest(`${root}/sign`, {
    method: "POST",
    body: JSON.stringify({ size: file.size, type: file.type }),
  });
  let response;
  try {
    response = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: signed.headers,
      body: file,
      signal: AbortSignal.timeout(60000),
    });
  } catch {
    response = null;
  }
  if (!response?.ok)
    await apiRequest(`${root}/${signed.id}/relay`, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
      timeoutMs: 60000,
    });
  onProgress("Optimizing image in the background…");
  let result = await apiRequest(`${root}/${signed.id}/complete`, {
    method: "POST",
    timeoutMs: 20000,
  });
  const deadline = Date.now() + 180000;
  let delay = 1200;
  while (!result.url && Date.now() < deadline) {
    if (["failed", "expired"].includes(result.status))
      throw Error(
        result.message ||
          "Image processing failed. Check Store settings > Advanced to retry.",
      );
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(8000, Math.round(delay * 1.4));
    result = await apiRequest(`${root}/${signed.id}`, { timeoutMs: 15000 });
  }
  if (!result.url)
    throw Error(
      "Image is still processing in the background. Find it in Store settings > Advanced.",
    );
  return result;
}
export function storeImageSrcSet(url) {
  if (
    !/\/store-assets\/[^/]+\/[^/]+(?:\/[^/]+)?\/1600\.webp(?:\?w=\d+)?$/.test(
      url || "",
    )
  )
    return undefined;
  const sourceWidth = Number(url.match(/\?w=(\d+)$/)?.[1] || 1600),
    seen = new Set();
  return [320, 640, 960, 1600]
    .flatMap((w) => {
      const actual = Math.min(w, sourceWidth);
      if (seen.has(actual)) return [];
      seen.add(actual);
      return [
        `${url.replace(/1600\.webp(?:\?w=\d+)?$/, `${w}.webp?w=${actual}`)} ${actual}w`,
      ];
    })
    .join(", ");
}
