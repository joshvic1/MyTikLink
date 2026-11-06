import {createContext,useContext,useEffect,useState} from 'react';
import {convertMinor,currencyDigits} from './currencies.mjs';
const baseFormat=(minor,currency='NGN')=>new Intl.NumberFormat('en-NG',{style:'currency',currency}).format(Number(minor||0)/100);
const Context=createContext({code:'NGN',base:'NGN',options:[],formatMinor:baseFormat,formatMajor:(v,c)=>baseFormat(Math.round(Number(v||0)*100),c)});
export function DisplayCurrencyProvider({slug,checkout={},children}){
 const [configuration,setConfiguration]=useState(checkout),[selected,setSelected]=useState('NGN');
 const base=configuration.currency||'NGN',options=base==='NGN'?[{code:'NGN',nairaPerUnit:'1'},...(configuration.displayCurrencies||[])]:[{code:base,nairaPerUnit:'1'}];
 const choice=options.find(x=>x.code===selected)||options[0];
 useEffect(()=>{try{setSelected(localStorage.getItem(`store-currency:${slug}`)||base);}catch{setSelected(base);}},[slug]);
 const select=code=>{setSelected(code);try{localStorage.setItem(`store-currency:${slug}`,code);}catch{}};
 const formatMinor=(minor,currency=base)=>{if(base!=='NGN'||currency!=='NGN')return baseFormat(minor,currency);return new Intl.NumberFormat('en-NG',{style:'currency',currency:choice.code}).format(convertMinor(Number(minor||0),choice.code,choice.nairaPerUnit)/10**currencyDigits(choice.code));};
 return <Context.Provider value={{code:choice.code,base,options,select,setConfiguration,formatMinor,formatMajor:(v,c)=>formatMinor(Math.round(Number(v||0)*100),c)}}>{children}</Context.Provider>;
}
export const useDisplayCurrency=()=>useContext(Context);
export function CurrencyConfiguration({checkout}){const {setConfiguration}=useDisplayCurrency();useEffect(()=>{if(checkout)setConfiguration?.(checkout);},[checkout,setConfiguration]);return null;}
export function CurrencySelector(){const {options,code,select}=useDisplayCurrency();if(options.length<2)return null;return <label style={{display:'grid',gap:6,padding:12,fontSize:13}}>Currency<select aria-label="Display currency" value={code} onChange={e=>select(e.target.value)} style={{padding:10,border:'1px solid #ddd',borderRadius:8,background:'#fff',color:'#222'}}>{options.map(x=><option key={x.code}>{x.code}</option>)}</select></label>;}
