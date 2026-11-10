import CustomerAccountPage from "@/components/store/public/customer/CustomerAccountPage";

export default function AccountPage() {
  return <CustomerAccountPage />;
}

export async function getServerSideProps(context){const {resolveStorefront}=await import('@/V1.1/lib/storefrontRouting.mjs');return await resolveStorefront(context,{account:true})||{props:{}};}
