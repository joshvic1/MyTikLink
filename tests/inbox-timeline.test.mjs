import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeMessages,deliveryStatus,withPendingPreviews} from '../components/StaffInbox/inboxTimeline.mjs';
test('merge keeps paginated messages, orders equal timestamps and replaces updates',()=>{
 const rows=mergeMessages([{_id:'b',sentAt:'2026-11-10',text:'old'},{_id:'c',sentAt:'2026-11-10'}],[{_id:'a',sentAt:'2026-11-10'},{_id:'b',sentAt:'2026-11-10',text:'new'}]);
 assert.deepEqual(rows.map(m=>m._id),['a','b','c']);assert.equal(rows[1].text,'new');
});
test('a delayed send response cannot erase delivered or read ticks',()=>{
 const [row]=mergeMessages([{_id:'a',sentAt:'2026-11-10',deliveryEvent:'read',status:'sent'}],[{_id:'a',sentAt:'2026-11-10',status:'unknown',deliveryEvent:'sent'}]);
 assert.equal(deliveryStatus(row),'read');assert.equal(deliveryStatus({status:'unknown',deliveryEvent:'delivered'}),'delivered');
});

test('pending preview survives an older list refresh but yields to the server or a newer inbound',()=>{
 const pending=new Map([['chat',{requestId:'staff:request',text:'Sending now',sentAt:'2026-11-11T12:00:00Z',status:'sending'}]]);
 const old={_id:'chat',preview:'Old',lastMessageAt:'2026-11-11T11:00:00Z'};
 assert.equal(withPendingPreviews([old],pending)[0].preview,'Sending now');assert.equal(withPendingPreviews([old],pending)[0].deliveryEvent,'sending');
 assert.equal(withPendingPreviews([{...old,latestRequestId:'staff:request',preview:'Confirmed'}],pending)[0].preview,'Confirmed');
 assert.equal(withPendingPreviews([{...old,lastMessageAt:'2026-11-11T12:01:00Z',preview:'New reply'}],pending)[0].preview,'New reply');
});
