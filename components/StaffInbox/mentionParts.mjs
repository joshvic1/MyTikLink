// Only server-validated staff identities are styled. Labels are saved with the note.
export function mentionParts(value,mentions=[]){
 const text=String(value||''),spans=[];
 for(const token of mentions){
  if(!token?.staff||!token.label?.startsWith('@')||token.label.length<2)continue;
  let start=-1;
  while((start=text.indexOf(token.label,start+1))!==-1){
   const before=text[start-1],after=text[start+token.label.length];
   if(before&&!/[\s([{]/.test(before)||after&&!/[\s.,!?;:)\]}]/.test(after))continue;
   spans.push({start,end:start+token.label.length,staff:String(token.staff)});
  }
 }
 spans.sort((a,b)=>a.start-b.start||b.end-a.end);
 const parts=[];let end=0;
 for(const span of spans){if(span.start<end)continue;if(span.start>end)parts.push({text:text.slice(end,span.start)});parts.push({text:text.slice(span.start,span.end),staff:span.staff});end=span.end;}
 if(end<text.length||!parts.length)parts.push({text:text.slice(end)});
 return parts;
}
