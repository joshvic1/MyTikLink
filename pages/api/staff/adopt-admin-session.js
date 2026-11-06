import {adminBackend,sameOrigin,sessionCookie} from '@/utils/server/adminProxy';
export const config={api:{bodyParser:{sizeLimit:'2kb'}}};
// One-time migration of an already-issued opaque Inbox session. No identity is created.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({message:'Method not allowed.'});
 if(!sameOrigin(req))return res.status(403).json({message:'Invalid request origin.'});
 const token=req.body?.token;if(!/^[a-f0-9]{64}$/.test(token||''))return res.status(401).json({message:'Sign in again.'});
 const base=adminBackend(req);if(!base)return res.status(503).json({message:'Administration API is not configured.'});
 try{const response=await fetch(`${base}/api/control/me`,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(10000)});if(!response.ok)return res.status(response.status).json({message:'Sign in again.'});sessionCookie(res,token);res.json({ok:true});}
 catch{res.status(502).json({message:'Session verification is temporarily unavailable.'});}
}
