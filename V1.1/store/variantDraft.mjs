export function buildVariants(draft,existing=[]){
 const groups=[],names=new Set();let rows=[{}];
 for(const group of draft){
  const name=group.name.trim(),options=[...new Set((group.optionsText??(group.options||[]).join(',')).split(',').map(v=>v.trim()).filter(Boolean))];
  if(!name||!options.length)return {error:'Give each option a name and at least one value.'};
  if(names.has(name.toLowerCase()))return {error:'Use a different name for each option.'};
  names.add(name.toLowerCase());
  if(rows.length*options.length>100)return {error:'Use no more than 100 combinations.'};
  groups.push({name,options,...(group.kind?{kind:group.kind}:{}),...(group.swatches?{swatches:group.swatches.filter(s=>options.includes(s.value))}: {})});rows=rows.flatMap(row=>options.map(value=>({...row,[name]:value})));
 }
 return {groups,inventory:groups.length?rows.map(values=>existing.find(row=>JSON.stringify(row.values)===JSON.stringify(values))||{values,stock:0,sku:''}):[]};
}
