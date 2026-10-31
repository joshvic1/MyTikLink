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
 vm.runInNewContext(code,{module,exports:module.exports,console,URL,JSON,FormData,require(specifier){
  if(specifier.endsWith('.css'))return new Proxy({},{get:(_,key)=>String(key)});
  if(specifier.endsWith('/api'))return {apiRequest:async()=>({success:true})};
  if(specifier.startsWith('.')){const base=path.resolve(path.dirname(filename),specifier);return load([base,base+'.js',base+'.jsx'].find(p=>fs.existsSync(p)));}
  return require(require.resolve(specifier,{paths:[root]}));
 }});return module.exports;
}
(async()=>{
 await swc.loadBindings();
 const model=load(path.join(root,'V1.1/landing/themeModel.js'));
 const catalog=load(path.join(root,'V1.1/landing/themeLibrary.js'));
 const Renderer=load(path.join(root,'V1.1/landing/ThemeRenderer.jsx')).default;
 const registryText=fs.readFileSync(path.join(root,'../backend/V1.1/onboarding/categoryRegistry.js'),'utf8');
 const registry=JSON.parse(registryText.slice(registryText.indexOf('['),registryText.indexOf('];')+1));
 test('exactly ten canonical demos, five ACTION and five LEAD; independent instances',()=>{
  assert.equal(registry.length,735);assert.equal(catalog.phaseOneThemes.length,10);
  assert.equal(catalog.phaseOneThemes.filter(t=>t.variant==='lead').length,5);
  for(const theme of catalog.phaseOneThemes){for(const id of theme.categoryIds)assert.ok(registry.some(c=>c.id===id),id);const a=model.createThemeInstance(theme),b=model.createThemeInstance(theme);a.sections[0].title='Changed';assert.notEqual(b.sections[0].title,a.sections[0].title);assert.notEqual(theme.sectionRecipe[0].title,a.sections[0].title);}
 });
 test('all published LEAD render name, WhatsApp and consent; ACTION render no forms',()=>{
  for(const theme of catalog.phaseOneThemes){const instance=model.createThemeInstance(theme);const html=renderToStaticMarkup(React.createElement(Renderer,{instance,page:{slug:'fixture'}}));assert.equal((html.match(/<form/g)||[]).length,theme.hasForm?1:0,theme.id);if(theme.hasForm){assert.match(html,/name="name"/);assert.match(html,/name="whatsapp"/);assert.match(html,/type="checkbox"/);}const preview=renderToStaticMarkup(React.createElement(Renderer,{instance,preview:true}));assert.equal((preview.match(/<form/g)||[]).length,theme.hasForm?1:0);if(theme.hasForm)assert.match(preview,/disabled/);}
 });
 test('brand button text exceeds 4.5:1 across dark, pale, saturated and midtone colours',()=>{
  for(const color of ['#000000','#ffffff','#ffff00','#777777','#ff0000','#111144','#eeeeff','#00ff00']){const t=model.brandTokens(color);const linear=color.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);const l=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;assert.ok((t.onAccent==='#000000'?(l+.05)/.05:1.05/(l+.05))>=4.5,color);}
 });
 test('category relations, keyword aliases, variants and unsafe URLs',()=>{
  assert.equal(catalog.recommendedThemes({categoryId:'food-beverages/restaurants',registry})[0].id,'restaurant-visual-menu');
  assert.equal(catalog.recommendedThemes({categoryId:'hair-grooming/barbershops',registry})[0].id,'beauty-cinematic-hero');
  assert.equal(catalog.recommendedThemes({form:'lead',registry}).length,5);
  assert.ok(catalog.recommendedThemes({query:'barbershops',registry}).some(t=>t.id==='beauty-cinematic-hero'));
  for(const value of ['javascript:alert(1)','//evil.test','data:text/html,test'])assert.equal(model.safeUrl(value),'');
  assert.equal(model.safeUrl('https://example.com'),'https://example.com');assert.equal(model.safeUrl('#enquiry'),'#enquiry');
 });
 test('profile prefill and page colour override survive JSON persistence',()=>{
  const a=model.createThemeInstance(catalog.phaseOneThemes[0],{publicName:'Test studio',brand:{preferredColor:'#123456',description:'Public description',imageUrl:'https://example.com/logo.png'},whatsappNumber:'+2348012345678'});a.colorOverride='#fafafa';const saved=JSON.parse(JSON.stringify(a));assert.equal(saved.name,'Test studio');assert.equal(saved.sections[0].description,'Public description');assert.equal(saved.colorOverride,'#fafafa');assert.equal(saved.profileColor,'#123456');assert.equal(saved.ownerWhatsapp,'+2348012345678');
 });
})();
