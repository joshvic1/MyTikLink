import {useEffect} from 'react';
import {readLeadReceipt,showLeadReceipt} from './leadReceipt.mjs';
export default function useLeadReceipt(page){
 useEffect(()=>{
  if(!page?.slug)return;
  const restore=()=>{const receipt=readLeadReceipt(page);if(receipt)document.querySelectorAll('[data-lead-form="true"]').forEach(form=>showLeadReceipt(form,receipt));};
  restore();window.addEventListener('pageshow',restore);
  return()=>window.removeEventListener('pageshow',restore);
 },[page]);
}
