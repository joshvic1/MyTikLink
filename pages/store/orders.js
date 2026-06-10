"use client";

import useRequireAuth from "@/hooks/useRequireAuth";
import StoreOrdersPage from "@/components/store/dashboard/StoreOrdersPage";

export default function OrdersPage() {
  const { checkingAuth } = useRequireAuth();

  if (checkingAuth) {
    return null;
  }

  return <StoreOrdersPage />;
}
