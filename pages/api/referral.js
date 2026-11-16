export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');if(!['GET','POST'].includes(req.method))return res.status(405).end();
 if(req.method==='POST'){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).end()}catch{return res.status(403).end()}}
 const base=(process.env.NODE_ENV==='development'&&process.env.NEXT_PUBLIC_V11_API_URL||process.env.NEXT_PUBLIC_API_URL||'').replace(/\/$/,'');
 const token=req.cookies.mtl_referral;const body=req.method==='POST'?req.body:{token};if(req.method==='GET'&&!token)return res.json({code:null});
 try{const upstream=await fetch(base+'/v1-1/referral/'+(req.method==='POST'?'attribution':'restore'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});const data=await upstream.json();
 if(upstream.ok&&req.method==='POST'&&data.token)res.setHeader('Set-Cookie',`mtl_referral=${data.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${process.env.NODE_ENV==='production'?'; Secure':''}`);
 res.status(upstream.status).json(data);
 }catch{res.status(503).json({message:'Referral verification is temporarily unavailable.'})}
}
