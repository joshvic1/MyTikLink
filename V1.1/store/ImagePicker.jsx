import {useState} from "react";
import {apiRequest} from "../lib/api";
export default function ImagePicker({label,value,onChange}){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 const upload=async e=>{const file=e.target.files?.[0];if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setError("Choose a JPG, PNG or WebP image smaller than 5 MB.");return;}setBusy(true);setError("");try{const body=new FormData();body.append("image",file);const result=await apiRequest("/upload",{method:"POST",body,timeoutMs:60000});onChange(result.url);}catch(e){setError(e.message);}finally{setBusy(false);}};
 return <div><label style={{display:"grid",gap:10,fontSize:12}}>{label}{value&&<img src={value} alt="Selected image" style={{maxHeight:90,maxWidth:"100%",objectFit:"contain"}}/>}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload}/></label>{busy&&<small role="status">Uploading…</small>}{value&&<button onClick={()=>onChange("")}>Remove image</button>}{error&&<p role="alert">{error}</p>}</div>;
}
