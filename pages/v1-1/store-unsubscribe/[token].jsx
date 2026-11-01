import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { apiRequest } from "../../../V1.1/lib/api";
export default function Unsubscribe() {
  const router = useRouter(),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <Head>
        <title>Unsubscribe</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main
        style={{
          maxWidth: 440,
          margin: "80px auto",
          padding: 24,
          fontFamily: "system-ui",
        }}
      >
        <h1>Email preferences</h1>
        <p>
          Stop receiving marketing updates from this store. Order updates are
          separate.
        </p>
        <button
          disabled={
            busy || !router.isReady || message === "You have been unsubscribed."
          }
          onClick={async () => {
            setBusy(true);
            try {
              await apiRequest(
                `/v1-1/store-studio/commerce/unsubscribe/${encodeURIComponent(String(router.query.token || ""))}`,
                { token: null, method: "POST" },
              );
              setMessage("You have been unsubscribed.");
            } catch (e) {
              setMessage(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Updating…" : "Unsubscribe"}
        </button>
        <p role="status">{message}</p>
      </main>
    </>
  );
}
