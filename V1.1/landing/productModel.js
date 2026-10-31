import { validDestination, whatsappDestination } from "./personalization";
export function productEnquiryUrl(data,counts={}){
 const custom=validDestination(data.enquiryUrl);
 if(custom)return custom;
 const base=whatsappDestination(data.whatsappNumber);if(!base)return "";
 const items=(data.products||[]).filter(p=>counts[p.id]>0).map(p=>`${p.name} × ${counts[p.id]}`);
 return `${base}?text=${encodeURIComponent(items.length ? `Hello, I'd like to ask about: ${items.join(', ')}.` : "Hello, I'd like to ask about a product.")}`;
}
export function addProduct(counts,id){return {...counts,[id]:Math.min(99,(counts[id]||0)+1)};}
