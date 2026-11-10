import PublicProductPage from "@/components/store/public/PublicProductPage";
import { CartProvider } from "@/components/store/context/CartContext";
export default function ProductPage() {
  return (
    <CartProvider>
      <PublicProductPage />
    </CartProvider>
  );
}

export async function getServerSideProps(context){const {resolveStorefront}=await import('@/V1.1/lib/storefrontRouting.mjs');return await resolveStorefront(context,{product:true})||{props:{}};}
