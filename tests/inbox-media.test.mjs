import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeMessages,deliveryStatus,chatDate,visibleMessageText} from '../components/StaffInbox/inboxTimeline.mjs';
import {createMediaQueue} from '../components/StaffInbox/mediaQueue.mjs';
test('ten media items load with at most two concurrent requests; cancellation frees slots',()=>{
 const queue=createMediaQueue(2),running=new Set(),finishes=[],cancels=[];let peak=0;
 for(let i=0;i<10;i++)cancels.push(queue.enqueue(done=>{running.add(i);peak=Math.max(peak,running.size);finishes[i]=()=>{running.delete(i);done();};}));
 assert.deepEqual([...running],[0,1]);cancels[5]();
 for(let i=0;i<10;i++)if(finishes[i])finishes[i]();
 assert.equal(peak,2);assert.equal(running.size,0);assert.equal(finishes[5],undefined);
 const cancel=queue.enqueue(()=>{});cancel();let next=false;queue.enqueue(done=>{next=true;done();});assert.equal(next,true);
});
test('server acknowledgement replaces optimistic bubble and later receipts keep one copy',()=>{
 const pending={_id:'pending:1',requestId:'staff:1',optimistic:true,status:'sending',text:'Hello',sentAt:'2026-11-11'};
 assert.equal(deliveryStatus(pending),'sending');
 let messages=mergeMessages([pending],[{_id:'server1',requestId:'staff:1',status:'sent',sentAt:'2026-11-11'}]);
 assert.equal(messages.length,1);assert.equal(messages[0]._id,'server1');assert.equal(messages[0].optimistic,undefined);
 messages=mergeMessages(messages,[{_id:'server1',deliveryEvent:'read',sentAt:'2026-11-11'}]);
 messages=mergeMessages(messages,[{_id:'server1',status:'sent',deliveryEvent:'sent',sentAt:'2026-11-11'}]);
 assert.equal(messages.length,1);assert.equal(deliveryStatus(messages[0]),'read');
});
test('chat dates use Today, Yesterday, and ordinal day month year',()=>{
 const now=new Date(2026,8,28,12);
 assert.equal(chatDate(new Date(2026,8,28),now),'Today');assert.equal(chatDate(new Date(2026,8,27),now),'Yesterday');
 for(const [day,suffix] of [[1,'st'],[2,'nd'],[3,'rd'],[11,'th'],[12,'th'],[13,'th'],[21,'st'],[26,'th']])assert.equal(chatDate(new Date(2026,8,day),now),`${day}${suffix} Sept 2026`);
 assert.equal(chatDate(new Date(2025,11,31),new Date(2026,0,1)),'Yesterday');
});
test('media placeholders disappear but real captions and missing attachments remain visible',()=>{
 assert.equal(visibleMessageText({text:'[audio message]',attachments:[{mimeType:'audio/ogg'}]}),'');
 assert.equal(visibleMessageText({text:'A useful caption',attachments:[{mimeType:'image/jpeg'}]}),'A useful caption');
 assert.equal(visibleMessageText({text:'[audio message]',attachments:[]}),'[audio message]');
});
