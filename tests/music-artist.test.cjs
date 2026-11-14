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
 const {createThemeInstance}=load(path.join(root,'V1.1/landing/themeModel.js'));
 const {allThemes}=load(path.join(root,'V1.1/landing/themeLibrary.js'));
 const {actionDestination}=load(path.join(root,'V1.1/landing/personalization.js'));
 const Renderer=load(path.join(root,'V1.1/landing/UniversalProfile.jsx')).default;
 const theme=allThemes.find(t=>t.id==='music-artist');
 test('artist template persists nine independent streaming buttons',()=>{
  assert.ok(theme);const a=createThemeInstance(theme,{publicName:'Test artist'}),b=createThemeInstance(theme);
  assert.equal(a.personalization.displayName,'Test artist');assert.equal(a.personalization.actions.length,9);
  a.personalization.actions[0].visible=false;assert.equal(b.personalization.actions[0].visible,true);
  assert.equal(JSON.parse(JSON.stringify(a)).personalization.actions[0].visible,false);
 });
 test('preview includes brand icons; public hides empty, hidden and unsafe links',()=>{
  const instance=createThemeInstance(theme);
  const preview=renderToStaticMarkup(React.createElement(Renderer,{instance,preview:true}));
  for(const a of instance.personalization.actions)assert.ok(preview.includes(`data-action-icon="${a.platform}"`),a.platform);
  let html=renderToStaticMarkup(React.createElement(Renderer,{instance}));assert.ok(!html.includes('data-action-icon="spotify"'));
  const a=instance.personalization.actions[0];a.url='https://open.spotify.com/artist/test';
  html=renderToStaticMarkup(React.createElement(Renderer,{instance}));assert.ok(html.includes(a.url));
  a.visible=false;html=renderToStaticMarkup(React.createElement(Renderer,{instance}));assert.ok(!html.includes(a.url));
  a.visible=true;a.url='javascript:alert(1)';assert.equal(actionDestination(a,instance.personalization),'');
 });
})();
