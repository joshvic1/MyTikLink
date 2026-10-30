import { useState } from "react";
import { SubscriptionModal } from "../components/SubscriptionModal";
import { useV11Session } from "../lib/useV11Session";
export default function UpgradeModal({setShowModal,onUserUpdated}){
 const session=useV11Session({required:false});
 const [state,setState]=useState({mode:"upgrade",preselected:"pro"});
 return <SubscriptionModal state={state} update={setState} user={session.user} refreshSession={async()=>{const user=await session.refresh();if(user)onUserUpdated?.(user);return user;}} close={()=>setShowModal(false)}/>;
}
