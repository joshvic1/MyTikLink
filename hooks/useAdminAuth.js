"use client";
import {useEffect,useState} from 'react';
import {request} from '@/components/control/api';
export default function useAdminAuth(){
 const [token,setToken]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{const c=new AbortController();request('/control/me',{signal:c.signal}).then(()=>setToken('session')).catch(()=>setToken(null)).finally(()=>setLoading(false));return()=>c.abort();},[]);
 const logout=async()=>{try{await request('/staff/logout',{method:'POST',body:{}});}finally{setToken(null);}};
 return {token,loading,logout};
}
