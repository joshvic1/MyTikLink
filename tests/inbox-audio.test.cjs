const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('audio plays inline without preloading and cycles 1x through 3x back to 1x',async()=>{
 const swc=require(root+'/node_modules/next/dist/build/swc');await swc.loadBindings();
 const values=[];let cursor=0,played=0,paused=0;
 const player={playbackRate:1,play:async()=>played++,pause:()=>paused++,load(){}};
 const react={useRef:()=>({current:player}),useState(initial){const i=cursor++;if(!(i in values))values[i]=initial;return[values[i],v=>values[i]=v];}};
 const module={exports:{}};
 const code=swc.transformSync(fs.readFileSync(root+'/components/StaffInbox/AudioPlayer.jsx','utf8'),{filename:'AudioPlayer.jsx',jsc:{parser:{syntax:'ecmascript',jsx:true},transform:{react:{runtime:'automatic'}}},module:{type:'commonjs'}}).code;
 vm.runInNewContext(code,{module,exports:module.exports,require(spec){if(spec==='react')return react;return require(require.resolve(spec,{paths:[root]}));}});
 const nodes=n=>!n||typeof n!=='object'?[]:[n,...[n.props?.children].flat(Infinity).flatMap(nodes)];
 const render=()=>{cursor=0;return nodes(module.exports.default({src:'/test-audio'}));};
 let tree=render();assert.equal(tree.find(n=>n.type==='audio').props.preload,'none');assert.ok(!tree.some(n=>n.type==='select'));
 for(const speed of [1.5,2,2.5,3,1]){tree.find(n=>n.props?.['aria-label']?.startsWith('Playback speed')).props.onClick();tree=render();assert.equal(player.playbackRate,speed);assert.equal(tree.find(n=>n.props?.['aria-label']?.startsWith('Playback speed')).props.children.join(''),speed+'x');}
 await tree.find(n=>n.props?.['aria-label']==='Play audio').props.onClick();assert.equal(played,1);
 tree.find(n=>n.type==='audio').props.onPlaying();tree=render();await tree.find(n=>n.props?.['aria-label']==='Pause audio').props.onClick();assert.equal(paused,1);
});
