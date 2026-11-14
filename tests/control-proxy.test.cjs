const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../pages/api/staff/control/[...path].js'),'utf8').replace(/^import .*;\r?\n/,'').replace('export const config','const config').replace('export default async function handler','async function handler')+'\nmodule.exports=handler;';
async function forward(query){
 let target;const module={exports:{}};
 vm.runInNewContext(source,{module,URLSearchParams,AbortSignal,adminBackend:()=> 'https://backend.test',sameOrigin:()=>true,sessionHeaders:()=>({Authorization:'Bearer fixture'}),sessionCookie:()=>{},fetch:async(url)=>{target=new URL(url);return {status:200,json:async()=>({items:[],total:0})};}});
 const res={setHeader(){},status(code){this.code=code;return this;},json(data){this.data=data;}};
 await module.exports({method:'GET',query:{path:['first-choice'],...query}},res);assert.equal(res.code,200);return target;
}
test('first choice proxy forwards every report filter, including storefront',async()=>{
 const filters={intent:'storefront',category:'Packaged food',accountType:'business',businessMode:'physical',businessFocus:'physical_products',search:'name@example.com',from:'2026-11-01',to:'2026-11-14',sort:'oldest',page:'2'};
 const url=await forward(filters);assert.equal(url.pathname,'/api/control/first-choice');
 for(const [key,value] of Object.entries(filters))assert.equal(url.searchParams.get(key),value,key);
});
test('all creation choices survive the proxy; unapproved and array parameters do not',async()=>{
 for(const intent of ['storefront','landing_page','redirect_link','not_sure','unrecorded',''])assert.equal((await forward({intent})).searchParams.get('intent'),intent);
 const url=await forward({intent:['storefront','landing_page'],unknown:'value'});assert.equal(url.searchParams.has('intent'),false);assert.equal(url.searchParams.has('unknown'),false);
});
