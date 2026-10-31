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
 const {universalProfileTemplate:template}=load(path.join(root,'V1.1/landing/universalTemplate.js'));
 const {resolvePersonalization,validDestination}=load(path.join(root,'V1.1/landing/personalization.js'));
 const Renderer=load(path.join(root,'V1.1/landing/ThemeRenderer.jsx')).default;
 const manifest=require(path.join(root,'V1.1/media/category-covers.generated.json'));
 const ready=Object.keys(manifest.entries);
 const html=instance=>renderToStaticMarkup(React.createElement(Renderer,{instance}));
 const make=profile=>model.createThemeInstance(template,profile);
 const cases=[
 ['Hair vendor with uploaded logo',{publicName:'Hair studio',category:{id:'hair-grooming'},brand:{imageUrl:'https://example.com/logo.png'}}],
 ['Restaurant without logo',{publicName:'Kitchen',category:{id:'food-beverages/restaurants',label:'Restaurants'}}],
 ['Jewelry with custom colour',{publicName:'Jewelry',brand:{preferredColor:'#ffff00'}}],
 ['Consultant with long name',{publicName:'A very long consultancy and advisory business name that must wrap without clipping',category:{label:'Consultant'}}],
 ['Creator with profile photo',{accountType:'creator',publicName:'Ada',brand:{imageUrl:'https://example.com/portrait.jpg'}}],
 ['Organization without description',{accountType:'business',publicName:'Community organization'}],
 ['Category without exact image',{category:{id:`${ready.find(id=>!id.includes('/'))}/missing`}}],
 ['No Instagram',{publicName:'Private studio',whatsappNumber:'+234 801 234 5678'}],
 ['Custom button destinations',{customActions:[{id:'portfolio',kind:'link',label:'My work',url:'https://example.com/work'}]}],
 ['Saved edits after creation',{publicName:'Original',brand:{description:'Original bio'}}]
 ];
 for(const [name,profile] of cases)test(name,()=>{
  const instance=make(profile); const data=instance.personalization;
  assert.match(html(instance),/data-template="universal-profile"/);
  assert.equal(instance.renderer,'universal-profile');
  if(name.startsWith('Hair'))assert.equal(data.profileFit,'contain');
  if(name.startsWith('Restaurant'))assert.equal(data.profileImageUrl,'');
  if(name.startsWith('Jewelry'))assert.match(html(instance),/--brandContrast:#000000/);
  if(name.startsWith('Consultant'))assert.ok(html(instance).includes(profile.publicName));
  if(name.startsWith('Creator'))assert.equal(data.profileFit,'cover');
  if(name.startsWith('Organization'))assert.equal(data.description,'Connect with Community organization.');
  if(name.startsWith('Category'))assert.ok(data.categoryAssets.length);
  if(name.startsWith('No Instagram')){assert.ok(!html(instance).includes('Follow on Instagram'));assert.match(html(instance),/https:\/\/wa.me\/2348012345678/);}
  if(name.startsWith('Custom'))assert.match(html(instance),/href="https:\/\/example.com\/work"/);
  if(name.startsWith('Saved')){data.displayName='Edited';data.description='';profile.publicName='Changed account';const saved=JSON.parse(JSON.stringify(instance));assert.equal(saved.personalization.displayName,'Edited');assert.equal(saved.personalization.description,'');assert.match(html(saved),/Edited/);}
 });
 test('Overrides, unsafe links, trusted badge boundary and R2 responsive sources',()=>{
  const data=resolvePersonalization({template,profile:{publicName:'Profile'},overrides:{displayName:'Override',description:''}});
  assert.equal(data.displayName,'Override');assert.equal(data.description,'');
  for(const url of ['javascript:alert(1)','//evil.com','https://user:password@example.com','https://'])assert.equal(validDestination(url),'');
  assert.equal(validDestination('https://example.com','instagram'),'');
  assert.equal(validDestination('https://www.instagram.com/brand','instagram'),'https://www.instagram.com/brand');
  const instance=make({category:{id:ready[0]},verified:true});instance.personalization.verified=true;
  const markup=html(instance);assert.ok(!markup.includes('Verified account'));assert.match(markup,/image\/avif/);assert.match(markup,/r2.dev/);
 });
 test('All category descriptions have three lines and follow snapshot priorities',()=>{
  const lookup=require(path.join(root,'V1.1/landing/categoryDescriptions.generated.json'));
  assert.equal(Object.keys(lookup).length,735);
  const source=fs.readFileSync(path.join(root,'../backend/V1.1/onboarding/categoryRegistry.js'),'utf8');
  const categories=JSON.parse(source.slice(source.indexOf('['),source.indexOf('];')+1));
  for(const category of categories){assert.equal(lookup[category.id],category.defaultDescription);assert.equal(category.defaultDescription.split('\n').filter(Boolean).length,3);assert.ok(category.defaultDescription.length<400);assert.equal(make({category:{id:category.id}}).personalization.description,category.defaultDescription);}
  const profile={category:{id:'hair-grooming/wigs'},brand:{description:'My own words'}};
  assert.equal(make(profile).personalization.description,'My own words');
  assert.equal(resolvePersonalization({template,profile,overrides:{description:''}}).description,'');
  const saved=make({category:{id:'hair-grooming/wigs'}});saved.personalization.description='Edited by the owner';
  assert.equal(JSON.parse(JSON.stringify(saved)).personalization.description,'Edited by the owner');
 });
 test('Lightweight cards personalize categories without forms, links or screenshot assets',()=>{
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const categoryId of ['agriculture-farming','pets-animals','hair-grooming/wigs','missing-category']){
   const data=make({publicName:'My own brand',category:{id:categoryId},brand:{preferredColor:'#ffff00'}}).personalization;
   const markup=renderToStaticMarkup(React.createElement(Card,{data}));
   assert.match(markup,/My own brand/);assert.match(markup,/--preview-brand:#ffff00/);
   assert.ok(!markup.includes('<form'));assert.ok(!markup.includes('<a '));assert.ok(!markup.includes('template-covers/'));
   if(data.categoryAssets.length){assert.match(markup,/400.webp/);assert.match(markup,/loading="lazy"/);}
   assert.ok(!markup.includes('1600.webp'));
  }
 });
 test('Spotlight uses shared personalization, correct action styles and editable highlights',()=>{
  const spotlight=load(path.join(root,'V1.1/landing/universalTemplate.js')).spotlightProfileTemplate;
  for(const id of ['food-beverages/restaurants','agriculture-farming','pets-animals']){
   const instance=model.createThemeInstance(spotlight,{publicName:'My business',category:{id},brand:{preferredColor:'#256344'},whatsappNumber:'+2348012345678'});
   assert.equal(instance.personalization.brandColor,'#256344');assert.equal(instance.personalization.categoryId,id);
   assert.equal(instance.personalization.highlights.length,0);
   assert.equal(instance.personalization.actions.find(a=>a.kind==='whatsapp').style,'outline');
   instance.personalization.highlights=[{label:'My detail',icon:'shop'}];
   const markup=html(instance);assert.match(markup,/data-template="spotlight-profile"/);assert.match(markup,/My detail/);assert.match(markup,/https:\/\/wa.me\/2348012345678/);assert.ok(!markup.includes('Verified account'));assert.ok(!markup.includes('<form'));
  }
 });
 test('All 735 categories provide ten ranked CTAs with WhatsApp first and optional Instagram',()=>{
  const {getCategoryActions}=load(path.join(root,'V1.1/landing/categoryActions.js'));
  const source=fs.readFileSync(path.join(root,'../backend/V1.1/onboarding/categoryRegistry.js'),'utf8');
  const categories=JSON.parse(source.slice(source.indexOf('['),source.indexOf('];')+1));
  assert.equal(categories.length,735);
  for(const category of categories){
   const actions=getCategoryActions(category.id);assert.equal(actions.length,10);assert.equal(new Set(actions.map(a=>a.id)).size,10);
   assert.equal(JSON.stringify(actions),JSON.stringify(category.defaultActions.map(({rank,hot,...a})=>({...a,rank,hot}))));
   assert.equal(actions[0].label,'Chat on WhatsApp');assert.equal(actions[0].hot,true);assert.equal(actions[0].rank,1);
   assert.equal(actions[9].label,'Follow on Instagram');assert.equal(actions[9].optional,true);
   if(/consult|coaching/.test(category.id))assert.equal(actions[1].label,'Book a Session');
   const instance=make({category:{id:category.id}});assert.equal(instance.personalization.actions[0].kind,'whatsapp');assert.equal(instance.personalization.actions[0].label,'Chat on WhatsApp');
   assert.ok(!html(instance).includes('href="https://wa.me/'));
  }
  const instance=make({category:{id:'hair-grooming/wigs'},actionUrls:{'shop-wigs':'https://example.com/wigs'}});
  assert.equal(instance.personalization.actions[1].url,'https://example.com/wigs');
 });
 test('Service Profile forces category photo in both renderer and lightweight card',()=>{
  const template=load(path.join(root,'V1.1/landing/universalTemplate.js')).serviceProfileTemplate;
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  const instance=model.createThemeInstance(template,{publicName:'My service',category:{id:ready[0]},brand:{imageUrl:'https://example.com/ignored-logo.png',preferredColor:'#08783e'}});
  const markup=html(instance);assert.match(markup,/data-template="service-profile"/);assert.match(markup,/SERVICE PAGE/);assert.match(markup,/category photograph/);assert.ok(!markup.includes('ignored-logo'));assert.ok(!markup.includes('128 client reviews'));
  const card=renderToStaticMarkup(React.createElement(Card,{data:instance.personalization,layout:'service'}));assert.match(card,/data-preview-layout="service"/);assert.ok(!card.includes('ignored-logo'));assert.match(card,/400.webp/);
 });
 test('Campaign shares category defaults, editable headline, safe actions and lightweight preview',()=>{
  const template=load(path.join(root,'V1.1/landing/universalTemplate.js')).campaignProfileTemplate;
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const category of [{id:'agriculture-farming',label:'Agriculture & Farming'},{id:'fitness-wellness/wellness-coaching',label:'Wellness Coaching'}]){
   const instance=model.createThemeInstance(template,{publicName:'My brand',category,brand:{preferredColor:'#ffff00'},whatsappNumber:'+2348012345678'});
   assert.equal(instance.personalization.actions[0].kind,'whatsapp');assert.equal(instance.personalization.headline,`Discover ${category.label}`);assert.equal(instance.personalization.actions.length,1);
   instance.personalization.headline='My edited headline';const markup=html(instance);
   assert.match(markup,/data-template="campaign-profile"/);assert.match(markup,/My edited headline/);assert.match(markup,/--brandContrast:#000000/);assert.ok(!markup.includes('KUDA'));
   const card=renderToStaticMarkup(React.createElement(Card,{data:instance.personalization,layout:'campaign'}));assert.match(card,/data-preview-layout="campaign"/);assert.match(card,/My edited headline/);assert.match(card,/400.webp/);assert.ok(!card.includes('<form'));
  }
 });
 test('Rhythm Grid reuses the category image in three slots with one CTA',()=>{
  const template=load(path.join(root,'V1.1/landing/universalTemplate.js')).rhythmGridTemplate;
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const id of ['education-training/music-schools','agriculture-farming']){
   const instance=model.createThemeInstance(template,{publicName:'My brand',category:{id},brand:{preferredColor:'#287444'},whatsappNumber:'+2348012345678'});
   assert.equal(instance.personalization.media.length,3);assert.equal(instance.personalization.actions.length,1);
   const markup=html(instance);assert.match(markup,/data-template="rhythm-grid"/);assert.equal((markup.match(/data-media-slot=/g)||[]).length,3);assert.equal((markup.match(/href="https:\/\/wa.me/g)||[]).length,1);
   const card=renderToStaticMarkup(React.createElement(Card,{data:instance.personalization,layout:'rhythm'}));assert.equal((card.match(/data-media-slot=/g)||[]).length,3);assert.equal((card.match(/Chat on WhatsApp/g)||[]).length,1);assert.match(card,/400.webp/);
  }
 });
 test('Studio Pass personalizes its photo panel and one WhatsApp action',()=>{
  const template=load(path.join(root,'V1.1/landing/universalTemplate.js')).studioPassTemplate;
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const id of ['education-training/music-schools','agriculture-farming','missing-category']){
   const instance=model.createThemeInstance(template,{publicName:'My brand',category:{id},brand:{preferredColor:'#ffff00'},whatsappNumber:'+2348012345678'});
   assert.equal(instance.personalization.actions.length,1);instance.personalization.headline='My headline';
   const markup=html(instance);assert.match(markup,/data-template="studio-pass"/);assert.match(markup,/<h1[^>]*>My headline/);assert.equal((markup.match(/href="https:\/\/wa.me/g)||[]).length,1);assert.match(markup,/--brandContrast:#000000/);
   const card=renderToStaticMarkup(React.createElement(Card,{data:instance.personalization,layout:'studio'}));assert.match(card,/data-preview-layout="studio"/);assert.equal((card.match(/Chat on WhatsApp/g)||[]).length,1);assert.ok(!card.includes('<form'));if(id!=='missing-category')assert.match(card,/400.webp/);
  }
 });
 test('Personal Intro and Enquiry Desk share category snapshots and working published forms, with inert cards',()=>{
  const defs=load(path.join(root,'V1.1/landing/universalTemplate.js'));
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const definition of [defs.personalIntroTemplate,defs.enquiryDeskTemplate]) {
   const profile={publicName:'Greenfield Farms',category:{id:'agriculture-farming',label:'Agriculture & Farming'},brand:{preferredColor:'#287444',description:'Our saved brand description'}};
   const instance=model.createThemeInstance(definition,profile);
   assert.equal(instance.variant,'lead');assert.equal(instance.personalization.description,profile.brand.description);
   assert.ok(instance.personalization.categoryAssets.length);assert.equal(instance.personalization.brandColor,'#287444');
   const html=renderToStaticMarkup(React.createElement(Renderer,{instance,page:{slug:'test-farm'}}));
   assert.match(html,/name="name"/);assert.match(html,/name="whatsapp"/);assert.match(html,/Fill the form below/);assert.doesNotMatch(html,/type="checkbox"|LET’S TALK|disabled=""/);
   assert.match(html,/Greenfield Farms/);assert.match(html,/Our saved brand description/);
   const preview=renderToStaticMarkup(React.createElement(Renderer,{instance,preview:true}));assert.doesNotMatch(preview,/disabled=""/);
   const unpublished=renderToStaticMarkup(React.createElement(Renderer,{instance}));assert.doesNotMatch(unpublished,/disabled=""/);
   const card=renderToStaticMarkup(React.createElement(Card,{data:instance.personalization,layout:definition.preview.cardLayout}));
   assert.doesNotMatch(card,/<form|<input|<button|<a /);assert.match(card,/Greenfield Farms/);assert.match(card,/400.webp/);assert.match(card,/Fill the form below/);
   instance.personalization.form.submitLabel='Contact the farm';assert.equal(model.createThemeInstance(definition,profile).personalization.form.submitLabel,definition.defaultForm.submitLabel);
  }
 });
 test('minimal callback templates preserve personalization with less copy and safe interactive previews',()=>{
  const defs=load(path.join(root,'V1.1/landing/universalTemplate.js'));
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const definition of [defs.contactSheetTemplate,defs.sideNoteTemplate]){
   const instance=model.createThemeInstance(definition,{publicName:'Our Farm',category:{id:'agriculture-farming',label:'Agriculture'},brand:{preferredColor:'#287444',description:'Optional brand description'}});
   assert.equal(instance.variant,'lead');assert.equal(instance.personalization.visibility.description,false);
   const html=renderToStaticMarkup(React.createElement(Renderer,{instance,page:{slug:'farm'}}));
   assert.match(html,/Our Farm/);assert.match(html,/#287444/);assert.match(html,/name="whatsapp"/);assert.doesNotMatch(html,/Optional brand description|type="checkbox"|disabled=""/);
   const card=renderToStaticMarkup(React.createElement(Card,{data:instance.personalization,layout:definition.preview.cardLayout}));
   assert.match(card,/Our Farm/);assert.match(card,/400.webp/);assert.doesNotMatch(card,/<form|<input|<button|Optional brand description/);
   instance.personalization.visibility.description=true;
   assert.match(renderToStaticMarkup(React.createElement(Renderer,{instance,preview:true})),/Optional brand description/);
  }
 });
 test('product templates use category imagery, selection counts and safe enquiry destinations',()=>{
  const defs=load(path.join(root,'V1.1/landing/universalTemplate.js'));
  const {productEnquiryUrl,addProduct}=load(path.join(root,'V1.1/landing/productModel.js'));
  const images=load(path.join(root,'V1.1/media/categoryImages.js'));
  assert.ok(images.relatedCategoryCovers('hair-grooming').every(a=>a.categoryId.startsWith('hair-grooming/')));
  const Card=load(path.join(root,'V1.1/landing/PersonalizedPreview.jsx')).default;
  for(const definition of [defs.productSpotlightTemplate,defs.curatedShelfTemplate]){
   const instance=model.createThemeInstance(definition,{publicName:'Our Products',category:{id:'agriculture-farming',label:'Agriculture'},whatsappNumber:'+2348012345678',brand:{preferredColor:'#287444'}});
   const data=instance.personalization;
   assert.equal(data.products.length,definition.id==='curated-shelf'?4:1);assert.equal(data.products[0].assets[0].categoryId,'agriculture-farming');
   assert.ok(data.products.every(p=>/^₦[\d,]+$/.test(p.price)));
   let counts=addProduct({},data.products[0].id);counts=addProduct(counts,data.products[0].id);assert.equal(counts[data.products[0].id],2);
   assert.match(decodeURIComponent(productEnquiryUrl(data,counts)),/Agriculture × 2/);
   assert.equal(productEnquiryUrl({...data,enquiryUrl:'https://example.com/enquire'},counts),'https://example.com/enquire');
   assert.match(productEnquiryUrl({...data,enquiryUrl:'javascript:alert(1)'},counts),/^https:\/\/wa.me/);
   assert.equal(productEnquiryUrl({...data,whatsappNumber:''}), '');
   const html=renderToStaticMarkup(React.createElement(Renderer,{instance}));assert.match(html,/Our Products/);assert.doesNotMatch(html,/Cups|Vases|Clay &amp; Co/);
   const card=renderToStaticMarkup(React.createElement(Card,{data,layout:definition.preview.cardLayout}));assert.doesNotMatch(card,/<button|<form|<input/);assert.match(card,/400.webp/);
  }
 });
 test('Registry adds one universal design and preserves twenty demos',()=>{
  const catalog=load(path.join(root,'V1.1/landing/themeLibrary.js'));
  assert.equal(catalog.allThemes.length,32);assert.equal(catalog.recommendedThemes({batch:'universal'}).length,12);
 });
})();
