import {useEffect,useState} from 'react';
import {apiRequest} from '../lib/api';
export default function useStoreSetup(storeId){
 const [progress,setProgress]=useState(null);
 useEffect(()=>{if(!storeId){setProgress(null);return;}let active=true;const refresh=()=>apiRequest('/v1-1/store-studio/commerce/setup-progress',{cache:'no-store'}).then(data=>{if(active)setProgress(data)}).catch(()=>{});refresh();window.addEventListener('focus',refresh);return()=>{active=false;window.removeEventListener('focus',refresh)}},[storeId]);
 return progress;
}
