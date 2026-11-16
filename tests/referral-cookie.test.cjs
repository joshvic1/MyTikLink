const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('pages/api/referral.js','utf8').replace('export default async function handler','async function handler')+'\nmodule.exports=handler';
async function run(method,{origin='https://mytiklink.com',cookie,ok=true,token='signed',failure=false}={}){
 const module={exports:{}};let called=0;let target;
 vm.runInNewContext(source,{module,URL,AbortSignal,process:{env:{NODE_ENV:'production',NEXT_PUBLIC_API_URL:'https://api.test/api'}},fetch:async(url)=>{called++;target=url;if(failure)throw Error('offline');return{ok,status:ok?200:400,json:async()=>ok?{code:'ABCDE',token}:{message:'Invalid code'}}}});
 const res={headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.code=c;return this},json(d){this.data=d;return this},end(){return this}};
 await module.exports({method,headers:{origin,host:'mytiklink.com'},cookies:{mtl_referral:cookie},body:{code:'ABCDE'}},res);return{res,called,target};
}
test('valid referral sets secure first-party 30 day HttpOnly cookie',async()=>{const {res}=await run('POST');assert.equal(res.code,200);for(const flag of ['HttpOnly','Secure','SameSite=Lax','Path=/','Max-Age=2592000'])assert.ok(res.headers['Set-Cookie'].includes(flag))});
test('invalid referral does not replace existing cookie',async()=>{const {res}=await run('POST',{ok:false,cookie:'previous'});assert.equal(res.code,400);assert.equal(res.headers['Set-Cookie'],undefined)});
test('restore does not extend cookie lifetime',async()=>{const {res,target}=await run('GET',{cookie:'previous'});assert.ok(target.endsWith('/restore'));assert.equal(res.headers['Set-Cookie'],undefined)});
test('cross-origin requests cannot set referral cookies',async()=>{const {res,called}=await run('POST',{origin:'https://attacker.test'});assert.equal(res.code,403);assert.equal(called,0)});
test('empty cookie avoids upstream; outages preserve attribution',async()=>{assert.equal((await run('GET')).called,0);const {res}=await run('POST',{failure:true});assert.equal(res.code,503);assert.equal(res.headers['Set-Cookie'],undefined)});
