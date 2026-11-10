import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeMessages,deliveryStatus} from '../components/StaffInbox/inboxTimeline.mjs';
test('merge keeps paginated messages, orders equal timestamps and replaces updates',()=>{
 const rows=mergeMessages([{_id:'b',sentAt:'2026-11-10',text:'old'},{_id:'c',sentAt:'2026-11-10'}],[{_id:'a',sentAt:'2026-11-10'},{_id:'b',sentAt:'2026-11-10',text:'new'}]);
 assert.deepEqual(rows.map(m=>m._id),['a','b','c']);assert.equal(rows[1].text,'new');
});
test('a delayed send response cannot erase delivered or read ticks',()=>{
 const [row]=mergeMessages([{_id:'a',sentAt:'2026-11-10',deliveryEvent:'read',status:'sent'}],[{_id:'a',sentAt:'2026-11-10',status:'unknown',deliveryEvent:'sent'}]);
 assert.equal(deliveryStatus(row),'read');assert.equal(deliveryStatus({status:'unknown',deliveryEvent:'delivered'}),'delivered');
});
