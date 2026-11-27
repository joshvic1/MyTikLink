// Add a scheme only to recognizable web addresses; preserve other input for validation.
export function normalizeWebUrl(value) {
 const text=String(value || '').trim();
 if (text.startsWith('/') || text.startsWith('#')) return text;
 if (!text || /[\s\\]/.test(text) || /^[a-z][a-z0-9+.-]*:/i.test(text)) return text;
 const candidate=text.startsWith('//') ? `https:${text}` : `https://${text}`;
 try { const url=new URL(candidate);
  if(url.username || url.password || !url.hostname.includes('.') || !/^[\p{L}\p{N}.-]+$/u.test(url.hostname)) return text;
  return candidate;
 } catch { return text; }
}
