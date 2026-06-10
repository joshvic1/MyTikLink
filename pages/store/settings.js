"use client";

import useRequireAuth from "@/hooks/useRequireAuth";
import StoreSettingsPage from "@/components/store/settings/StoreSettingsPage";

export default function Settings() {
  const { checkingAuth } = useRequireAuth();

  if (checkingAuth) {
    return null;
  }

  return <StoreSettingsPage />;
}
