import {Globe2} from 'lucide-react';
import {useState} from 'react';
export default function FlagIcon({code}){
 const [failed,setFailed]=useState('');
 const country=String(code||'').toLowerCase();
 return /^[a-z]{2}$/.test(country)&&failed!==country?<img src={`/flags/${country}.svg`} alt="" aria-hidden="true" width={24} height={18} loading="lazy" onError={()=>setFailed(country)} style={{display:'inline-block',width:24,height:18,objectFit:'cover',borderRadius:3,flexShrink:0,verticalAlign:'middle',boxShadow:'0 0 0 1px #00000012'}}/>:<Globe2 size={20} aria-hidden="true" style={{flexShrink:0,verticalAlign:'middle'}}/>;
}
