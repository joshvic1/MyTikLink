// The backend registry is canonical. Run after editing defaultDescription fields.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'../backend/V1.1/onboarding/categoryRegistry.js'),'utf8');
const categories=JSON.parse(source.slice(source.indexOf('['),source.indexOf('];')+1));
for(const category of categories){if(typeof category.defaultDescription!=='string'||category.defaultDescription.split('\n').length!==3)throw Error(`Expected three lines: ${category.id}`);}
fs.writeFileSync(path.join(root,'V1.1/landing/categoryDescriptions.generated.json'),JSON.stringify(Object.fromEntries(categories.map(c=>[c.id,c.defaultDescription])),null,2)+'\n');
console.log(`Synced ${categories.length} descriptions`);
