export function messageParts(value){
 const text=String(value||''),parts=[];let offset=0;
 const pattern=/(?:https?:\/\/|www\.)[^\s<>"']+/gi;
 for(const match of text.matchAll(pattern)){
  let label=match[0].replace(/[.,!?;:]+$/,'');
  while(label.endsWith(')')&&(label.match(/\)/g)||[]).length>(label.match(/\(/g)||[]).length)label=label.slice(0,-1);
  const href=label.startsWith('www.')?'https://'+label:label;
  try{const u=new URL(href);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||!u.hostname)continue;}catch{continue;}
  if(match.index>offset)parts.push({text:text.slice(offset,match.index)});
  parts.push({text:label,href});offset=match.index+label.length;
 }
 if(offset<text.length)parts.push({text:text.slice(offset)});
 return parts;
}
