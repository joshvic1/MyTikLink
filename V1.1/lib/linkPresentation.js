export function linkUrl(link) {
 if (link.publicUrl) return link.publicUrl;
 const origin=(process.env.NEXT_PUBLIC_SITE_URL || 'https://mytik.link').replace(/\/$/,'');
 return `${origin}/v1-1/r/${encodeURIComponent(link.linkId)}`;
}
export function recordedClicks(link,history=[]) {
 if(Number.isFinite(link.recordedClicks))return link.recordedClicks;
 return Math.max(0,Number(link.redirectCount)||0)+history.filter(h=>String(h.linkId?._id||h.linkId)===String(link._id)).reduce((sum,h)=>sum+Math.max(0,Number(h.clicksUsed)||0),0);
}
export function destinationLabel(link) { return link.destinationUrl||link.fallbackUrl||link.whatsappCode||'Destination unavailable'; }
