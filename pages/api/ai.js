import aiKnowledge from '@/utils/aiKnowledge';
import {smartAssistantKnowledge} from '@/config/smartAssistantConfig';
import {planConfig} from '@/config/planConfig';
import {v11ApiBase} from '../../V1.1/lib/apiBase';
import {resolveVersion} from '../../support/knowledge.mjs';
import {normalizeMessages,responsePayload,allowRequest,buildPrompt} from '../../support/server.mjs';

export const config={api:{bodyParser:{sizeLimit:'64kb'}}};
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 let messages;try{messages=normalizeMessages(req.body?.messages);}catch(e){return res.status(400).json({error:e.message});}
 const authorization=req.headers.authorization;
 if(authorization&&!/^Bearer \S+$/i.test(authorization))return res.status(401).json({error:'Please sign in again.'});
 try{
  let user=null,preference=null;
  if(authorization){
   const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,'')}/auth/me`,{headers:{Authorization:authorization},redirect:'error',signal:AbortSignal.timeout(8000)});
   if(!response.ok)return res.status([401,403].includes(response.status)?response.status:503).json({error:'Could not verify your account. Please sign in again or retry.'});
   const profile=await response.json();user=profile.user;
   if(!user?._id||user.suspendedAt||user.deletedAt)return res.status(403).json({error:'Account access is unavailable.'});
   // Preference availability must not break public support during a staged backend rollout.
   try{const pref=await fetch(`${v11ApiBase()?.replace(/\/$/,'')}/auth/dashboard-preference`,{headers:{Authorization:authorization},redirect:'error',signal:AbortSignal.timeout(6000)});if(pref.ok)preference=(await pref.json()).version;}catch{}
   preference=preference||user.preferredDashboard||null;
  }
  const key=user?`user:${user._id}`:`guest:${req.socket?.remoteAddress||'unknown'}`;
  if(!allowRequest(key)){res.setHeader('Retry-After','60');return res.status(429).json({error:'You have sent several messages. Please wait a minute and try again.'});}
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'MyTikLink AI is temporarily unavailable. Please use WhatsApp or email support.'});
  const question=messages.at(-1).content,version=resolveVersion(question,preference);
  const planFacts=Object.fromEntries(Object.entries(planConfig).map(([id,p])=>[id,{links:Number.isFinite(p.maxLinks)?p.maxLinks:'unlimited',clicks:Number.isFinite(p.maxClicks)?p.maxClicks:'unlimited'}]));
  const prompt=buildPrompt({question,version,route:req.body?.smartContext?.route,plan:user?.plan,legacyText:aiKnowledge+'\n\n'+smartAssistantKnowledge,planFacts});
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages:[{role:'system',content:prompt},...messages],response_format:{type:'json_object'},max_tokens:2300}),signal:AbortSignal.timeout(30000)});
  const data=await response.json().catch(()=>({}));const content=data.choices?.[0]?.message?.content;
  if(!response.ok||!content)return res.status(502).json({error:'The assistant could not answer right now. Please retry in a moment.'});
  return res.status(200).json({...responsePayload(content,question),version});
 }catch{return res.status(503).json({error:'Could not reach the assistant. Please check your connection and retry.'});}
}
