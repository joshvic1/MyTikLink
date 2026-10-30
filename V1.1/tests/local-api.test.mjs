import test from 'node:test';
import assert from 'node:assert/strict';
import {v11ApiBase} from '../lib/apiBase.js';
test('local V1.1 API override applies only in development',()=>{
 const previous={...process.env};
 try{
  process.env.NEXT_PUBLIC_V11_API_URL='http://localhost:5001/api/';process.env.NEXT_PUBLIC_API_URL='https://example.test/api';
  process.env.NODE_ENV='development';assert.equal(v11ApiBase(),'http://localhost:5001/api');
  process.env.NODE_ENV='production';assert.equal(v11ApiBase(),'https://example.test/api');
 }finally{for(const k of ['NODE_ENV','NEXT_PUBLIC_API_URL','NEXT_PUBLIC_V11_API_URL'])if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}
});
