const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
async function render(data){
 const swc=require(root+'/node_modules/next/dist/build/swc');await swc.loadBindings();let cursor=0;const calls=[];
 const initial=[data,'',false,false,false,'',false,data.cards?.[0]?.id||''];
 const module={exports:{}};
 const code=swc.transformSync(fs.readFileSync(root+'/V1.1/components/RenewalSettings.jsx','utf8'),{filename:'RenewalSettings.jsx',jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,Date,require(spec){
 if(spec==='react')return {useEffect(){},useState(){const i=cursor++;return [initial[i],()=>{}]}};
 if(spec==='../lib/api')return {v11Api:{}};
 if(spec==='../config/plans')return {subscriptionPlans:[{id:'pro',cycles:{monthly:{price:5000},yearly:{price:40000}}}]};
 if(spec==='./SubscriptionModal')return {useSubscription:()=>({openSubscription:value=>calls.push(value)})};
 if(spec==='./UI')return {Button:'button'};
 if(spec.endsWith('.css'))return new Proxy({},{get:(_,k)=>k});
 return require(require.resolve(spec,{paths:[root]}));}});
 const nodes=n=>!n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)];
 const text=n=>typeof n==='string'?n:Array.isArray(n)?n.map(text).join(''):n?.props?text(n.props.children):'';
 return {tree:nodes(module.exports.default({user:data})),text,calls};
}
test('active Pro can register a card through an explicitly disclosed paid renewal',async()=>{
 const f=await render({plan:'pro_monthly',planExpiry:new Date(Date.now()+86400000),cards:[],subscriptions:[]});
 const button=f.tree.find(n=>n.type==='button'&&f.text(n).includes('Add card & activate'));
 assert.ok(button);button.props.onClick();assert.equal(f.calls[0].mode,'renew');assert.equal(f.calls[0].cardOnly,true);
 assert.ok(f.tree.some(n=>f.text(n).includes('charged for one plan period now')));
});
test('eligible existing card retains activation at expiry',async()=>{
 const f=await render({plan:'pro_monthly',planExpiry:new Date(Date.now()+86400000),cards:[{id:'card',plan:'pro_monthly',last4:'1234'}],subscriptions:[]});
 assert.ok(f.tree.some(n=>n.type==='button'&&f.text(n)==='Activate auto-renewal'));
 assert.ok(f.tree.some(n=>f.text(n).includes('when your paid period ends')));
});
test('expired plans clearly label an immediate renewal payment',async()=>{
 const f=await render({plan:'pro_monthly',planExpiry:'2020-01-01',cards:[],subscriptions:[]});
 const button=f.tree.find(n=>n.type==='button'&&f.text(n).includes('Add card & activate'));
 assert.ok(button);button.props.onClick();assert.equal(f.calls.length,1);
 assert.ok(f.tree.some(n=>f.text(n).includes('charged for one plan period now')));
});
