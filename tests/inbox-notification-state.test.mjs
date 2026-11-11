import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldPromptNotifications as prompt} from '../components/StaffInbox/notificationState.mjs';
const fresh={supported:true,permission:'default'};
test('prompt only for a new eligible device',()=>{assert.equal(prompt(fresh),true);for(const patch of [{permission:'granted'},{permission:'denied'},{saved:{enabled:true}},{saved:{enabled:false}},{subscription:{}},{dismissed:true},{settings:true},{demo:true},{supported:false}])assert.equal(prompt({...fresh,...patch}),false);});
