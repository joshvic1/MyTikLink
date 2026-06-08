import PublicProductPage from "@/components/store/public/PublicProductPage";
import { CartProvider } from "@/components/store/context/CartContext";
export default function ProductPage() {
  return (
    <CartProvider>
      <PublicProductPage />
    </CartProvider>
  );
}
