import {adminBackend,sameOrigin,sessionCookie} from '@/utils/server/adminProxy';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).end();
 if(!sameOrigin(req))return res.status(403).json({message:'Invalid request origin.'});
 const token=req.cookies.staff_session;if(!token)return res.status(401).json({message:'Sign in to your inbox first.'});
 try{const r=await fetch(adminBackend(req)+'/api/control/me',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok||!data.actor?.superAdmin)return res.status(r.ok?403:r.status).json({message:'This account does not have administrator access.'});sessionCookie(res,token);res.json({ok:true});}
 catch{return res.status(503).json({message:'Unable to open the admin dashboard. Please try again.'})}
}
