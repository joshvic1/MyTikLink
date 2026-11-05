import {ColorPicker as Palette} from "../../../V1.1/landing/EditorInputs";
export default function ColorPicker({value,onChange}){
 return <Palette label="Choose colour" value={value||'#6336ff'} onChange={onChange}/>;
}
