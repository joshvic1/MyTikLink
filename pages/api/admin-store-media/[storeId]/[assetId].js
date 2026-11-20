import {adminBackend,sameOrigin,sessionHeaders} from '@/utils/server/adminProxy';
export const config={api:{bodyParser:false},maxDuration:60};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).end();
 if(!sameOrigin(req))return res.status(403).json({message:'Invalid request origin.'});
 const {storeId,assetId}=req.query,type=req.headers['content-type'];
 if(!/^[a-f0-9]{24}$/i.test(storeId||'')||!/^[a-zA-Z0-9-]+$/.test(assetId||'')||!['image/jpeg','image/png','image/webp'].includes(type))return res.status(400).json({message:'Invalid image upload.'});
 const base=adminBackend(req);if(!base)return res.status(503).json({message:'Administration API is not configured.'});
 try{let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>5*1024*1024)return res.status(413).json({message:'Choose an image under 5 MB.'});chunks.push(chunk);}
 const response=await fetch(`${base}/api/control/stores/${storeId}/design/commerce/media/${assetId}/relay`,{method:'POST',headers:{...sessionHeaders(req),'Content-Type':type},body:Buffer.concat(chunks),signal:AbortSignal.timeout(55000)});
 res.status(response.status).json(await response.json());
 }catch{res.status(502).json({message:'Image upload could not complete. Please try again.'});}
}
