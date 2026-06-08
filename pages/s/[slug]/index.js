import PublicStorefront from "@/components/store/public/PublicStorefront";

import { CartProvider } from "@/components/store/context/CartContext";
export default function StorePage() {
  return (
    <CartProvider>
      <PublicStorefront />
    </CartProvider>
  );
}
