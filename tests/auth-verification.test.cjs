const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('V1.1/components/auth/V11AuthPage.jsx', 'utf8');
function setup(code) {
  let focused = -1, requests = 0;
  const ctx = { code, passwordChallenge:"", setNewPassword(){},setConfirmPassword(){}, busy:false, verifying:{current:false}, form:{email:'test@example.com'}, refs:{current:Array.from({length:4},(_,i)=>({focus(){focused=i},select(){}}))}, setCode(value){ctx.code=value}, setError(){}, setBusy(value){ctx.busy=value}, apiRequest(){requests++;return new Promise(()=>{})}, finishAuthentication(){} };
  vm.createContext(ctx);
  vm.runInContext(source.slice(source.indexOf('  const verifyCode ='),source.indexOf('  const google ='))+';globalThis.remove=deleteCode;globalThis.enter=enterCode;',ctx);
  return {ctx,focus:()=>focused,requests:()=>requests};
}
test('four Backspaces clear all digits and move backward without leaving the first box',()=>{
 const {ctx,focus}=setup(['1','2','3','4']);
 for(let i=3;i>=0;i--){ctx.remove(i);assert.equal(ctx.code[i],'');assert.equal(focus(),Math.max(0,i-1));}
 ctx.remove(0);assert.equal(focus(),0);
});
test('mobile deletion reported as an empty input moves backward and clears the digit',()=>{
 const {ctx,focus}=setup(['1','2','3','4']);ctx.enter(3,'');assert.equal(ctx.code.join(''),'123');assert.equal(focus(),2);
});
test('Backspace from an empty box deletes the preceding digit',()=>{
 const {ctx,focus}=setup(['1','2','','']);ctx.remove(2);assert.equal(ctx.code.join(''),'1');assert.equal(focus(),0);
});
test('deletion cannot mutate a code while verification is pending',()=>{
 const {ctx}=setup(['1','2','3','4']);ctx.busy=true;ctx.remove(3);assert.equal(ctx.code.join(''),'1234');
});
test('typing or pasting four digits submits once; deleting never submits',()=>{
 const {ctx,requests}=setup(['','','','']);ctx.enter(0,'123');assert.equal(requests(),0);ctx.enter(3,'4');assert.equal(requests(),1);ctx.enter(3,'4');assert.equal(requests(),1);
 const pasted=setup(['','','','']);pasted.ctx.enter(0,'9876');assert.equal(pasted.requests(),1);
});

test('Google password verification uses the challenge endpoint instead of registration',()=>{
 const {ctx}=setup(['','','','']);let path,body;ctx.passwordChallenge='challenge-token';ctx.apiRequest=(p,o)=>{path=p;body=JSON.parse(o.body);return new Promise(()=>{});};ctx.enter(0,'1234');assert.equal(path,'/auth/google-password/verify');assert.equal(body.challengeId,'challenge-token');assert.equal(body.email,'test@example.com');
});
