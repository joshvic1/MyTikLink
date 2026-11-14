import { musicActions, musicPlatforms } from "./musicPlatforms";
import { getCategoryActions } from "./categoryActions";
import categoryDescriptions from "./categoryDescriptions.generated.json";
import { getCategoryCover, coverSources, relatedCategoryCovers } from "../media/categoryImages";

export const socialPlatforms = ["instagram", "tiktok", "facebook", "x", "youtube", "telegram", "website", "email", ...musicPlatforms.map(([id])=>id).filter(id=>id!=="youtube")];
export function validDestination(value, platform = "") {
  const text = String(value || "").trim();
  if (platform === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.replace(/^mailto:/i, "")) ? `mailto:${text.replace(/^mailto:/i, "")}` : "";
  try {
    const url = new URL(text);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".")) return "";
    const hosts = {instagram:["instagram.com"],tiktok:["tiktok.com"],facebook:["facebook.com","fb.com"],x:["x.com","twitter.com"],youtube:["youtube.com","youtu.be"],telegram:["t.me","telegram.me"]};
    if (hosts[platform] && !hosts[platform].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) return "";
    return text;
  } catch { return ""; }
}
export function whatsappDestination(number) {
  const digits = String(number || "").replace(/[\s()+-]/g, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? `https://wa.me/${digits}` : "";
}
export function actionDestination(action, data) {
  return action.kind === "whatsapp" ? whatsappDestination(data.whatsappNumber) : validDestination(action.url, action.platform);
}
export function categoryAssets(category = {}, registry = []) {
  const record = registry.find(item => item.id === category.id) || category;
  // Registry relationships only: never substitute a photograph from an unrelated category.
  const ids = [record.id, record.parentId || String(record.id || "").split("/")[0], record.generalCategoryId];
  return [...new Set(ids.filter(Boolean))].map(id => getCategoryCover(id)).filter(Boolean);
}
export function suggestedActions(category) {
 const suggestions=getCategoryActions(category);
 return [suggestions[1].label,suggestions[0].label];
}
// Called only when creating a page. Renderers consume the persisted snapshot, never an account.
export function resolvePersonalization({ template, profile = {}, registry = [], overrides = {} }) {
  const account = profile.data || profile.onboarding || profile;
  const category = template.id === "music-artist" ? {id:"media-entertainment/music-artists",label:"Music artist"} : registry.find(item => item.id === account.category?.id) || account.category || {};
  const displayName = account.publicName || template.fallbackName || "Your brand";
  const assets = categoryAssets(category, registry);
  const suggestions = getCategoryActions(category);
  const socialLinks = { ...account.socialLinks };
  const actions = [
    {...suggestions[0],url:"",style:"filled",visible:true},
    {...suggestions[1],id:"category-action",suggestionId:suggestions[1].id,url:validDestination(account.actionUrls?.[suggestions[1].id] || (suggestions[1].destinationField === "socialLinks.website" ? socialLinks.website : "")),style:"outline",visible:true},
    ...socialPlatforms.filter(platform => platform !== "website" && (platform === "instagram" || socialLinks[platform])).map(platform => ({id:platform,kind:"social",platform,label:platform === "instagram" ? "Follow on Instagram" : `Connect on ${platform}`,url:socialLinks[platform] || "",style:"filled",visible:true})),
    ...(Array.isArray(account.customActions) ? account.customActions : [])
  ];
  if(template.id === "spotlight-profile") {  actions.forEach(action=>{action.style=action.kind === "whatsapp" ? "outline" : action.kind === "link" ? "soft" : "filled";}); }
  return JSON.parse(JSON.stringify({
    ...(["campaign-profile","rhythm-grid","studio-pass"].includes(template.id) ? {headline:category.label ? `Discover ${category.label}` : "Something worth discovering"} : {}),
    ...(template.hasForm ? {headline:template.defaultHeadline || "Tell us what you have in mind.",form:{...template.defaultForm}} : {}),
    ...(template.productLayout ? {headline:template.id === "curated-shelf" ? "Objects for everyday." : "",enquiryUrl:"",products:Array.from({length:template.id === "curated-shelf"?4:1},(_,i)=>({id:`product-${i+1}`,name:i?`Featured item ${i+1}`:(category.label || "Featured item"),price:["₦18,000","₦8,500","₦12,000","₦16,500"][i],imageUrl:"",assets:i ? [relatedCategoryCovers(category.id)[i-1],...assets].filter(Boolean) : assets}))} : {}),
    templateId:template.id,accountType:account.accountType || "business",displayName,
    categoryId:category.id || "",categoryLabel:account.category?.customLabel || category.label || "",
    categoryAssets:assets,coverImageUrl:"",profileImageUrl:account.brand?.imageUrl || "",
    profileFit:account.accountType === "creator" ? "cover" : "contain",
    description:account.brand?.description?.trim() ? account.brand.description : (category.defaultDescription || categoryDescriptions[category.id] || `Connect with ${displayName}${category.label ? ` · ${category.label}` : ""}.`),
    brandColor:account.brand?.preferredColor || template.defaultTokens.accent,
    highlights:[],
    ...(template.id === "rhythm-grid" ? {media:[{url:"",position:"center"},{url:"",position:"left"},{url:"",position:"right"}]} : {}),
    whatsappNumber:account.whatsappNumber || profile.whatsappNumber || "",socialLinks,actions:template.hasForm ? [] : ["campaign-profile","rhythm-grid","studio-pass"].includes(template.id) ? actions.filter(action=>action.kind === "whatsapp").slice(0,1) : actions,
    visibility:{cover:true,avatar:true,description:true,...template.defaultVisibility},imagePosition:"",...(template.id === "music-artist" ? {headline:"Listen to my latest release",description:account.brand?.description?.trim() || "Choose your favourite platform. Press play.",actions:musicActions(socialLinks)} : {}),...overrides
  }));
}
export function resolvedCoverUrl(data) { return validDestination(data.coverImageUrl) || coverSources(data.categoryAssets?.[0])?.src || ""; }
