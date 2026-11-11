const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
async function fixture(businessFocus='not_sure'){
 const swc=require(root+'/node_modules/next/dist/build/swc');await swc.loadBindings();
 const state=[],effects=[],calls=[];let cursor=0;
 const account={accountType:'creator',businessFocus,businessMode:'digital',publicName:'Florahfoods Beverages',category:{id:'food-beverages',label:'Food & Beverages'}};
 const react={useState(value){const i=cursor++;if(!(i in state))state[i]=value;return[state[i],next=>state[i]=typeof next==='function'?next(state[i]):next];},useRef(value){const i=cursor++;return state[i]||(state[i]={current:value});},useEffect(fn,deps){const i=cursor++;if(!state[i]||deps.some((v,j)=>v!==state[i][j]))effects.push(fn);state[i]=deps;}};
 const labels={physical_products:'Physical products',physical_services:'Physical services',digital_products:'Digital products',digital_services:'Digital services'};
 const themes={atelier:{name:'Atelier',businessFocus:['physical_products']},digital:{name:'Digital',businessFocus:['digital_products']}};
 const module={exports:{}};
 const code=swc.transformSync(fs.readFileSync(root+'/V1.1/pages/StoreSetupPage.jsx','utf8'),{filename:'StoreSetupPage.jsx',jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,setTimeout:fn=>{fn();return 1;},setInterval:()=>1,clearInterval(){},require(spec){
  if(spec==='react')return react;
  if(spec==='next/router')return {useRouter:()=>({replace(){},push(){}})};
  if(spec.endsWith('/api'))return {v11Api:{onboarding:async()=>({data:account}),saveOnboardingStage:async(stage,body)=>{calls.push({stage,body});}},apiRequest:async(url,options)=>{if(options)calls.push({url,body:JSON.parse(options.body)});return {setup:{name:account.publicName,categoryId:account.category.id,businessFocus}};}};
  if(spec.endsWith('themeRecommendations'))return {businessFocusLabels:labels,recommendedStoreThemes:(all,{businessFocus})=>Object.entries(all).filter(([,t])=>t.businessFocus.includes(businessFocus))};
  if(spec.endsWith('/design'))return {themes};
  if(spec.endsWith('categoryImages'))return {getCategoryCover:()=>null,coverSources:()=>null};
  if(spec.endsWith('Notifications'))return {notify:{warning:m=>calls.push({warning:m}),error:m=>calls.push({error:m})}};
  if(spec.endsWith('/UI'))return {Modal:'modal',Button:'button'};
  if(spec.endsWith('.css'))return {};
  if(spec.startsWith('../'))return {default:()=>null,__esModule:true};
  return require(require.resolve(spec,{paths:[root]}));
 }});
 const nodes=n=>!n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)];
 const render=()=>{cursor=0;const tree=module.exports.default({});while(effects.length)effects.shift()();return {tree,nodes:nodes(tree)};};
 render();await new Promise(setImmediate);
 return {render,calls};
}
for(const value of ['not_sure',''])test(`saved category with ${value||'missing'} focus can choose a business storefront without leaving picker`,async()=>{
 const f=await fixture(value);let view=f.render();
 assert.ok(view.nodes.some(n=>n.props?.['aria-label']==='What your store sells'));
 assert.equal(view.tree.props.footer.props.disabled,true);
 view.nodes.find(n=>n.props?.['aria-label']==='Store account type').props.onChange({target:{value:'business'}});
 view=f.render();view.nodes.find(n=>n.props?.['aria-label']==='What your store sells').props.onChange({target:{value:'physical_products'}});
 view=f.render();view.nodes.find(n=>n.props?.['aria-label']==='Select Atelier').props.onClick();
 view=f.render();assert.equal(view.tree.props.footer.props.disabled,false);await view.tree.props.footer.props.onClick();
 assert.equal(f.calls[0].stage,'identity');assert.equal(f.calls[0].body.categoryId,'food-beverages');assert.equal(f.calls[0].body.accountType,'business');assert.equal(f.calls[0].body.businessMode,'physical');assert.equal(f.calls[0].body.businessFocus,'physical_products');assert.equal(f.calls[1].body.theme,'atelier');
});
test('existing supported focus keeps template selection and does not rewrite identity',async()=>{
 const f=await fixture('digital_products');let view=f.render();assert.ok(!view.nodes.some(n=>n.props?.['aria-label']==='What your store sells'));view.nodes.find(n=>n.props?.['aria-label']==='Select Digital').props.onClick();view=f.render();await view.tree.props.footer.props.onClick();assert.equal(f.calls.length,1);assert.equal(f.calls[0].body.theme,'digital');
});
