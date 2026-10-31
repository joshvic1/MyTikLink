import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { apiRequest, getToken } from "../../../V1.1/lib/api";
import { allThemes } from "../../../V1.1/landing/themeLibrary";
import { createThemeInstance } from "../../../V1.1/landing/themeModel";
import ThemeRenderer from "../../../V1.1/landing/ThemeRenderer";

const themes=allThemes.filter(theme=>theme.batch === "universal");
export default function MyTemplatePreview(){
 const router=useRouter();
 const [profile,setProfile]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[reload,setReload]=useState(0);
 const theme=themes.find(item=>item.id===router.query.theme) || themes.find(item=>item.id==="universal-profile");
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError("");setProfile(null);
  if(!getToken()){setError("Open this link in the same browser where you signed in to MyTikLink, then refresh.");setLoading(false);return ()=>controller.abort();}
  apiRequest("/v1-1/onboarding",{signal:controller.signal}).then(result=>{if(!controller.signal.aborted)setProfile(result.data || {});}).catch(err=>{if(!controller.signal.aborted)setError(err.status===401?"Your session has expired. Sign in again in this browser, then refresh.":err.message || "Could not load your saved details.");}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[reload]);
 const instance=useMemo(()=>profile ? createThemeInstance(theme,profile) : null,[theme,profile]);
 return <><Head><title>Your personalized template preview | MyTikLink</title><meta name="robots" content="noindex,nofollow"/></Head>
 <header style={{padding:"14px 18px",background:"#181c19",color:"white",fontSize:13,display:"flex",flexWrap:"wrap",alignItems:"center",gap:12}}>
  <strong>Your saved profile preview</strong>
  <label>Template <select aria-label="Preview template" value={theme.id} onChange={event=>router.replace({pathname:router.pathname,query:{theme:event.target.value}},undefined,{shallow:true})} style={{padding:8,background:"white",color:"#202020",borderRadius:6}}>{themes.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
  <button disabled={loading} onClick={()=>setReload(value=>value+1)} style={{padding:8,background:"white",color:"#202020",borderRadius:6}}>Refresh saved details</button>
  <a href="/v1-1" style={{color:"white"}}>Continue setup</a>
 </header>
 {loading?<p role="status" style={{padding:24}}>Loading your saved details…</p>:error?<p role="alert" style={{padding:24}}>{error}</p>:<>
 <p style={{padding:"10px 18px",margin:0,fontSize:12,background:"#f2f4f0",color:"#3c453d"}}>Private preview of what you have saved so far. Missing details use template or category defaults. Nothing is published. WhatsApp uses your saved number.</p>
 <ThemeRenderer instance={instance}/>
 </>}
 </>;
}
