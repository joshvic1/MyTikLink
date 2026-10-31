import manifest from './category-covers.generated.json';
const cloudBase=(manifest.baseUrl||'').replace(/\/$/,'');
function resolve(url,base=cloudBase){return /^https?:\/\//.test(url)?url:`${base}${url}`;}
function expand(id,entry){return {categoryId:id,...entry,width:1600,height:800,variants:['avif','webp'].flatMap(format=>[400,800,1200,1600].map(width=>({format,width,height:width/2,url:resolve(`/category-covers/${entry.assetKey}/${entry.revision}/${width}.${format}`)})))};}
export function getCategoryCover(categoryId,{allowParent=false}={}){
 const id=String(categoryId||'');const exact=manifest.entries[id];
 if(exact)return {...expand(id,exact),match:'exact'};
 if(allowParent&&id.includes('/')){const parentId=id.split('/')[0],parent=manifest.entries[parentId];if(parent)return {...expand(parentId,parent),match:'parent'};}
 return null;
}
export function coverSources(asset,baseUrl=''){
 if(!asset)return null;const base=(baseUrl||cloudBase).replace(/\/$/,'');
 const source=format=>asset.variants.filter(v=>v.format===format).map(v=>`${resolve(v.url,base)} ${v.width}w`).join(', ');
 const fallback=asset.variants.find(v=>v.format==='webp'&&v.width===800)||asset.variants.find(v=>v.format==='webp');
 return {src:resolve(fallback?.url||'',base),avif:source('avif'),webp:source('webp')};
}
export function findCategoryCoverByUrl(url){
 const value=String(url||'');let local=value;
 if(cloudBase&&value.startsWith(cloudBase+'/'))local=value.slice(cloudBase.length);
 if(!local.startsWith('/category-covers/'))return null;
 const found=Object.entries(manifest.entries).find(([id,asset])=>local.startsWith(`/category-covers/${asset.assetKey}/${asset.revision}/`));
 return found?expand(...found):null;
}
export const categoryCoverProgress={ready:manifest.readyCount,total:manifest.expectedCount};

// Pick reviewed images within the selected category branch; never use unrelated stock.
export function relatedCategoryCovers(categoryId){
 const id=String(categoryId||'');
 const rank=key=>Array.from(id+'|'+key).reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
 return Object.keys(manifest.entries).filter(key=>key.startsWith(id+'/')).sort((a,b)=>rank(a)-rank(b)).map(key=>getCategoryCover(key));
}
