import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../utils/server/adminProxy.js',import.meta.url),'utf8');
const {sessionCookie,sessionHeaders}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('admin expiry clears only the admin cookie and cannot erase the inbox login',()=>{let cookie;sessionCookie({setHeader:(k,v)=>cookie=v},'');assert.match(cookie,/^control_session=/);assert.doesNotMatch(cookie,/staff_session=/);});
test('admin uses its own cookie with compatibility fallback to a valid inbox session',()=>{assert.equal(sessionHeaders({cookies:{control_session:'admin',staff_session:'inbox'}}).Authorization,'Bearer admin');assert.equal(sessionHeaders({cookies:{staff_session:'inbox'}}).Authorization,'Bearer inbox');});
