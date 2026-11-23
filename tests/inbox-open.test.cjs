const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../components/StaffInbox/StaffInbox.jsx'),'utf8');
const opening=source.slice(source.indexOf(' async function open(row'),source.indexOf(' async function update(patch)'));
test('desktop chat opening uses declared state and loads the selected conversation',async()=>{
 const calls={},context={demo:false,window:{innerWidth:1440},capturePosition:()=>null,mergeMessages:(a,b)=>[...a,...b],requestAnimationFrame:f=>f(),document:{getElementById:()=>null},handleError:e=>{throw e}};
 // Only actual React state setters receive mocks: a removed setter must fail this test.
 for(const match of source.matchAll(/,\s*(set\w+)\]\s*=\s*useState/g)){const name=match[1];context[name]=v=>{calls[name]=v;};}
 for(const match of opening.matchAll(/\b(set[A-Z]\w*)\(/g))assert.equal(typeof context[match[1]],'function',match[1]+' is not declared state');
 for(const name of ['listPosition','listElement','selection','threadVersion','lastSync','lastSyncId','nearBottom','scrollIntent','firstUnread','sendTransaction'])context[name]={current:name==='threadVersion'?0:null};
 context.threadCache={current:new Map()};context.prefetchedThreads={current:new Map()};
 const conversation={_id:'chat-one',channel:'whatsapp',contactName:'Customer'},message={_id:'message-one',kind:'inbound',text:'Hello'};const requests=[];
 context.api=async path=>{requests.push(path);return path.endsWith('/draft')?{draft:null}:{conversation,messages:[message],hasMore:false,syncAt:'2026-11-23T12:00:00Z'};};
 vm.createContext(context);vm.runInContext(opening+';this.openChat=open;',context);
 await context.openChat(conversation);assert.equal(context.selection.current,'chat-one');assert.equal(calls.setSelected._id,'chat-one');assert.equal(calls.setThreadLoading,false);assert.equal(calls.setFollowupOpen,false);assert.equal(calls.setFollowupInfo,null);assert.equal(calls.setMessages([])[0]._id,'message-one');assert.ok(requests.includes('conversations/chat-one?initial=1'));
 await context.openChat({...conversation,_id:'chat-two'});assert.equal(context.selection.current,'chat-two');assert.equal(context.threadVersion.current,2);
});
