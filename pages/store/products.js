"use client";

import useRequireAuth from "@/hooks/useRequireAuth";
import ProductsPage from "@/components/store/products/ProductsPage";

export default function Page() {
  const { checkingAuth } = useRequireAuth();

  if (checkingAuth) {
    return null;
  }

  return <ProductsPage />;
}
