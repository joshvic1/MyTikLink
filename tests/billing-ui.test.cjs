const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
async function fixture(overrides={}){
 const swc=require(root+'/node_modules/next/dist/build/swc');await swc.loadBindings();
 const values=[],refs=[];let cursor=0,refCursor=0;const calls=[];
 const api={initiatePayment:async(...args)=>{calls.push(['card',...args]);return {accessCode:'test-access',paymentId:'test-card-ref'}},initiateTransfer:async body=>{calls.push(['transfer',body]);return {reference:'test-ref',amount:5000,accountNumber:'1234567890',accountName:'Test Account',bankName:'Test Bank',expiresAt:new Date(Date.now()+1500000).toISOString()}},verifyPayment:async()=>({success:false}),...overrides};
 let popup;
 const react={useRef(initial){const i=refCursor++;return refs[i]||(refs[i]={current:initial})},useEffect(){},useState(initial){const i=cursor++;if(!(i in values))values[i]=initial;return[values[i],v=>values[i]=typeof v==='function'?v(values[i]):v]}};
 const module={exports:{}};
 const source=fs.readFileSync(root+'/V1.1/components/UpgradePayment.jsx','utf8');
 const code=swc.transformSync(source,{filename:'UpgradePayment.jsx',jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,setTimeout,clearTimeout,Date,navigator:{clipboard:{writeText:async text=>calls.push(['copy',text])}},window:{PaystackPop:class{resumeTransaction(code,callbacks){popup={code,callbacks}}}},require(spec){if(spec==='react')return react;if(spec==='../lib/api')return {v11Api:api};if(spec==='./UI')return {Button:'button'};if(spec.endsWith('.css'))return new Proxy({},{get:(_,k)=>k});return require(require.resolve(spec,{paths:[root]}))}});
 const nodes=n=>!n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)];
 const props={selected:'pro',cycle:'monthly',plan:{name:'Pro',cycles:{monthly:{price:5000},yearly:{price:40000}}},keepExpiry:false,onBack(){},onSuccess:async()=>calls.push(['success'])};
 const render=()=>{cursor=refCursor=0;return nodes(module.exports.default(props))};
 const text=n=>typeof n==='string'?n:Array.isArray(n)?n.map(text).join(''):n?.props?text(n.props.children):'';
 return {render,calls,props,text,get popup(){return popup}};
}
test('bank transfer is first, renewal starts checked, and unchecking sends false to server',async()=>{const f=await fixture();let tree=f.render();assert.match(f.text(tree.find(n=>n.type==='button'&&f.text(n).includes('Pay with'))),/bank transfer/);const check=tree.find(n=>n.type==='input');assert.equal(check.props.checked,true);check.props.onChange({target:{checked:false}});tree=f.render();await tree.find(n=>n.type==='button'&&f.text(n)==='Pay with card').props.onClick();assert.equal(f.calls[0].at(-1),false);assert.equal(f.popup.code,'test-access');});
test('bank transfer stays in modal and copy uses the generated account details',async()=>{const f=await fixture();await f.render().find(n=>n.type==='button'&&f.text(n).includes('Pay with bank')).props.onClick();let tree=f.render();assert.ok(tree.some(n=>f.text(n)==='1234567890'));await tree.find(n=>n.props?.['aria-label']==='Copy account number').props.onClick();assert.deepEqual(f.calls.at(-1),['copy','1234567890']);assert.equal(f.popup,undefined);});
test('yearly consent states yearly renewal and card-init failure allows retry',async()=>{const f=await fixture({initiatePayment:async()=>{throw new Error('network unavailable')}});f.props.cycle='yearly';let tree=f.render();assert.ok(tree.some(n=>f.text(n).includes('every year')));await tree.find(n=>n.type==='button'&&f.text(n)==='Pay with card').props.onClick();tree=f.render();assert.equal(tree.find(n=>n.type==='button'&&f.text(n)==='Pay with card').props.disabled,false);assert.ok(tree.some(n=>n.props?.role==='alert'));});

test('adding a card from settings offers card checkout only',async()=>{const f=await fixture();f.props.cardOnly=true;const tree=f.render();assert.ok(!tree.some(n=>n.type==='button'&&f.text(n).includes('Pay with bank')));assert.ok(tree.some(n=>n.type==='button'&&f.text(n)==='Pay with card'));assert.equal(tree.find(n=>n.type==='input').props.checked,true);});


test('closing declined card checkout checks the provider and shows its actionable reason and reference',async()=>{
 const f=await fixture({verifyPayment:async ref=>{assert.equal(ref,'test-card-ref');return {success:false,status:'failed',message:'Paystack could not approve this payment after its security checks.'}}});
 await f.render().find(n=>n.type==='button'&&f.text(n)==='Pay with card').props.onClick();await f.popup.callbacks.onCancel();
 const alert=f.render().find(n=>n.props?.role==='alert');assert.match(f.text(alert),/security checks/);assert.match(f.text(alert),/test-card-ref/);assert.ok(!f.calls.some(c=>c[0]==='success'));
});
test('checkout error reconciles a successful payment instead of encouraging a duplicate charge',async()=>{
 const f=await fixture({verifyPayment:async()=>({success:true})});await f.render().find(n=>n.type==='button'&&f.text(n)==='Pay with card').props.onClick();await f.popup.callbacks.onError({message:'popup lost connection'});assert.ok(f.calls.some(c=>c[0]==='success'));
});
test('transfer failures show a support reference without displaying bank details or starting card checkout',async()=>{
 const f=await fixture({initiateTransfer:async()=>{throw Object.assign(new Error('Paystack could not generate a transfer account.'),{details:{reference:'failed-transfer-ref'}})}});
 await f.render().find(n=>n.type==='button'&&f.text(n).includes('Pay with bank')).props.onClick();const tree=f.render();assert.match(f.text(tree.find(n=>n.props?.role==='alert')),/failed-transfer-ref/);assert.equal(f.popup,undefined);assert.ok(!tree.some(n=>f.text(n)==='Your transfer details'));
});
