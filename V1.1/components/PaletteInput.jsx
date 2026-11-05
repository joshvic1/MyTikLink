import {ColorPicker} from '../landing/EditorInputs';
export default function PaletteInput({value,onChange,onInput,disabled,...props}){
 return <ColorPicker label={props['aria-label']||'Choose colour'} value={value||'#6336ff'} disabled={disabled} onChange={color=>{const event={target:{value:color},currentTarget:{value:color}};onChange?.(event);onInput?.(event);}}/>;
}
