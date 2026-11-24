const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('AI controls reach the authenticated staff proxy without opening unrelated paths',async()=>{
 const source=fs.readFileSync('pages/api/staff/[...path].js','utf8').replace(/^import .*;\r?\n/gm,'').replace('export const config','const config').replace('export default async function handler','async function handler');
 const calls=[];const context={URL,URLSearchParams,AbortSignal,Buffer,adminBackend:()=> 'https://backend.invalid',fetch:async(url,options)=>{calls.push({url,options});return {status:200,headers:{get:()=> 'application/json'},json:async()=>({ai:{mode:'manual'}}),text:async()=>JSON.stringify({ai:{mode:'manual'}})}}};vm.createContext(context);vm.runInContext(source,context);
 const res={setHeader(){},status(n){this.code=n;return this},json(v){this.body=v;return this},send(v){this.body=v;return this},end(){return this}};
 await context.handler({method:'PATCH',headers:{host:'localhost:3000',origin:'http://localhost:3000'},query:{path:['conversations','a'.repeat(24),'ai']},cookies:{staff_session:'test-session'},body:{mode:'manual'}},res);
 assert.equal(calls.length,1);assert.match(calls[0].url,/\/conversations\/a{24}\/ai$/);assert.equal(calls[0].options.headers.Authorization,'Bearer test-session');assert.equal(JSON.parse(calls[0].options.body).mode,'manual');
 await context.handler({method:'PATCH',headers:{host:'localhost:3000',origin:'https://untrusted.invalid'},query:{path:['conversations','a'.repeat(24),'ai']},cookies:{}},res);assert.equal(res.code,403);assert.equal(calls.length,1);
});
