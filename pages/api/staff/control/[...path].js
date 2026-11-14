import {adminBackend,sameOrigin,sessionCookie,sessionHeaders} from '@/utils/server/adminProxy';
export const config={api:{bodyParser:{sizeLimit:'64kb'}},maxDuration:60};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST','PATCH','PUT'].includes(req.method))return res.status(405).json({message:'Method not allowed.'});
 if(req.method!=='GET'&&!sameOrigin(req))return res.status(403).json({message:'Invalid request origin.'});
 const parts=req.query.path||[];if(!parts.length||parts.some(p=>!/^[-a-zA-Z0-9]+$/.test(p)))return res.status(404).json({message:'Unknown admin route.'});
 const base=adminBackend(req);if(!base)return res.status(503).json({message:'Administration API is not configured.'});
 const query=new URLSearchParams();for(const key of ['intent','category','accountType','businessMode','businessFocus','summary','recovery','from','to','productType','paymentStatus','provider','cohort','account','id','search','ownerSearch','owner','status','plan','cycle','page','limit','sort','template'])if(typeof req.query[key]==='string')query.set(key,req.query[key]);
 try{const response=await fetch(`${base}/api/control/${parts.join('/')}${query.size?'?'+query:''}`,{method:req.method,headers:{...sessionHeaders(req),'Content-Type':'application/json'},...(req.method==='GET'?{}:{body:JSON.stringify(req.body||{})}),signal:AbortSignal.timeout(30000)});if(response.status===401)sessionCookie(res,'');res.status(response.status).json(await response.json());}
 catch{res.status(502).json({message:'The administration service could not be reached. Please try again.'});}
}
