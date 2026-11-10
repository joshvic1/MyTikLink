import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardDestination,safeAuthReturn} from '../lib/authReturn.js';
test('login page cannot determine preference and dashboard next does not override it',()=>{assert.equal(dashboardDestination({version:'legacy'}),'/dashboard');assert.equal(dashboardDestination({version:'legacy'},'/v1-1/dashboard'),'/dashboard');assert.equal(dashboardDestination({version:'v1-1'},'/dashboard'),'/v1-1/dashboard');});
test('legitimate protected destinations survive login',()=>{for(const path of ['/checkout?plan=pro_yearly','/dashboard/settings','/v1-1/store/orders','/v1-1/settings/profile'])assert.equal(dashboardDestination({version:'legacy'},path),path);});
test('unsafe targets and authentication loops are rejected',()=>{for(const path of ['//evil.test','https://evil.test','/v1-1/login','/login','/admin','/v1-1/../admin','/\\evil.test'])assert.equal(dashboardDestination({version:'v1-1'},path),'/v1-1/dashboard');});
