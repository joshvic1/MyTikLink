import dynamic from 'next/dynamic';
// Sample timestamps are generated in the browser so cached server renders cannot drift.
const StaffInbox = dynamic(() => import('../../components/StaffInbox/StaffInbox'), {ssr:false});
export default function StaffPreview(){return <StaffInbox demo/>}
