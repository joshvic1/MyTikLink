import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardSuggestions} from '../lib/dashboardAccess.js';
test('free storefront owner gets store upgrade suggestion',()=>{const [s]=dashboardSuggestions({plan:'free',onboarding:{intent:'storefront'}},null,[],{_id:'store'});assert.equal(s.kind,'store-upgrade');assert.equal(s.title,'Your online store is ready');});
test('no store does not claim store is ready',()=>{assert.equal(dashboardSuggestions({plan:'free',onboarding:{intent:'storefront'}},null,[],null)[0].kind,'starter-upgrade');});
test('landing onboarding stays landing focused',()=>{assert.equal(dashboardSuggestions({plan:'free',onboarding:{intent:'landing_page'}},{_id:'page'},[],{_id:'store'})[0].kind,'starter-upgrade');});
test('paid owners keep normal next actions',()=>{const actions=[{kind:'product'}];assert.equal(dashboardSuggestions({plan:'pro_monthly',onboarding:{intent:'storefront'}},null,actions,{_id:'store'}),actions);});

test('redirect intent takes priority over an existing store',()=>{const [s]=dashboardSuggestions({plan:'free',onboarding:{intent:'redirect_link'}},null,[],{_id:'s'},[{_id:'l'}]);assert.equal(s.kind,'redirect-upgrade');assert.match(s.description,/250 clicks/);});
test('no saved link does not claim redirect is ready',()=>{assert.notEqual(dashboardSuggestions({plan:'free',onboarding:{intent:'redirect_link'}},null,[],null,[])[0].kind,'redirect-upgrade');});
