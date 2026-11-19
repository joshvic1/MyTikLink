export function selectPreviewSection(event,sections,onSelect){
 const node=event.target.closest('[data-store-section]');if(!node)return;
 const id=node.dataset.storeSection,section=sections.find(s=>s.id===id)||sections.find(s=>s.type===id);if(!section)return;
 const control=event.target.closest('a,button');
 if(event.target.closest('input,textarea,select'))return;
 if(control&&['catalogue','featured','new-arrivals','best-sellers'].includes(section.type))return;
 event.preventDefault();event.stopPropagation();
 onSelect(section.id,control&&['hero','promotion','about','contact'].includes(section.type)?'ctaLabel':undefined);
}
export function announcementEntries(sections,resolve,editing=false){
 return sections.filter(s=>s.type==='announcement'&&s.visible).flatMap(s=>{
  const texts=[s.text?.trim()?s.text:s.title,...(s.items||[]).map(i=>i.text?.trim()?i.text:i.title)].map(v=>resolve(v).trim()).filter(Boolean);
  return(texts.length?texts:editing?['Add your announcement message']:[]).map(text=>({text,id:s.id}));
 });
}
