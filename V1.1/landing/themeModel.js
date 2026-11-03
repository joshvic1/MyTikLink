import {categoryAssets} from "./personalization";
import {coverSources} from "../media/categoryImages";
import { resolvePersonalization } from "./personalization";
export const THEME_BLOCK = "phase-one-theme";
export function safeUrl(value, image = false) {
  const url = String(value || "").trim();
  if (/^https?:\/\//i.test(url) || (/^\/(?!\/)/.test(url))) return url;
  if (!image && (/^#[a-z][\w-]*$/i.test(url) || /^(mailto:|tel:)/i.test(url))) return url;
  return "";
}
export function brandTokens(input = "#715047") {
  const color = /^#[\da-f]{6}$/i.test(input) ? input : "#715047";
  const rgb = color.slice(1).match(/../g).map(x => parseInt(x, 16));
  const linear = rgb.map(x => { const v = x / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
  const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  return { accent: color, onAccent: luminance > .179 ? "#000000" : "#ffffff", hover: `rgb(${rgb.map(x => Math.round(x * .82)).join(",")})`, soft: `rgb(${rgb.map(x => Math.round(x * .12 + 255 * .88)).join(",")})` };
}
export function createThemeInstance(theme, profile = {}, registry = []) {
  if (theme.renderer === "universal-profile") return {id:"phase-one",type:THEME_BLOCK,version:1,themeId:theme.id,renderer:theme.renderer,batch:theme.batch,variant:theme.variant || "action",family:theme.family,sections:[],layout:{},colorOverride:null,personalization:resolvePersonalization({template:theme,profile,registry})};
  const data = profile.data || profile.onboarding || profile;
  const asset=categoryAssets(data.category || {},registry)[0];
  const categoryImage=coverSources(asset)?.src || "";
  const fillImage=section=>({...section,...(!section.image && categoryImage?{image:categoryImage,imageAlt:asset.alt || `${data.publicName || "Business"} — ${data.category?.label || "category"}`,categoryCover:asset}:{}),...(section.items?{items:section.items.map(fillImage)}:{})});
  return JSON.parse(JSON.stringify({
    id: "phase-one", type: THEME_BLOCK, version: 1, themeId: theme.id,
    ...(theme.renderer ? {renderer:theme.renderer,batch:theme.batch} : {}),
    variant: theme.variant, family: theme.family, categoryIds: theme.categoryIds,
    categoryId: data.category?.id || theme.categoryIds[0],
    categoryLabel: data.category?.customLabel || data.category?.label || "",
    profileColor: data.brand?.preferredColor || theme.defaultTokens.accent, colorOverride: null,
    name: data.publicName || "Your brand", logo: data.brand?.imageUrl || "",
    ownerWhatsapp: data.whatsappNumber || profile.whatsappNumber || "",
    layout: { imagePosition: theme.imagePosition || "center", rounded: false },
    sections: theme.sectionRecipe.map(section => fillImage(section.type === "hero" ? { ...section, description: data.brand?.description || section.description } : section)),
  }));
}
export const getThemeBlock = sections => Array.isArray(sections) ? sections.find(section => section?.type === THEME_BLOCK) : undefined;
export function shortThemeTokens(color) {
  const base = brandTokens(color);
  return { ...base, primary:base.accent, cta:base.accent, subtleSurface:base.soft, focus:'#20231f' };
}
export function themeScore(theme, categoryId, registry = []) {
  if (theme.categoryIds.includes(categoryId)) return 1000;
  if (categoryId.startsWith("other")) return theme.family === "portrait-profile" ? 3 : theme.family === "modular-conversion" ? 2 : 0;
  const selected = registry.find(c => c.id === categoryId);
  if (theme.categoryIds.some(id => id.split("/")[0] === (selected?.parentId || categoryId.split("/")[0]))) return 800;
  const words = `${selected?.label || ""} ${(selected?.keywords || []).join(" ")} ${(selected?.aliases || []).join(" ")}`.toLowerCase();
  return theme.tags.reduce((score, tag) => score + (words.includes(tag) ? 10 : 0), 0);
}
