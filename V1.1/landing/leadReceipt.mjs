import {safeLeadDestination,leadDestination} from './leadDestination.mjs';
export const RECEIVED_MESSAGE='Your details have already been received.';
const key=page=>'lead-receipt:'+String(page._id||page.slug);
const memory=new Map();
export function readLeadReceipt(page){
 if(!page?.slug)return null;
 let receipt=memory.get(key(page));
 try{receipt=receipt||JSON.parse(sessionStorage.getItem(key(page))||'null');}catch{}
 if(!receipt){try{const last=Number(localStorage.getItem('submitted_'+page.slug));if(last&&Date.now()-last<120000)receipt={received:true};}catch{}}
 return receipt?.received?{received:true,destination:leadDestination(page)||safeLeadDestination(receipt.destination)}:null;
}
export function rememberLeadReceipt(page,destination){
 const receipt={received:true,destination:safeLeadDestination(destination)||leadDestination(page)};
 memory.set(key(page),receipt);
 try{sessionStorage.setItem(key(page),JSON.stringify(receipt));}catch{}
 return receipt;
}
export function showLeadReceipt(form,receipt){
 if(!form||!receipt)return;
 let panel=form.querySelector('[data-lead-receipt]');
 if(!panel){
  const original=form.querySelector('button[type="submit"],button,input[type="submit"]');
  const button=document.createElement('button');button.type='button';button.textContent='Continue';
  if(original){button.className=original.className;button.style.cssText=original.style.cssText;}
  button.disabled=false;button.style.opacity='1';button.style.cursor='pointer';button.style.display='';
  panel=document.createElement('div');panel.dataset.leadReceipt='true';
  const message=document.createElement('p');message.setAttribute('role','status');message.textContent=RECEIVED_MESSAGE;
  panel.append(message);if(receipt.destination){button.onclick=()=>window.location.assign(receipt.destination);panel.append(button);}
  for(const child of [...form.children])child.hidden=true;
  form.append(panel);
 }
}
