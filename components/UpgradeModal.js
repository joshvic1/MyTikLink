import {useState} from 'react';
import {SubscriptionModal} from '@/V1.1/components/SubscriptionModal';
import {useV11Session} from '@/V1.1/lib/useV11Session';
export default function UpgradeModal({currentPlan,setShowModal,onUpgrade}){
 const session=useV11Session({required:false});const [state,setState]=useState({mode:'upgrade',preselected:'pro'});
 return <SubscriptionModal state={state} update={setState} user={session.user||{plan:currentPlan}} refreshSession={async()=>{const user=await session.refresh();onUpgrade?.(user);return user;}} close={()=>setShowModal(false)}/>;
}
