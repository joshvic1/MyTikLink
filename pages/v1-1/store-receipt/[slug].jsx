import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { apiRequest } from "../../../V1.1/lib/api";
export default function Receipt() {
  const router = useRouter(),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const load = async () => {
    if (!router.isReady || busy) return;
    setBusy(true);
    try {
      const d = await apiRequest(
        `/v1-1/store-studio/commerce/public/${encodeURIComponent(router.query.slug)}/receipt/${encodeURIComponent(router.query.token || "")}`,
        { token: null },
      );
      setData(d);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
  }, [router.isReady]);
  return (
    <>
      <Head>
        <title>Order status</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Head>
      <main
        style={{
          maxWidth: 580,
          margin: "50px auto",
          padding: 24,
          fontFamily: "system-ui",
        }}
      >
        <h1>{data?.storeName || "Your order"}</h1>
        {data && (
          <>
            <h2>{data.orderNumber}</h2>
            <p>
              Payment: <strong>{data.paymentStatus}</strong> · Fulfilment:{" "}
              {data.fulfillmentStatus.replaceAll("_", " ")}
            </p>
            {data.orderStatus === "cancelled" && (
              <p>This order is cancelled.</p>
            )}
            {data.items.map((i, n) => (
              <p key={n}>
                {i.quantity} × {i.name}
              </p>
            ))}
            <h3>
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: data.totals.currency,
              }).format(data.totals.totalMinor / 100)}
            </h3>
            {data.paymentStatus === "pending" && (
              <p>
                Payment has not been confirmed. Contact the store after
                completing your payment.
              </p>
            )}
            {data.downloads.map((item, i) => (
              <p key={i}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open {item.name}
                </a>
              </p>
            ))}
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <button disabled={busy || !router.isReady} onClick={load}>
          {busy ? "Checking…" : "Refresh status"}
        </button>
        <p>Keep this private order link safe.</p>
      </main>
    </>
  );
}
