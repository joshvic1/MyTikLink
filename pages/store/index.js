import { useRouter } from "next/router";

import { useEffect } from "react";
import Storefront from "@/components/store/Storefront";

import { CartProvider } from "@/components/store/context/CartContext";

export default function StorePage() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/?auth=login");
    }
  }, []);
  return (
    <CartProvider>
      <Storefront />
    </CartProvider>
  );
}
