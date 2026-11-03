import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Exercise the routing gate used by V11Content, including Next.js's initial
// catch-all URL before hydration. No owner session should run for a visitor.
const app=readFileSync(new URL('../V11App.jsx',import.meta.url),'utf8');
const gate=app.slice(app.indexOf('  const path = router.asPath'),app.indexOf('  const onboarding ='));
assert.ok(gate.includes('useV11Session'));
const sessionOptions=new Function('router','useV11Session',gate+'\nreturn session;');
const options=(asPath,isReady)=>sessionOptions({asPath,isReady},value=>value);

test('unresolved catch-all route cannot trigger login before hydration',()=>{
 assert.equal(options('/v1-1/[[...slug]]',false).enabled,false);
});
test('public redirects and pages do not load visitor account sessions',()=>{
 for(const path of ['/v1-1/r/free-link','/v1-1/r/paid-link?source=share','/v1-1/p/page','/v1-1/s/store','/v1-1/login']){
  assert.deepEqual(options(path,true),{required:false,enabled:false});
 }
});
test('dashboard still requires authentication once its URL is ready',()=>{
 assert.deepEqual(options('/v1-1/dashboard',true),{required:true,enabled:true});
});
