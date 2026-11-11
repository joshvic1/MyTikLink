const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..');
const test=require('node:test');
const chrome=process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe';
test('legacy HTML preview maps fields and safely dispatches taps', {skip:!fs.existsSync(chrome)},()=>{
const helper=fs.readFileSync(root+'/V1.1/landing/legacyPreview.js','utf8').replace('export function','function');
const checks=`
const checks=[];function check(ok,label){if(!ok)throw Error(label);checks.push(label);}
const template={html:'<h1>{{f1}}</h1><p>{{f2}}</p><a href="{{url}}">{{label}}</a><img src="{{photo}}"><div style="background-image:url({{cover}})">Cover</div><style>h1{color:{{color}}}</style><script>parent.bad=true;<'+ '/script><button onclick="parent.bad=true">Blocked</button>',css:'p{color:{{color}}}',editableSchema:{fields:[{key:'f1'},{key:'f2'},{key:'url'},{key:'label'},{key:'photo',type:'image'},{key:'cover',type:'image'},{key:'color',type:'color'}]}};
const html=buildLegacyPreview(template,{f1:'Same text',f2:'Same text',url:'https://example.com',label:'Go',photo:{url:'photo.png'},cover:'cover.png',color:'#123456'},'legacy-test');
const doc=new DOMParser().parseFromString(html,'text/html');
check(doc.querySelector('h1 [data-editor-field]').dataset.editorField==='f1','first duplicate text maps to f1');
check(doc.querySelector('p [data-editor-field]').dataset.editorField==='f2','second duplicate text maps to f2');
check(doc.querySelector('img').dataset.editorField==='photo'&&doc.querySelector('img').getAttribute('src')==='photo.png','object image maps to upload field');
check(doc.querySelector('div').dataset.editorField==='cover','background image maps to upload field');
check([...doc.querySelectorAll('style')].every(s=>!s.textContent.includes('{{')&&!s.textContent.includes('<span')),'CSS substitutions preserve styling');
check(doc.querySelector('a span').dataset.editorField==='label','link text selects label before destination');
check(doc.querySelectorAll('script').length===1&&!doc.querySelector('[onclick]'),'only controlled preview bridge runs');
check(doc.querySelector('meta[http-equiv]').content.includes("script-src 'nonce-legacy-test'"),'preview scripts restricted by CSP');
const escaped=buildLegacyPreview({html:'<h1>{{f1}}</h1>',editableSchema:{fields:[{key:'f1'}]}},{f1:'<img src=x onerror=alert(1)>'},'legacy-test');
check(!new DOMParser().parseFromString(escaped,'text/html').querySelector('img'),'field text cannot inject HTML');
const frame=document.createElement('iframe');frame.sandbox='allow-scripts';
window.addEventListener('message',event=>{if(event.source!==frame.contentWindow)return;try{check(event.data.type==='legacy-edit'&&event.data.key==='f2'&&event.data.channel==='legacy-test','sandboxed preview tap sends exact field');check(!window.bad,'template scripts stay blocked');document.body.dataset.result='PASS';document.getElementById('result').textContent=checks.join(' | ');}catch(e){document.getElementById('result').textContent='FAIL '+e.message;}});
const click=doc.createElement('script');click.setAttribute('nonce','legacy-test');click.textContent="document.querySelector('p span').click()";doc.body.append(click);frame.srcdoc=doc.documentElement.outerHTML;document.body.append(frame);
`;
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tiklink-legacy-test-'));
const fixture=path.join(dir,'fixture.html');
fs.writeFileSync(fixture,`<!doctype html><body><pre id="result">PENDING</pre><script>${helper}\ntry{${checks}}catch(e){document.getElementById('result').textContent='FAIL '+e.stack;}</script></body>`);
const run=cp.spawnSync(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--user-data-dir='+path.join(dir,'profile'),'--virtual-time-budget=3000','--dump-dom','file:///'+fixture.replaceAll('\\','/')],{encoding:'utf8',timeout:45000,maxBuffer:5e6});
const result=run.stdout?.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
console.log(result||run.error||run.stderr);
require('node:assert/strict').ok(run.stdout?.includes('data-result="PASS"'),result||'Browser test failed');
});
