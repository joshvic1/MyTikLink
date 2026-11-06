import {useState,useRef} from 'react';
// Keep the editing buffer independent of consumers that store numbers/minor units.
// Empty and partial decimal values must survive until the field is blurred.
export default function NumericInput({value,onChange,onFocus,onBlur,min=0,step=1,...props}){
 const [draft,setDraft]=useState(''),[editing,setEditing]=useState(false);
 const input=useRef(null);
 return <input {...props} ref={input} type="number" min={min} step={step} inputMode={step===1||step==='1'?'numeric':'decimal'} value={editing?draft:value??''}
 onFocus={e=>{setDraft(String(value??''));setEditing(true);if(Number(value)===0)e.target.select();onFocus?.(e);}}
 onChange={e=>{setDraft(e.target.value);onChange?.(e);}}
 onBlur={e=>{setEditing(false);onBlur?.(e);}}/>;
}
