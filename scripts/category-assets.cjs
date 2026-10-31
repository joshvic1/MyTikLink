/* Offline asset pipeline. Never run generation or encoding in a visitor request. */
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const sharp=require(path.join(root,'node_modules/sharp'));
const sourcePlan=path.join(root,'assets/category-covers/jobs.json');
const metaDir=path.join(root,'assets/category-covers/records');
const publicDir=path.join(root,'public/category-covers');
const archive=process.env.CATEGORY_IMAGE_ARCHIVE || 'C:/Users/pc/Documents/mytilink/category-image-library/originals';
const widths=[400,800,1200,1600];const budgets={webp:[25000,70000,140000,220000],avif:[18000,45000,90000,140000]};
async function json(file){return JSON.parse((await fs.readFile(file,'utf8')).replace(/^\uFEFF/,''));}
async function atomic(file,value){await fs.mkdir(path.dirname(file),{recursive:true});const tmp=file+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(tmp,JSON.stringify(value,null,2)+'\n');await fs.rename(tmp,file);}
function key(id){if(!/^[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(id))throw Error('Invalid category ID');return id.replaceAll('/','--');}
async function ingest(id,source){
 const active=await json(path.join(root,'V1.1/media/category-covers.generated.json'));if(active.baseUrl)throw Error('Category covers use Cloudflare R2. Use the cloud migration/upload workflow; local ingestion is disabled.');
 const plan=await json(sourcePlan),job=plan.jobs.find(j=>j.id===id);if(!job)throw Error('Category is not in the canonical job plan');
 const bytes=await fs.readFile(source),hash=crypto.createHash('sha256').update(bytes).digest('hex');
 const info=await sharp(bytes,{limitInputPixels:40000000}).metadata();if(!info.width||!info.height)throw Error('Image dimensions missing');
 const ratio=info.width/info.height;if(ratio<1.8||ratio>2.2)throw Error(`Cover is not near 2:1 (${info.width}x${info.height}); regenerate before ingestion`);
 const assetKey=key(id),revision=crypto.createHash('sha256').update(hash+'cover-v1').digest('hex').slice(0,16);
 const folder=path.join(publicDir,assetKey,revision);await fs.mkdir(folder,{recursive:true});await fs.mkdir(archive,{recursive:true});
 const master=path.join(archive,`${assetKey}-${hash.slice(0,16)}.${info.format}`);await fs.copyFile(source,master);
 const variants=[],warnings=[];if(info.width<1600)warnings.push('Source is smaller than the 1600px delivery size; inspect sharpness.');
 for(const format of ['avif','webp'])for(const [index,width]of widths.entries()){
  const floor=format==='avif'?43:68,start=format==='avif'?55:82;let quality=start,encoded;
  while(true){const pipeline=sharp(bytes).rotate().resize(width,width/2,{fit:'cover',position:'centre'}).toColourspace('srgb');encoded=await (format==='avif'?pipeline.avif({quality,effort:5,chromaSubsampling:'4:4:4'}):pipeline.webp({quality,effort:5})).toBuffer();if(encoded.length<=budgets[format][index]||quality===floor)break;quality=Math.max(floor,quality-4);}
  const filename=`${width}.${format}`;await fs.writeFile(path.join(folder,filename),encoded);
  if(encoded.length>budgets[format][index])warnings.push(`${filename} exceeds target budget (${encoded.length} bytes); kept quality floor.`);
  variants.push({format,width,height:width/2,bytes:encoded.length,quality,url:`/category-covers/${assetKey}/${revision}/${filename}`});
 }
 const record={schemaVersion:1,categoryId:id,label:job.label,parentId:job.parentId,assetKey,revision,status:'needs-review',alt:`Illustrative ${job.label.toLowerCase()} cover`,width:1600,height:800,focalPoint:{x:.5,y:.5},source:{sha256:hash,width:info.width,height:info.height,originalFilename:path.basename(source),provider:'OpenAI built-in image generation',prompt:job.prompt,generatedAt:new Date().toISOString()},variants,warnings};
 await atomic(path.join(metaDir,assetKey+'.json'),record);console.log(JSON.stringify({id,status:record.status,warnings,bytes:variants.reduce((n,v)=>n+v.bytes,0)}));return record;
}
async function approve(id){const file=path.join(metaDir,key(id)+'.json'),r=await json(file);r.status='ready';r.reviewedAt=new Date().toISOString();r.reviewChecklist=['category match','no text or logos','composition','compression quality'];await atomic(file,r);}
async function build(){
 const active=await json(path.join(root,'V1.1/media/category-covers.generated.json'));if(active.baseUrl)throw Error('Cloudflare manifest is active. Rebuild it with the cloud upload finalizer, not the legacy local pipeline.');
 const plan=await json(sourcePlan),entries={},counts={pending:0,needsReview:0,ready:0};const hashes=new Set();let totalBytes=0;
 for(const job of plan.jobs){let r;try{r=await json(path.join(metaDir,key(job.id)+'.json'));}catch(e){if(e.code!=='ENOENT')throw e;counts.pending++;continue;}
 if(hashes.has(r.source.sha256))throw Error('Duplicate source image: '+job.id);hashes.add(r.source.sha256);
 if(r.status!=='ready'){counts.needsReview++;continue;}counts.ready++;
 for(const v of r.variants){const f=path.join(root,'public',v.url);const stat=await fs.stat(f);if(stat.size!==v.bytes)throw Error('Asset size mismatch: '+f);totalBytes+=v.bytes;}
 entries[job.id]={parentId:job.parentId,alt:r.alt,assetKey:r.assetKey,revision:r.revision,focalPoint:r.focalPoint};
 }
 const manifest={schemaVersion:1,expectedCount:plan.expectedCount,readyCount:counts.ready,aspectRatio:2,entries};
 await atomic(path.join(root,'V1.1/media/category-covers.generated.json'),manifest);
 await atomic(path.join(root,'assets/category-covers/status.json'),{...counts,expected:plan.expectedCount,totalBytes,updatedAt:new Date().toISOString()});
 console.log(JSON.stringify({...counts,expected:plan.expectedCount,totalBytes}));
}
async function validate(){const plan=await json(sourcePlan);if(plan.jobs.length!==735||new Set(plan.jobs.map(j=>j.id)).size!==735)throw Error('Expected 735 unique jobs');const registry=await fs.readFile(path.join(root,'../backend/V1.1/onboarding/categoryRegistry.js'),'utf8');const categories=JSON.parse(registry.slice(registry.indexOf('['),registry.indexOf('];')+1));if(categories.length!==735||plan.jobs.some(j=>!categories.some(c=>c.id===j.id)))throw Error('Job plan differs from canonical registry');await build();const status=await json(path.join(root,'assets/category-covers/status.json'));if(process.argv.includes('--complete')&&status.ready!==735)throw Error(`Incomplete: ${status.ready}/735 ready`);}
if(require.main===module){const [command,id,source]=process.argv.slice(2);const task=command==='ingest'?ingest(id,source):command==='approve'?approve(id):command==='build'?build():command==='validate'?validate():Promise.reject(Error('Usage: category-assets.cjs ingest <category-id> <source> | approve <id> | build | validate [--complete]'));task.catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={ingest,approve,build,key,budgets,widths};
