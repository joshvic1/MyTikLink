import { useCallback, useEffect, useRef, useState } from 'react';
import { v11Api } from '../lib/api';
export function useLinkCollection(search='',page=1,revision=0) {
 const [state,setState]=useState({links:[],summary:null,total:0,totalPages:1,loading:true,error:''});
 const sequence=useRef(0);
 const refresh=useCallback(async()=>{
  const current=++sequence.current;setState(s=>({...s,loading:true,error:''}));
  try {
   const result=await v11Api.linkCollection({search,page});
   if(!Array.isArray(result?.links)||!result.summary)throw new Error('Invalid response');
   if(sequence.current===current)setState({...result,loading:false,error:''});
  }catch{if(sequence.current===current)setState(s=>({...s,loading:false,error:'Could not load your redirect links. Your existing results are still shown. Please try again.'}));}
 },[search,page,revision]);
 useEffect(()=>{const timer=setTimeout(refresh,search?250:0);return()=>{clearTimeout(timer);sequence.current++;};},[refresh,search]);
 return {...state,refresh};
}
