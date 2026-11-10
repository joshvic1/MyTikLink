import {adminBackend} from '@/utils/server/adminProxy';
export const config={api:{bodyParser:false},maxDuration:60};
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).end();
 const base=adminBackend(req);if(!base)return res.status(503).end();
 const controller=new AbortController();let reader;
 const stop=()=>{controller.abort();reader?.cancel().catch(()=>{})};res.on('close',stop);
 const timeout=setTimeout(stop,29000);
 try{
   const upstream=await fetch(base+'/api/staff/events',{headers:{Authorization:'Bearer '+(req.cookies.staff_session||'')},signal:controller.signal});
   if(!upstream.ok)return res.status(upstream.status).end();
   res.setHeader('Content-Type','text/event-stream');res.setHeader('Cache-Control','no-cache, no-transform');res.setHeader('X-Accel-Buffering','no');res.flushHeaders();
   reader=upstream.body.getReader();
   while(!res.destroyed){const {done,value}=await reader.read();if(done)break;res.write(Buffer.from(value));}
 }catch{if(!res.headersSent)res.status(502);}finally{clearTimeout(timeout);res.off('close',stop);reader?.cancel().catch(()=>{});res.end();}
}
