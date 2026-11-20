import {useMemo} from 'react';
import {useRouter} from 'next/router';
import dynamic from 'next/dynamic';
import Shell from '@/components/control/Shell';
import {request} from '@/components/control/api';
import {DesignApiContext} from '@/V1.1/store/DesignApi';
const StoreStudio=dynamic(()=>import('@/V1.1/store/StoreStudio'),{ssr:false});
export default function AdminStoreDesign(){
 const {query,isReady}=useRouter();const id=query.storeId;
 const api=useMemo(()=>(path,options={})=>{
  const relative=path.replace(/^\/v1-1\/store-studio/,'');
  if(options.body instanceof Blob){
   const asset=relative.match(/^\/commerce\/media\/([a-zA-Z0-9-]+)\/relay$/)?.[1];
   if(!asset)throw Error('Unsupported image upload.');
   return fetch(`/api/admin-store-media/${id}/${asset}`,{method:'POST',headers:options.headers,body:options.body}).then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.message||'Image upload failed.');return data;});
  }
  return request(`/control/stores/${id}/design${relative}`,{...options,body:typeof options.body==='string'?JSON.parse(options.body):options.body});
 },[id]);
 return <Shell module="stores">{isReady&&<DesignApiContext.Provider value={api}><StoreStudio key={id} adminMode backHref="/admin/control/stores"/></DesignApiContext.Provider>}</Shell>;
}
