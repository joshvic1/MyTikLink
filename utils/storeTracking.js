export const trackMeta = (event, params = {}) => {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;

  window.fbq("track", event, params);
};

export const trackTikTok = (event, params = {}) => {
  if (typeof window === "undefined") return;
  if (!window.ttq) return;

  window.ttq.track(event, params);
};

export const trackBoth = (
  event,
  metaParams = {},
  tiktokParams = metaParams,
) => {
  trackMeta(event, metaParams);
  trackTikTok(event, tiktokParams);
};
