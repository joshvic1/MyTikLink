const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'../backend/V1.1/onboarding/categoryRegistry.js'),'utf8');
const categories=JSON.parse(source.slice(source.indexOf('['),source.indexOf('];')+1));
const definitions={},byCategory={};
for(const c of categories){const actions=c.defaultActions;if(actions.length!==10||new Set(actions.map(a=>a.id)).size!==10||actions[0].id!=='whatsapp')throw Error('Invalid CTA list: '+c.id);byCategory[c.id]=actions.map(({rank,hot,...action})=>{const key=JSON.stringify(action);let id=Object.keys(definitions).find(id=>JSON.stringify(definitions[id])===key);if(!id){id=String(Object.keys(definitions).length);definitions[id]=action;}return id;});}
fs.writeFileSync(path.join(root,'V1.1/landing/categoryActions.generated.json'),JSON.stringify({definitions,byCategory})+'\n');
console.log(`Synced ${categories.length} categories; shared ${Object.keys(definitions).length} CTA definitions`);
