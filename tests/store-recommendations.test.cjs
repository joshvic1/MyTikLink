const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const swc = require(path.join(root,'node_modules/next/dist/build/swc'));
const React = require(path.join(root,'node_modules/react'));
const {renderToStaticMarkup} = require(path.join(root,'node_modules/react-dom/server'));
const cache = new Map();
function load(filename) {
 filename = path.resolve(filename); if(filename.endsWith('.json'))return JSON.parse(fs.readFileSync(filename,'utf8')); if(cache.has(filename))return cache.get(filename).exports;
 const module = {exports:{}}; cache.set(filename,module);
 const code = swc.transformSync(fs.readFileSync(filename,'utf8'),{filename,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2020'},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,console,URL,JSON,FormData,Intl,process,require(specifier){
  if(specifier.endsWith('.css'))return new Proxy({},{get:(_,key)=>String(key)});
  if(specifier.endsWith('/api'))return {apiRequest:async()=>({success:true})};
  if(specifier==='next/router')return {useRouter:()=>({query:{},isReady:false})};
  if(specifier==='next/head')return {__esModule:true,default:()=>null};
  if(specifier==='react-phone-input-2')return {__esModule:true,default:()=>null};
  if(specifier.endsWith('PublicTracking')||specifier.endsWith('CustomerDrawer'))return {__esModule:true,default:()=>null};
  if(specifier.endsWith('uploadService'))return {};
  if(specifier.endsWith('Breadcrumbs'))return {Breadcrumbs:()=>null};
  if(specifier.startsWith('@/')){const base=path.join(root,specifier.slice(2));return load([base,base+'.js',base+'.jsx'].find(p=>fs.existsSync(p)));}
  if(specifier.startsWith('.')){const base=path.resolve(path.dirname(filename),specifier);return load([base,base+'.js',base+'.jsx'].find(p=>fs.existsSync(p)));}
  return require(require.resolve(specifier,{paths:[root]}));
 }});return module.exports;
}
(async()=>{
 await swc.loadBindings();
 const {themes,defaultDesign}=load(path.join(root,'V1.1/store/design.js'));
 const PublicStore=load(path.join(root,'V1.1/store/PublicStore.jsx')).default;
 test('Forme supports product and service actions without mixing checkout types',()=>{
  const Renderer=load(path.join(root,'V1.1/store/StoreRenderer.jsx')).default;
  const store={name:'Mixed business',slug:'mixed',currency:'NGN'};
  const products=[{_id:'physical',slug:'cream',name:'Face cream',price:1000,images:[],productType:'physical'},{_id:'digital',slug:'guide',name:'Beauty guide',price:2000,images:[],productType:'digital'},{_id:'service',slug:'facial',name:'Facial appointment',price:3000,images:[],isService:true,serviceMode:'appointment',durationMinutes:60}];
  const html=renderToStaticMarkup(React.createElement(Renderer,{store,design:defaultDesign('forme'),products}));
  assert.match(html,/Add Face cream to cart/);assert.match(html,/Pay now for Beauty guide/);
  assert.match(html,/href="\/s\/mixed\/services\/facial"/);assert.match(html,/Book appointment/);
  assert.doesNotMatch(html,/Add Facial appointment to cart/);assert.match(html,/Customer account/);assert.match(html,/Open cart/);
  assert.equal(themes.forme.businessFocus.length,4);
 });

 test('Roselle supports product and service actions without mixing checkout types',()=>{
  const Renderer=load(path.join(root,'V1.1/store/StoreRenderer.jsx')).default;
  const store={name:'Mixed business',slug:'mixed',currency:'NGN'};
  const products=[{_id:'physical',slug:'cream',name:'Face cream',price:1000,images:[],productType:'physical'},{_id:'digital',slug:'guide',name:'Beauty guide',price:2000,images:[],productType:'digital'},{_id:'service',slug:'facial',name:'Facial appointment',price:3000,images:[],isService:true,serviceMode:'appointment',durationMinutes:60}];
  const html=renderToStaticMarkup(React.createElement(Renderer,{store,design:defaultDesign('roselle'),products}));
  assert.match(html,/Add Face cream to cart/);assert.match(html,/Pay now for Beauty guide/);
  assert.match(html,/href="\/s\/mixed\/services\/facial"/);assert.match(html,/Book appointment/);
  assert.doesNotMatch(html,/Add Facial appointment to cart/);assert.match(html,/Customer account/);assert.match(html,/Open cart/);
  assert.equal(themes.roselle.businessFocus.length,4);
 });

 test('every storefront theme renders recommendations once and respects the setting',()=>{
  const product={_id:'p1',slug:'main',name:'Main item',price:100,productType:'physical',stock:10,images:[]};
  const related=[{...product,_id:'p2',slug:'other',name:'Related item'}];
  for(const theme of Object.keys(themes))for(const enabled of [true,false]){
   const html=renderToStaticMarkup(React.createElement(PublicStore,{slug:'fixture',productPage:true,initialProduct:product,initialProducts:[product,...related],initialRelated:related,initialData:{store:{name:'Fixture',slug:'fixture',currency:'NGN'},design:defaultDesign(theme),config:{identity:{showRecommendations:enabled},checkout:{},seo:{},categories:[]}}}));
   assert.equal((html.match(/You may also like/g)||[]).length,enabled?1:0,theme+' enabled='+enabled);
   assert.equal((html.match(/Main item<\/h1>/g)||[]).length,1,theme+' product details');
  }
 });
})();
