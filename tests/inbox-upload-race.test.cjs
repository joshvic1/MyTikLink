const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('a cancelled or superseded upload cannot attach to the composer',async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../components/StaffInbox/ComposerAttachment.jsx'),'utf8');const upload=source.slice(source.indexOf(' async function upload(file)'),source.indexOf(' return {attachment,upload,cancel}'));
 const requests=[],updates=[],active={current:null},preview={current:null};let attachment;
 const ctx={active,preview,channel:'whatsapp',demo:false,attachmentError:()=>'',AbortController,FormData,URL:{createObjectURL:()=> 'blob:fixture'},setTimeout,clearTimeout,setAttachment:v=>attachment=v,setMedia:v=>updates.push(v),cancel:()=>{active.current?.abort();active.current=null;},fetch:(url,options)=>new Promise(resolve=>requests.push({resolve,options}))};
 vm.createContext(ctx);vm.runInContext(upload+';this.uploadFile=upload;',ctx);const file=new Blob(['image'],{type:'image/png'});file.name='clipboard.png';
 const first=ctx.uploadFile(file),second=ctx.uploadFile(file);assert.equal(requests[0].options.signal.aborted,true);requests[0].resolve({ok:true,json:async()=>({media:{_id:'stale'}})});await first;assert.equal(updates.length,0);requests[1].resolve({ok:true,json:async()=>({media:{_id:'current'}})});await second;assert.equal(updates[0]._id,'current');assert.equal(attachment.ready,true);
 const third=ctx.uploadFile(file);ctx.cancel();requests[2].resolve({ok:true,json:async()=>({media:{_id:'cancelled'}})});await third;assert.equal(updates.length,1);
});
