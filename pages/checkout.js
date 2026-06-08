import CheckoutPage from "@/components/store/public/CheckoutPage";

import { CartProvider } from "@/components/store/context/CartContext";

export default function Page() {
  return (
    <CartProvider>
      <CheckoutPage />
    </CartProvider>
  );
}
