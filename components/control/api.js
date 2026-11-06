export function apiBase(){return '/api/staff/legacy';}
let migration;
async function migrateSession(){
 if(typeof window==='undefined')return;
 if(!migration)migration=(async()=>{const token=localStorage.getItem('admin_token');if(/^[a-f0-9]{64}$/.test(token||'')){const r=await fetch('/api/staff/adopt-admin-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});if(r.status>=500)throw Error('Session migration is temporarily unavailable. Please reload.');}localStorage.removeItem('admin_token');})().catch(error=>{migration=null;throw error;});
 return migration;
}
export async function request(path,{method='GET',body,signal}={}){
 if(path!=='/staff/login')await migrateSession();
 const url=path.startsWith('/control/')?'/api/staff'+path:'/api'+path;
 const response=await fetch(url,{method,signal,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok){const error=Object.assign(Error(data.message||`Request failed (${response.status}).`),{status:response.status});if(response.status===401&&typeof window!=='undefined')window.dispatchEvent(new Event('admin-session-ended'));throw error;}
 return data;
}
