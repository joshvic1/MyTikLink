const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('staff proxy preserves MP3 selection, range requests and partial audio responses',async()=>{
 const swc=require(root+'/node_modules/next/dist/build/swc');await swc.loadBindings();const module={exports:{}};let sent;
 const code=swc.transformSync(fs.readFileSync(root+'/pages/api/staff/[...path].js','utf8'),{filename:'proxy.js',jsc:{parser:{syntax:'ecmascript'}},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,Buffer,URL,URLSearchParams,AbortSignal,process:{env:{}},require:()=>({adminBackend:()=> 'https://backend.test'}),fetch:async(url,options)=>{sent={url,options};return {status:206,headers:{get:key=>({'content-disposition':'inline; filename="audio.mp3"','content-type':'audio/mpeg','accept-ranges':'bytes','content-range':'bytes 0-1/100','content-length':'2'})[key]},arrayBuffer:async()=>new Uint8Array([1,2]).buffer};}});
 const req={method:'GET',headers:{range:'bytes=0-1'},cookies:{staff_session:'test-session'},query:{path:['messages','a'.repeat(24),'attachments','b'.repeat(24),'view'],playback:'mp3'}};
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},send(b){this.body=b;},end(){},json(){assert.fail('Audio was treated as JSON');}};
 await module.exports.default(req,res);assert.ok(sent.url.endsWith('?playback=mp3'));assert.equal(sent.options.headers.Range,'bytes=0-1');assert.equal(res.code,206);assert.equal(res.headers['content-range'],'bytes 0-1/100');assert.equal(res.headers['Content-Type'],'audio/mpeg');assert.deepEqual([...res.body],[1,2]);
});
