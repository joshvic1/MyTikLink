import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const source=fs.readFileSync(new URL('../tracking/browser.js',import.meta.url),'utf8');
const {browserEvent,trackingData}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('browser skips API-backed events and targets the exact OpenAI pixel',()=>{const calls=[];global.window={oaiq:(...a)=>calls.push(a)};global.document={querySelector:()=>true};browserEvent({openai:{pixelId:'owner-a',server:true}},'view','event1');assert.equal(calls.length,0);browserEvent({openai:{pixelId:'owner-b',server:false}},'view','event2');const event=calls.find(a=>a[0]==='measureSingle');assert.equal(event[1],'owner-b');assert.equal(event[2],'page_viewed');assert.equal(event[4].event_id,'event2');delete global.window;delete global.document;});
test('no visitor identifier is created without consent',()=>{global.localStorage={getItem:()=>null};global.sessionStorage={getItem(){throw Error('must not read')}};assert.equal(trackingData('store','test'),null);delete global.localStorage;delete global.sessionStorage;});

test('TikTok browser pixel runs alongside Events API, preserves IDs and targets only its owner',()=>{
 const calls=[],scripts=[];
 global.window={};global.document={querySelector:()=>false,createElement:()=>({}),head:{appendChild:s=>scripts.push(s.src)}};
 try {
  browserEvent({tiktok:{pixelId:'owner-tiktok-a',server:true}},'view','visit-1');
  browserEvent({tiktok:{pixelId:'owner-tiktok-a',server:true}},'content','content-1');
  browserEvent({tiktok:{pixelId:'owner-tiktok-a',server:true}},'lead','lead-1');
  browserEvent({tiktok:{pixelId:'owner-tiktok-b',server:false}},'contact','cta-1');
  assert.equal(scripts.length,2);
  assert.deepEqual(window.ttq.filter(x=>x[0]==='track'&&x[3].pixel_code==='owner-tiktok-a').map(x=>x.slice(0,2)),[['track','Pageview'],['track','ViewContent'],['track','CompleteRegistration']]);
  assert.equal(window.ttq.filter(x=>x[0]==='track'&&x[3].pixel_code==='owner-tiktok-a')[2][3].event_id,'lead-1');
  assert.deepEqual(window.ttq.find(x=>x[0]==='track'&&x[3].pixel_code==='owner-tiktok-b'),['track','CompleteRegistration',{}, {event_id:'cta-1',pixel_code:'owner-tiktok-b'}]);
  assert.ok(window.ttq.some(x=>x[0]==='grantConsent'));
 } finally {delete global.window;delete global.document;}
});
test('Meta sends browser and server dedup identifiers for both landing-page conversion paths',()=>{
 const calls=[];global.window={fbq:(...args)=>calls.push(args)};global.document={querySelector:()=>true};
 try {for(const type of ['lead','contact'])browserEvent({meta:{pixelId:'meta-owner',server:true}},type,type+'-id');
  assert.deepEqual(calls.filter(x=>x[0]==='trackSingle'),[
   ['trackSingle','meta-owner','CompleteRegistration',{}, {eventID:'lead-id'}],
   ['trackSingle','meta-owner','CompleteRegistration',{}, {eventID:'contact-id'}]
  ]);
 }finally{delete global.window;delete global.document;}
});

test('landing page attribution starts without an analytics choice and does not fabricate consent',()=>{
 global.localStorage={getItem(){throw Error('must not depend on page consent')}};
 global.sessionStorage={getItem:()=> 'test-visitor'};global.document={cookie:''};global.location={search:''};
 try {const data=trackingData('page','test');assert.equal(data.mode,'automatic');assert.equal(data.visitor,'test-visitor');assert.equal(data.consent,undefined);}
 finally {delete global.localStorage;delete global.sessionStorage;delete global.document;delete global.location;}
});
