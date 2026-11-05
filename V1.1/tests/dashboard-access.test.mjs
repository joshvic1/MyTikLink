import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardSuggestions} from '../lib/dashboardAccess.js';
import {redirectDesigns,designsForDestination} from '../config/redirectDesigns.js';
test('free accounts only see upgrading, even when backend suggests pixels or orders',()=>{
 const result=dashboardSuggestions({plan:'free'},{_id:'starter'},[{kind:'tracking'},{kind:'orders'}]);
 assert.deepEqual(result.map(x=>x.kind),['starter-upgrade']);
 assert.match(result[0].title,/landing page/);
});
test('expired subscriptions return to upgrade-first suggestions',()=>{
 assert.equal(dashboardSuggestions({plan:'pro_yearly',planExpiry:'2000-01-01'},null,[{kind:'tracking'}])[0].kind,'starter-upgrade');
});
test('paid accounts retain their ordered sharing and pixel suggestions',()=>{
 const suggestions=[{kind:'share'},{kind:'tracking'},{kind:'orders'}];
 assert.deepEqual(dashboardSuggestions({plan:'pro_monthly'},null,suggestions),suggestions);
});
test('each destination has two distinct designs with verified HTTPS cover locations',()=>{
 assert.equal(redirectDesigns.length,20);assert.equal(new Set(redirectDesigns.map(t=>t._id)).size,20);
 for(const platform of new Set(redirectDesigns.map(t=>t.platform))){const designs=designsForDestination(platform);assert.equal(designs.length,2);assert.equal(new Set(designs.map(t=>t.layout)).size,2);for(const t of designs){assert.match(t._id,/^[a-f0-9]{24}$/);assert.match(t.thumbnailUrl,/^https:\/\/.+\.webp$/);}}
});

 test('free landing-page starters see their later storefront second',()=>{
 const user={plan:'free',onboarding:{intent:'landing_page'}};
 const result=dashboardSuggestions(user,{_id:'starter'},[],{_id:'store'});
 assert.deepEqual(result.map(x=>x.kind),['starter-upgrade','store-upgrade']);
 assert.equal(result[1].action,'Upgrade to Pro');
 assert.deepEqual(dashboardSuggestions(user,{_id:'starter'},[],null).map(x=>x.kind),['starter-upgrade']);
 });
