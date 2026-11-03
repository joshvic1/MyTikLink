import {useRef,useState} from "react";
export default function useEditorTools(instance,onChange,setMode){
 const controls=useRef(null);
 const root=useRef(null),past=useRef([]),future=useRef([]);const [,refresh]=useState(0);
 const change=next=>{past.current.push(instance);if(past.current.length>80)past.current.shift();future.current=[];onChange(next);refresh(n=>n+1);};
 const undo=()=>{if(!past.current.length)return;future.current.push(instance);onChange(past.current.pop());refresh(n=>n+1);};
 const redo=()=>{if(!future.current.length)return;past.current.push(instance);onChange(future.current.pop());refresh(n=>n+1);};
 const editText=event=>{
 const preview=event.target.closest('[data-editor-preview]');if(!preview)return;
 event.preventDefault();event.stopPropagation();
 const normalize=v=>String(v||'').replace(/\s+/g,' ').trim();
 const fields=[...controls.current.querySelectorAll('input:not([type=file]):not([type=color]):not([type=checkbox]),textarea')];
 let node=event.target,match;
 const button=event.target.closest('[data-editor-button],button,a');
 if(button){
 const copy=button.cloneNode(true);copy.querySelectorAll('[aria-hidden="true"],svg').forEach(icon=>icon.remove());
 const text=normalize(button.dataset.editorButton || copy.textContent);
 match=fields.find(field=>normalize(field.value)===text);
 }

 const region=event.target.closest('[data-editor-image]');
 const image=event.target.closest('img') || region?.querySelector('img');
 const cards=[...controls.current.querySelectorAll('[data-image-editor]')];
 let card;
 if(region)card=cards.find(item=>item.dataset.imageEditor===region.dataset.editorImage);
 if(!card&&image){const sources=[image.getAttribute('src'),image.currentSrc];card=cards.find(item=>item.dataset.imageValue&&sources.includes(item.dataset.imageValue));}
 if(!card&&image){const hint=image.alt||'';card=cards.find(item=>/profile|avatar|logo/i.test(hint)?/profile|avatar|logo/i.test(item.dataset.imageEditor):/cover|image/i.test(item.dataset.imageEditor)) || cards[0];}
 if(card)match=card.querySelector('input[type=url]') || card.querySelector('[data-image-focus]') || card;

 while(node&&node!==preview&&!match){const text=normalize(node.textContent);if(text)match=fields.find(field=>normalize(field.value)===text);node=node.parentElement;}
 if(!match)return;
 // The modal portals its controls, so resolve the field again after it mounts.
 const selector='input:not([type=file]):not([type=color]):not([type=checkbox]),textarea';
 const fieldIndex=fields.indexOf(match),cardIndex=cards.indexOf(card);
 setMode('edit');requestAnimationFrame(()=>requestAnimationFrame(()=>{
 const panel=controls.current;if(!panel)return;
 const imageCard=cardIndex>=0?panel.querySelectorAll('[data-image-editor]')[cardIndex]:null;
 const target=imageCard?(imageCard.querySelector('input[type=url]') || imageCard.querySelector('[data-image-focus]') || imageCard):panel.querySelectorAll(selector)[fieldIndex];
 if(!target)return;
 let parent=target.parentElement;while(parent&&parent!==panel){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
 target.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});target.focus({preventScroll:true});
 }));
 };
 return {root,controls,change,undo,redo,canUndo:past.current.length>0,canRedo:future.current.length>0,editText};
}
