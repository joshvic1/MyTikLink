export function pageUrl(page) {
 const fallback='https://mytiklink.com';
 let origin=String(process.env.NEXT_PUBLIC_SITE_URL||fallback).trim();
 if(!/^https?:\/\//i.test(origin))origin='https://'+origin;
 try{origin=new URL(origin).origin;}catch{origin=fallback;}
 const value=String(page.publicUrl||'').trim();
 if(value){try{const absolute=/^https?:\/\//i.test(value)?value:value.startsWith('/')?new URL(value,origin).href:'https://'+value;const url=new URL(absolute);if(['http:','https:'].includes(url.protocol)){if(['mytiklink.com','www.mytiklink.com','mytik.link','www.mytik.link',new URL(origin).hostname].includes(url.hostname))url.pathname=url.pathname.replace(/^\/v1-1\/p\//,'/p/');return url.href;}}catch{}}
 return `${origin}/p/${encodeURIComponent(page.slug||'')}`;
}
