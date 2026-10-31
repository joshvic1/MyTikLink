const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {ingest,approve,build}=require('./category-assets.cjs');
const root=path.resolve(__dirname,'..');const queue=process.argv[2];
const read=async f=>JSON.parse((await fs.readFile(f,'utf8')).replace(/^\uFEFF/,''));
(async()=>{
 if(!queue)throw Error('Pass a source-journal directory');
 const files=(await fs.readdir(queue)).filter(f=>f.endsWith('.json'));
 for(const file of files){
  const entry=await read(path.join(queue,file));let record;
  try{record=await read(path.join(root,'assets/category-covers/records',file));}catch(e){if(e.code!=='ENOENT')throw e;}
  const hash=crypto.createHash('sha256').update(await fs.readFile(entry.path)).digest('hex');
  if(!record||record.source.sha256!==hash)record=await ingest(entry.id,entry.path);
  if(entry.reviewed===true&&record.status!=='ready')await approve(entry.id);
 }
 await build();
})().catch(e=>{console.error(e);process.exitCode=1;});
