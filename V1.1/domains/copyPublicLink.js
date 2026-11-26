import {apiRequest} from '../lib/api';

export async function preferredPublicLink(value){
 let url;try{url=new URL(String(value))}catch{return String(value)}
 if(!['mytiklink.com','www.mytiklink.com','mytik.link','www.mytik.link'].includes(url.hostname)||!/^\/(?:v1-1\/)?(?:s|p|r)\//.test(url.pathname))return String(value);
 try{const result=await apiRequest('/v1-1/domains/share-url?url='+encodeURIComponent(url.href),{timeoutMs:5000});return result.url||url.href}catch{return url.href}
}
export async function copyPublicLink(value){
 const resolved=preferredPublicLink(value);
 // Create the clipboard operation during the tap to preserve Safari user activation.
 if(typeof ClipboardItem!=='undefined'&&navigator.clipboard.write){
  await navigator.clipboard.write([new ClipboardItem({'text/plain':resolved.then(text=>new Blob([text],{type:'text/plain'}))})]);
 }else await navigator.clipboard.writeText(await resolved);
}
