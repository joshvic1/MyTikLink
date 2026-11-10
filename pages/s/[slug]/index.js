import PublicStorefront from "@/components/store/public/PublicStorefront";

import { CartProvider } from "@/components/store/context/CartContext";
export default function StorePage() {
  return (
    <CartProvider>
      <PublicStorefront />
    </CartProvider>
  );
}

export async function getServerSideProps(context){const {resolveStorefront}=await import('@/V1.1/lib/storefrontRouting.mjs');return await resolveStorefront(context,{})||{props:{}};}
