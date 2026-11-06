import {adminBackend,sameOrigin,sessionHeaders,sessionCookie} from '@/utils/server/adminProxy';
export const config={api:{bodyParser:false},maxDuration:60};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(!['GET','POST','PATCH','PUT','DELETE'].includes(req.method))return res.status(405).json({message:'Method not allowed.'});
 if(req.method!=='GET'&&!sameOrigin(req))return res.status(403).json({message:'Invalid request origin.'});
 const parts=req.query.path||[],route=parts.join('/');if(parts.some(p=>p==='.'||p==='..'||!/^[-a-zA-Z0-9_.]+$/.test(p))||!(parts[0]==='admin'||route==='upload/admin'))return res.status(404).json({message:'Unknown administration tool.'});
 const base=adminBackend(req);if(!base)return res.status(503).json({message:'Administration API is not configured.'});
 try{
  const auth=await fetch(`${base}/api/control/me`,{headers:sessionHeaders(req),signal:AbortSignal.timeout(10000)});const actor=await auth.json();
  if(!auth.ok||!actor.actor?.superAdmin){if(auth.status===401)sessionCookie(res,'');return res.status(auth.ok?403:auth.status).json({message:'This tool requires a verified Super Admin session.'});}
  let body;if(req.method!=='GET'){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>10*1024*1024)return res.status(413).json({message:'Upload exceeds 10 MB.'});chunks.push(chunk);}body=Buffer.concat(chunks);}
  const query=new URLSearchParams();for(const [key,value]of Object.entries(req.query))if(key!=='path'&&typeof value==='string')query.set(key,value);
  const response=await fetch(`${base}/api/${parts.map(encodeURIComponent).join('/')}${query.size?'?'+query:''}`,{method:req.method,headers:{...sessionHeaders(req),...(req.headers['content-type']?{'Content-Type':req.headers['content-type']}:{})},...(body?{body}:{}),signal:AbortSignal.timeout(45000)});
  res.setHeader('Content-Type',response.headers.get('content-type')||'application/json');if(response.headers.get('content-disposition'))res.setHeader('Content-Disposition',response.headers.get('content-disposition'));res.setHeader('X-Content-Type-Options','nosniff');res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
 }catch{res.status(502).json({message:'The administration tool could not complete this request.'});}
}
