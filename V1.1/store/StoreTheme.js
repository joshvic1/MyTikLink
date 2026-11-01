import {fontPairings} from './design';
// Shared by page content and portalled cart UI; future themes supply these same tokens.
export function storeThemeStyle(design={}){
 const b=design.brand||{},pair=fontPairings[b.font]||fontPairings.modern,accent=b.accent||'#194d46';
 const rgb=[1,3,5].map(i=>parseInt(accent.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return {'--store-accent':accent,'--store-on-accent':rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.179?'#111':'#fff','--store-body':(fontPairings[b.bodyFont]||pair).body,'--store-heading':(fontPairings[b.headingFont]||pair).heading,'--store-paper':b.surface||(b.background==='dark'?'#171b19':'#fff'),'--store-ink':b.text||(b.background==='dark'?'#fff':'#202420'),'--store-line':b.border||'#e3e5e2','--store-radius':b.radius==='square'?'0px':b.radius==='rounded'?'20px':'8px'};
}
export const productHref=(store,product)=>`/v1-1/s/${encodeURIComponent(store)}/products/${encodeURIComponent(product)}`;
