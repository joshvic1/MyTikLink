const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('inbox proxy forwards list cursors and history parameters',async()=>{
 let source=fs.readFileSync(path.join(__dirname,'../pages/api/staff/[...path].js'),'utf8');source=source.replace(/^import .*;\r?\n/gm,'').replace(/export const /g,'const ').replace('export default async function handler','async function handler')+'\nmodule.exports=handler;';
 let target;const module={exports:{}};vm.runInNewContext(source,{module,URLSearchParams,AbortSignal,adminBackend:()=>"https://backend.test",process:{env:{NEXT_PUBLIC_API_URL:'https://backend.test/api'}},fetch:async url=>{target=new URL(url);return {status:200,headers:new Headers({'content-type':'application/json'}),json:async()=>({}),text:async()=> '{}'};}});
 const res={setHeader(){},status(){return this},json(){},send(){},end(){}};
 await module.exports({method:'GET',headers:{},cookies:{staff_session:'fixture'},query:{path:['conversations'],cursor:'cursor-value',initial:'1',focus:'0123456789abcdef01234567'}},res);
 assert.equal(target.searchParams.get('cursor'),'cursor-value');assert.equal(target.searchParams.get('initial'),'1');assert.equal(target.searchParams.get('focus'),'0123456789abcdef01234567');
});
