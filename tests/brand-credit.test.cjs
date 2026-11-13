const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('existing credits route by resource type without changing colour, text or decoration',async()=>{
 const root=path.resolve(__dirname,'..'),swc=require(root+'/node_modules/next/dist/build/swc');await swc.loadBindings();const module={exports:{}};
 const code=swc.transformSync(fs.readFileSync(root+'/components/marketing/BrandCredit.jsx','utf8'),{filename:'BrandCredit.jsx',jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,require:s=>require(require.resolve(s,{paths:[root]}))});
 const Credit=module.exports.default;
 for(const store of [false,true]){const node=Credit({store,children:'Made with MyTikLink'});assert.equal(node.type,'a');assert.equal(node.props.href,'https://mytiklink.com/made-with/'+(store?'stores':'landing-pages'));assert.equal(node.props.style.color,'inherit');assert.equal(node.props.style.textDecoration,'none');assert.equal(node.props.children,'Made with MyTikLink');}
 const preview=Credit({preview:true,children:'Made with MyTikLink'});assert.equal(preview.props.href,undefined);
 assert.ok(!fs.readFileSync(root+'/V1.1/landing/ShortThemeRenderer.jsx','utf8').includes('BrandCredit'));
});
