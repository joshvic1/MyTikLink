const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const swc=require(path.join(root,'node_modules/next/dist/build/swc'));
async function fixture(api){
 await swc.loadBindings();const state=[];let cursor=0;const calls=[],redirects=[];
 const react={useId:()=>':fixture:',useRef(value){const i=cursor++;return state[i]||(state[i]={current:value});},useState(value){const i=cursor++;if(!(i in state))state[i]=value;return [state[i],next=>state[i]=next];}};
 const cache=new Map();function load(filename){if(cache.has(filename))return cache.get(filename);const module={exports:{}};const code=swc.transformSync(fs.readFileSync(filename,'utf8'),{filename,jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}},target:'es2020'},module:{type:'commonjs'}}).code;vm.runInNewContext(code,{module,exports:module.exports,URL,window:{location:{assign:url=>redirects.push(url)}},FormData:class{constructor(form){this.form=form;}get(key){return this.form[key];}},require(spec){if(spec==='react')return react;if(spec.endsWith('/tracking/browser'))return {trackingData:()=>null,announceTracking(){}};if(spec.endsWith('.css'))return new Proxy({},{get:(_,key)=>String(key)});if(spec.endsWith('/api'))return {apiRequest:async(...args)=>{calls.push(args);return api(...args);}};if(spec.startsWith('.'))return load(path.resolve(path.dirname(filename),path.extname(spec)?spec:spec+'.js'));return require(require.resolve(spec,{paths:[root]}));}});cache.set(filename,module.exports);return module.exports;}
 const Form=load(path.join(root,'V1.1/landing/ThemeLeadForm.jsx')).default;
 return {calls,redirects,render(props={}){cursor=0;return Form({section:{formTitle:'Enquire',formCopy:'Your details',submitLabel:'Send',consent:'Contact me',successMessage:'Confirmed'},page:{slug:'short-hair'},...props});}};
}
function event(values={}){return {preventDefault(){},currentTarget:{name:' Test Visitor ',whatsapp:'+447911123456',company:'',...values}};}
function nodes(node){return !node||typeof node!=='object'?[]:[node,...[node.props?.children].flat(Infinity).flatMap(nodes)];}
test('shared form sends the existing contract, blocks concurrent submissions, and confirms only a successful response',async()=>{
 let resolve;const f=await fixture(()=>new Promise(r=>resolve=r));const form=f.render();const first=form.props.onSubmit(event());await form.props.onSubmit(event());assert.equal(f.calls.length,1);assert.equal(f.calls[0][0],'/v1-1/pages/public/short-hair/lead');assert.deepEqual(JSON.parse(f.calls[0][1].body),{name:'Test Visitor',whatsapp:'+447911123456',company:'',tracking:null});assert.equal(nodes(f.render()).find(n=>n.type==='button').props.children,'Sending…');resolve({success:true});await first;const result=nodes(f.render());assert.equal(result.find(n=>n.type==='button').props.children,'Enquiry received');assert.ok(result.some(n=>n.props?.children==='Confirmed'));await f.render().props.onSubmit(event());assert.equal(f.calls.length,1);
});
test('failure stays retryable and does not clear visitor fields or claim success',async()=>{
 let count=0;const f=await fixture(async()=>{if(count++===0)throw new Error('Connection interrupted');return {success:false};});const ev=event();await f.render().props.onSubmit(ev);assert.equal(ev.currentTarget.name,' Test Visitor ');assert.ok(nodes(f.render()).some(n=>n.props?.children==='Connection interrupted'));assert.equal(Boolean(nodes(f.render()).find(n=>n.type==='button').props.disabled),false);await f.render().props.onSubmit(ev);assert.equal(f.calls.length,2);assert.ok(nodes(f.render()).some(n=>String(n.props?.children).includes('not confirmed')));
});
test('invalid country code, preview, and unpublished page do not send requests',async()=>{
 const f=await fixture(async()=>({success:true}));await f.render().props.onSubmit(event({whatsapp:'08012345678'}));await f.render({preview:true}).props.onSubmit(event());await f.render({page:{}}).props.onSubmit(event());assert.equal(f.calls.length,0);
});


test('new compact forms omit consent only when requested and keep the existing lead payload',async()=>{
 const f=await fixture(async()=>({success:true}));
 assert.ok(nodes(f.render()).some(n=>n.type==='input' && n.props.type==='checkbox'));
 const form=f.render({compact:true,section:{formTitle:'Fill the form below',submitLabel:'Send enquiry',showConsent:false}});
 assert.ok(!nodes(form).some(n=>n.type==='input' && n.props.type==='checkbox'));
 await form.props.onSubmit(event());assert.equal(f.calls.length,1);
 assert.deepEqual(JSON.parse(f.calls[0][1].body),{name:'Test Visitor',whatsapp:'+447911123456',company:'',tracking:null});
});

test('interactive preview allows typing and validation but never sends a lead',async()=>{
 const f=await fixture(async()=>({success:true}));
 const props={preview:true,interactivePreview:true,compact:true};
 const form=f.render(props);
 assert.ok(nodes(form).filter(n=>n.type==='input'||n.type==='button').every(n=>!n.props.disabled));
 assert.ok(!nodes(form).some(n=>n.type==='small'));
 await form.props.onSubmit(event({whatsapp:'bad'}));
 assert.ok(nodes(f.render(props)).some(n=>String(n.props?.children).includes('valid country code')));
 await f.render(props).props.onSubmit(event());
 assert.equal(f.calls.length,0);
 assert.ok(nodes(f.render(props)).some(n=>n.props?.children==='Preview test complete. No enquiry was sent.'));
 assert.equal(Boolean(nodes(f.render(props)).find(n=>n.type==='button').props.disabled),false);
});

test('confirmed submission redirects to the backend destination, never on failure or preview',async()=>{
 const good=await fixture(async()=>({success:true,redirectUrl:'https://wa.me/2348012345678'}));await good.render().props.onSubmit(event());assert.deepEqual(good.redirects,['https://wa.me/2348012345678']);
 for(const result of [{success:false,redirectUrl:'https://example.com/'},{success:true,redirectUrl:'javascript:alert(1)'}]){const f=await fixture(async()=>result);await f.render().props.onSubmit(event());assert.deepEqual(f.redirects,[]);}
 const preview=await fixture(async()=>({success:true,redirectUrl:'https://example.com/'}));await preview.render({preview:true,interactivePreview:true}).props.onSubmit(event());assert.deepEqual(preview.redirects,[]);assert.equal(preview.calls.length,0);
});
