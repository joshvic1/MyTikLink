import {useEffect,useState} from "react";
import Head from "next/head";
import {apiRequest} from "../lib/api";
import {ErrorState,LoadingState} from "../components/UI";
import {CartProvider} from "@/components/store/context/CartContext";
import CartDrawer from "@/components/store/public/CartDrawer";
import StoreRenderer from "./StoreRenderer";
export default function PublicStore({slug}){
 const [data,setData]=useState(null),[error,setError]=useState(""),[cart,setCart]=useState(false);
 useEffect(()=>{let active=true;setData(null);setError("");apiRequest(`/v1-1/store-studio/public/${encodeURIComponent(slug)}`,{token:null}).then(d=>active&&setData(d)).catch(e=>active&&setError(e.message));return()=>{active=false;};},[slug]);
 if(error)return <ErrorState title="Storefront unavailable" message={error}/>;if(!data)return <LoadingState/>;
 return <CartProvider><Head><title>{data.store.name}</title></Head><StoreRenderer {...data} onCart={()=>setCart(true)}/><CartDrawer open={cart} onClose={()=>setCart(false)}/></CartProvider>;
}
