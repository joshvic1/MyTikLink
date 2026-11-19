import {readBookingProgress} from './bookingProgressStream.mjs';
import {v11ApiBase} from '../lib/apiBase';
export async function submitBooking(slug,payload,onProgress){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
 try{
  const response=await fetch(`${v11ApiBase()}/v1-1/store-studio/commerce/services/public/${encodeURIComponent(slug)}/bookings/progress`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
  if(!response.ok){const error=await response.json().catch(()=>({}));throw Object.assign(new Error(error.message||'Could not create your booking. Please retry.'),{status:response.status});}
  return await readBookingProgress(response,onProgress);
 }finally{clearTimeout(timer);controller.abort();}
}
export function scrollReceiptTop(node){if(!node)return;let parent=node.parentElement;while(parent){if(parent.scrollHeight>parent.clientHeight&&/auto|scroll/.test(getComputedStyle(parent).overflowY)){parent.scrollTop=0;break;}parent=parent.parentElement;}node.focus({preventScroll:true});}
