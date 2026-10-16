// Shared destination rules: keep the frontend and backend copies identical.
const appSchemes = new Set(['whatsapp:', 'tg:', 'instagram:', 'fb:', 'fb-messenger:', 'twitter:', 'x:', 'tiktok:', 'snssdk1233:', 'snapchat:', 'viber:', 'line:', 'linkedin:', 'discord:', 'youtube:', 'signal:', 'sgnl:', 'mailto:', 'tel:', 'sms:']);
const fail = message => { throw new Error(message); };
function webURL(value) {
  let raw = String(value || '').trim();
  if (!raw || /[\u0000-\u0020<>"`\\]/.test(raw)) fail('Enter a complete link without spaces.');
  if (!/^[a-z][a-z\d+.-]*:/i.test(raw)) raw = 'https://' + raw.replace(/^\/\//, '');
  let url; try { url = new URL(raw); } catch { fail('Enter a valid destination link.'); }
  if (!['http:', 'https:'].includes(url.protocol) || (!url.hostname || (!url.hostname.includes('.') && url.hostname !== 'localhost' && !url.hostname.includes(':'))) || url.username || url.password) fail('Use a valid http or https browser link.');
  return url;
}
export function detectPlatform(value) {
  try {
    const u = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    const h = u.hostname.toLowerCase().replace(/^www\./, '');
    if (u.protocol === 'whatsapp:' || ['wa.me','whatsapp.com','api.whatsapp.com','web.whatsapp.com','chat.whatsapp.com'].includes(h)) return 'whatsapp';
    if (u.protocol === 'tg:' || ['t.me','telegram.me','telegram.dog'].includes(h)) return 'telegram';
    for (const [name, hosts, schemes] of [['instagram',['instagram.com','ig.me'],['instagram:']],['facebook',['facebook.com','m.facebook.com','fb.com','m.me','messenger.com'],['fb:','fb-messenger:']],['tiktok',['tiktok.com','vm.tiktok.com','vt.tiktok.com'],['tiktok:','snssdk1233:']],['x',['x.com','twitter.com'],['twitter:','x:']],['youtube',['youtube.com','youtu.be','m.youtube.com'],['youtube:']],['linkedin',['linkedin.com'],['linkedin:']],['snapchat',['snapchat.com'],['snapchat:']]]) if (hosts.includes(h)||schemes.includes(u.protocol)) return name;
  } catch {}
  return 'website';
}
export function normalizeDestination(input) {
  let raw = String(input.destinationUrl || input.whatsappCode || '').trim();
  if (!raw || raw.length > 4096) fail('Enter a destination link or phone number.');
  const platform = input.platform || ((input.linkType === 'url' || /^(?:https?:\/\/|[a-z][a-z\d+.-]*:)/i.test(raw) || /^[\w-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(raw)) ? detectPlatform(raw) : 'whatsapp');
  let type = input.linkType || 'dm';
  let prefill = String(input.prefill || '');
  const phone = value => {
    const number = String(value).replace(/[\s().-]/g, '').replace(/^00/, '').replace(/^\+/, '');
    if (!/^[1-9]\d{6,14}$/.test(number)) fail('Enter a valid phone number including its country code.');
    return number;
  };
  const safe = value => String(value).replace(/'/g, '%27');
  const result = (url, deepLink, fallback, code = url, kind = 'url', actualPlatform = platform) => ({destinationUrl:safe(url),deepLink:safe(deepLink),fallbackUrl:safe(fallback),whatsappCode:code,linkType:kind,platform:actualPlatform,prefill:kind==='dm'?prefill:''});
  if (platform === 'whatsapp' && /^[+\d\s().-]+$/.test(raw)) {
    const code=phone(raw); const fallback=`https://wa.me/${code}${prefill?`?text=${encodeURIComponent(prefill)}`:''}`;
    return result(fallback,`whatsapp://send?phone=${code}${prefill?`&text=${encodeURIComponent(prefill)}`:''}`,fallback,code,'dm');
  }
  // Preserve older clients that send just an invite code.
  if (platform==='whatsapp' && ['group','channel'].includes(type) && /^[A-Za-z0-9_-]{8,}$/.test(raw)) raw=type==='group'?`https://chat.whatsapp.com/${raw}`:`https://whatsapp.com/channel/${raw}`;
  let u; try { u=new URL(/^[a-z][a-z\d+.-]*:/i.test(raw)?raw:`https://${raw}`); } catch { fail('Enter a valid destination link.'); }
  const actualPlatform=detectPlatform(raw);
  if (platform!=='website' && actualPlatform!==platform) fail(`Paste a ${platform} link, or change the selected platform.`);
  const host=u.hostname.toLowerCase().replace(/^www\./,'');
  if (actualPlatform==='whatsapp') {
    if (u.searchParams.has('text') && !Object.prototype.hasOwnProperty.call(input, 'prefill')) prefill=u.searchParams.get('text');
    const parts=u.pathname.split('/').filter(Boolean);
    if ((u.protocol==='whatsapp:'&&u.hostname==='send') || (['api.whatsapp.com','web.whatsapp.com','whatsapp.com'].includes(host)&&parts[0]==='send') || (host==='wa.me'&&/^\+?\d+$/.test(parts[0]||''))) {
      const code=phone(u.searchParams.get('phone') || parts[0] || '');
      return normalizeDestination({platform:'whatsapp',whatsappCode:code,prefill});
    }
    if (host==='chat.whatsapp.com'||(u.protocol==='whatsapp:'&&u.hostname==='chat')) {
      const code=u.protocol==='whatsapp:'?u.searchParams.get('code'):parts[0];
      if (!/^[A-Za-z0-9_-]{8,}$/.test(code||'')) fail('Paste the complete WhatsApp group invite link.');
      return result(`https://chat.whatsapp.com/${code}`,`whatsapp://chat?code=${code}`,`https://chat.whatsapp.com/${code}`,code,'group','whatsapp');
    }
    if (host==='whatsapp.com'&&parts[0]==='channel') {
      if (!/^[A-Za-z0-9_-]{8,}$/.test(parts[1]||'')) fail('Paste the complete WhatsApp channel link.');
      const url=webURL(raw).href;return result(url,url,url,parts[1],'channel','whatsapp');
    }
    // Business /message/, catalog, product and other official links remain intact.
    if (['http:','https:'].includes(u.protocol)) { const url=webURL(raw).href;return result(url,url,url,url,'url','whatsapp'); }
  }
  if (['http:','https:'].includes(u.protocol)) { const url=webURL(raw).href;return result(url,url,url,url,'url',actualPlatform); }
  if (!appSchemes.has(u.protocol) || /[\u0000-\u0020<>"`\\]/.test(raw)) fail('Use an http/https link or a supported social app deep link.');
  let fallback=input.fallbackUrl;
  if (!fallback && u.protocol==='tg:') {
    if(u.hostname==='resolve'&&u.searchParams.get('domain')) {const params=new URLSearchParams(u.search);const domain=params.get('domain');params.delete('domain');fallback=`https://t.me/${encodeURIComponent(domain)}${params.size?'?'+params:''}`;}
    if(u.hostname==='join'&&u.searchParams.get('invite')) fallback=`https://t.me/+${encodeURIComponent(u.searchParams.get('invite'))}`;
  }
  if (['mailto:','tel:','sms:'].includes(u.protocol)) return result(raw,raw,raw);
  if (!fallback) fail('Add a browser fallback link for visitors without the app.');
  return result(raw,raw,webURL(fallback).href,raw,'url',actualPlatform);
}
export function redirectTargets(link) {
  // Revalidate stored links too; legacy records use whatsappCode.
  const value=normalizeDestination({destinationUrl:link.destinationUrl,whatsappCode:link.whatsappCode,linkType:link.linkType,platform:link.platform|| (link.linkType==='url'?'website':'whatsapp'),prefill:link.prefill,fallbackUrl:link.fallbackUrl});
  return {deepLink:value.deepLink,fallback:value.fallbackUrl};
}

export function validateRedirectDestination(value) {
 for(const raw of [value.destinationUrl,value.fallbackUrl]) {
  let url;try{url=new URL(raw);}catch{continue;}
  const hosts=['mytik.link','www.mytik.link','mytiklink.com','www.mytiklink.com','localhost','127.0.0.1'];
  try{hosts.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname);}catch{}
  if(hosts.includes(url.hostname)&&/^\/(?:v1-1\/)?r(?:\/|$)/i.test(url.pathname))throw new Error('Use the final destination, not another MyTikLink redirect link.');
 }
 return value;
}
