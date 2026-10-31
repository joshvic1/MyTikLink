const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('pages/api/brand-description.js','utf8').replace(/^import .*;\r?\n/,'').replace('export default async function handler','async function handler');
async function run({auth='Bearer test',status=200,key='server-secret',method='POST'}={}){
 const calls=[];const context={v11ApiBase:()=> 'https://backend.example/api',process:{env:{OPENAI_API_KEY:key}},AbortSignal,fetch:async(url,options)=>{calls.push({url,options});return calls.length===1?{ok:status===200,status,json:async()=>({data:{publicName:'Green Farm',category:{label:'Agriculture'},accountType:'business'}})}:{ok:true,json:async()=>({choices:[{message:{content:'Fresh produce.\nGrown with care.\nTalk to us today.'}}]})}}};
 vm.createContext(context);vm.runInContext(source+';globalThis.run=handler;',context);
 const res={setHeader(){},status(v){this.code=v;return this},json(v){this.body=v;return this}};await context.run({method,headers:{authorization:auth},body:{publicName:'UNTRUSTED'}},res);return {res,calls};
}
test('rejects unauthenticated requests before any provider call',async()=>{const {res,calls}=await run({auth:''});assert.equal(res.code,401);assert.equal(calls.length,0)});
test('rejects invalid backend sessions before spending AI credits',async()=>{const {res,calls}=await run({status:401});assert.equal(res.code,401);assert.equal(calls.length,1)});
test('uses server key and saved brand; returns only description',async()=>{const {res,calls}=await run();assert.equal(res.code,200);assert.equal(calls[1].options.headers.Authorization,'Bearer server-secret');assert.match(calls[1].options.body,/Green Farm/);assert.doesNotMatch(calls[1].options.body,/UNTRUSTED/);assert.deepEqual(Object.keys(res.body),['description'])});
test('missing key returns a safe configuration error',async()=>{const {res,calls}=await run({key:''});assert.equal(res.code,503);assert.equal(calls.length,1)});
