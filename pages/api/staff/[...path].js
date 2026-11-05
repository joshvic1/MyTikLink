export const config={api:{bodyParser:{sizeLimit:'64kb'}},maxDuration:60};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST','PATCH'].includes(req.method))return res.status(405).json({message:'Method not allowed'});
 if(req.method!=='GET'){let origin;try{origin=new URL(req.headers.origin).host}catch{return res.status(403).json({message:'Invalid request origin.'})}if(origin!==req.headers.host)return res.status(403).json({message:'Invalid request origin.'})}
 const path=(req.query.path||[]).map(encodeURIComponent).join('/');
 if(!/^(login|logout|me|password|team(?:\/[a-f0-9]{24})?|connection|gmail\/(connect|sync)|conversations(?:\/[a-f0-9]{24}(?:\/(read|messages))?)?|messages\/[a-f0-9]{24}\/attachments\/[a-f0-9]{24})$/.test(path))return res.status(404).end();
 const base=(process.env.STAFF_API_URL||process.env.NEXT_PUBLIC_API_URL||'').replace(/\/$/,'');if(!base)return res.status(503).json({message:'Staff API is not configured.'});
 const cookie=token=>res.setHeader('Set-Cookie',`staff_session=${token}; HttpOnly; SameSite=Lax; Path=/api/staff; Max-Age=${token?43200:0}${process.env.NODE_ENV==='production'?'; Secure':''}`);
 try{const q=new URLSearchParams();for(const k of ['view','status','channel','search','page','before'])if(typeof req.query[k]==='string')q.set(k,req.query[k]);
 const upstream=await fetch(`${base}/api/staff/${path}${q.size?'?'+q:''}`,{method:req.method,headers:{'Content-Type':'application/json',...(req.cookies.staff_session?{Authorization:'Bearer '+req.cookies.staff_session}:{})},...(req.method!=='GET'?{body:JSON.stringify(req.body||{})}:{}),signal:AbortSignal.timeout(path==='gmail/sync'?55000:30000)});
 if(upstream.status===401)cookie('');if(upstream.headers.get('content-disposition')){res.setHeader('Content-Disposition',upstream.headers.get('content-disposition'));res.setHeader('Content-Type','application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');return res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()))}
 const data=await upstream.json();if(path==='login'&&data.token){cookie(data.token);delete data.token}if(path==='logout')cookie('');res.status(upstream.status).json(data);
 }catch{res.status(502).json({message:'The inbox service is taking longer than expected. Please try again.'})}
}
