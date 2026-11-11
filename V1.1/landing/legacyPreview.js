// Keep legacy HTML/CSS intact while connecting its placeholders to editor fields.
export function buildLegacyPreview(template, config, channel) {
 const fields=new Map((template.editableSchema?.fields||[]).map(field=>[field.key,field]));
 const value=key=>{const v=config[key.trim()]??fields.get(key.trim())?.defaultValue;return typeof v==='object'?v?.url||'':String(v??'');};
 const replace=text=>text.replace(/{{(.*?)}}/g,(_,key)=>value(key));
 const doc=new DOMParser().parseFromString(template.html||'','text/html');
 doc.querySelectorAll('script,iframe,object,embed,base,meta[http-equiv]').forEach(node=>node.remove());
 const walk=node=>{
  if(node.nodeType===3){
   if(!node.textContent.includes('{{'))return;
   if(['STYLE','TEXTAREA','TITLE'].includes(node.parentElement?.tagName)){node.textContent=replace(node.textContent);return;}
   const fragment=doc.createDocumentFragment();let offset=0;
   for(const match of node.textContent.matchAll(/{{(.*?)}}/g)){
    fragment.append(doc.createTextNode(node.textContent.slice(offset,match.index)));
    const key=match[1].trim(),span=doc.createElement('span');span.textContent=value(key);
    if(fields.has(key))span.dataset.editorField=key;
    fragment.append(span);offset=match.index+match[0].length;
   }
   fragment.append(doc.createTextNode(node.textContent.slice(offset)));node.replaceWith(fragment);return;
  }
  if(node.nodeType!==1)return;
  if(fields.has(node.getAttribute('data-edit')))node.dataset.editorField=node.getAttribute('data-edit');
  for(const attr of [...node.attributes]){
   if(/^on/i.test(attr.name)||attr.name==='srcdoc'){node.removeAttribute(attr.name);continue;}
   const keys=[...attr.value.matchAll(/{{(.*?)}}/g)].map(match=>match[1].trim()).filter(key=>fields.has(key));
   if(keys.length&&!node.dataset.editorField)node.dataset.editorField=keys.find(key=>fields.get(key).type==='image')||keys[0];
   const resolved=replace(attr.value);
   if(/^(href|src|action|formaction)$/i.test(attr.name)&&/^\s*javascript:/i.test(resolved)){node.removeAttribute(attr.name);continue;}
   node.setAttribute(attr.name,resolved);
  }
  [...node.childNodes].forEach(walk);
 };
 walk(doc.documentElement);
 const nonce=channel.replace(/[^a-zA-Z0-9-]/g,'');
 const policy=doc.createElement('meta');policy.httpEquiv='Content-Security-Policy';policy.content=`script-src 'nonce-${nonce}'; connect-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'`;doc.head.prepend(policy);
 const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';doc.head.append(viewport);
 const style=doc.createElement('style');style.textContent=`body{margin:0}*{box-sizing:border-box}${replace(template.css||'')}\n[data-editor-field]{cursor:pointer}html,body,*{scrollbar-width:none!important}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}`;doc.head.append(style);
 const script=doc.createElement('script');script.setAttribute('nonce',nonce);
 script.textContent=`document.addEventListener('click',function(event){event.preventDefault();event.stopPropagation();var target=event.target.closest('[data-editor-field]');if(target)parent.postMessage({type:'legacy-edit',channel:${JSON.stringify(channel)},key:target.dataset.editorField},'*');},true);document.addEventListener('submit',function(event){event.preventDefault();},true);`;
 doc.body.append(script);
 return '<!doctype html>'+doc.documentElement.outerHTML;
}
