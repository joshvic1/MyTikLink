import test from 'node:test';
import assert from 'node:assert/strict';
import {readBookingProgress} from '../V1.1/services/bookingProgressStream.mjs';
const response=chunks=>({body:new ReadableStream({start(controller){chunks.forEach(c=>controller.enqueue(new TextEncoder().encode(c)));controller.close();}})});
test('real server milestones are parsed across network chunk boundaries',async()=>{const progress=[];const result=await readBookingProgress(response(['{"pro','gress":20}\n{"progress":80}\n','{"progress":100}\n{"booking":{"reference":"SV-1"}}\n']),n=>progress.push(n));assert.deepEqual(progress,[20,80,100]);assert.equal(result.booking.reference,'SV-1');});
test('interrupted streams never count as successful bookings',async()=>{await assert.rejects(readBookingProgress(response(['{"progress":80}\n']),()=>{}),/interrupted/);});
test('server validation errors retain status for availability retries',async()=>{await assert.rejects(readBookingProgress(response(['{"error":"Time unavailable","status":409}\n']),()=>{}),e=>e.status===409&&e.message==='Time unavailable');});
