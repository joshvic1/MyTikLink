import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "../components/UI";
import { v11Api } from "../lib/api";
import styles from "../styles/v11.module.css";

const CustomPageRenderer = dynamic(() => import("@/components/custom/renderer/CustomPageRenderer"), { ssr: false });
const money = (value) => `₦${Number(value || 0).toLocaleString()}`;
const imageOf = (item) => item?.images?.[0]?.url || item?.images?.[0] || item?.image?.url || item?.image || item?.thumbnail || "";

function PreviewBar({ label, liveHref }) {
  return <div className={styles.previewBar}><Link href="/v1-1/home">← Dashboard</Link><span><b>V1.1 preview</b> · {label}</span>{liveHref ? <a href={liveHref} target="_blank" rel="noreferrer">Open live version ↗</a> : <span/>}</div>;
}

function usePublicData(loader, keys) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  useEffect(() => { let live = true; setState({ loading: true, data: null, error: null }); loader().then(data => live && setState({ loading: false, data, error: null })).catch(error => live && setState({ loading: false, data: null, error })); return () => { live = false; }; }, keys);
  return state;
}

export function PublicLandingPreview({ slug }) {
  const state = usePublicData(() => v11Api.publicPage(slug), [slug]);
  if (state.loading) return <LoadingState label="Loading published page…"/>;
  if (state.error) return <div className={styles.previewState}><ErrorState message={state.error.message}/></div>;
  const page = state.data;
  if (page?.builderType === "custom") return <div className={styles.publicPreview}><Head><title>{page.title || "Page preview"}</title></Head><PreviewBar label={page.title || slug} liveHref={`/p/${slug}`}/><div className={styles.previewCanvas}><CustomPageRenderer sections={page.customContent || []} page={{ ...page, preview: true }}/></div></div>;
  const html = (page?.template?.html || "").replace(/{{(.*?)}}/g, (_, key) => { const value = page?.config?.[key.trim()]; return typeof value === "object" ? value?.url || "" : value || ""; }).replace(/<script[\s\S]*?<\/script>/gi, "");
  return <div className={styles.publicPreview}><Head><title>{page?.title || "Page preview"}</title></Head><PreviewBar label={page?.title || slug} liveHref={`/p/${slug}`}/>{html ? <iframe className={styles.previewFrame} title="Landing page preview" sandbox="allow-same-origin" srcDoc={html}/> : <div className={styles.previewState}>This published page has no renderable template.</div>}</div>;
}

export function PublicStorePreview({ slug }) {
  const state = usePublicData(async () => { const store = await v11Api.publicStore(slug); const products = await v11Api.publicProducts(store?.slug || slug); return { store, products: Array.isArray(products) ? products : products?.products || [] }; }, [slug]);
  if (state.loading) return <LoadingState label="Loading storefront…"/>;
  if (state.error) return <div className={styles.previewState}><ErrorState message={state.error.message}/></div>;
  const { store, products } = state.data;
  if (store?.storefrontPage?.customContent?.length) return <div className={styles.publicPreview}><PreviewBar label={store.name || slug} liveHref={`/s/${slug}`}/><div className={styles.previewCanvas}><CustomPageRenderer sections={store.storefrontPage.customContent} page={{ ...store.storefrontPage, products, builder: false, preview: true }}/></div></div>;
  return <div className={styles.publicPreview}><PreviewBar label={store?.name || slug} liveHref={`/s/${slug}`}/><main className={styles.storefront}><header><span>{store?.logo ? <img src={store.logo?.url || store.logo} alt=""/> : "M"}</span><div><small>MYTIKLINK STORE</small><h1>{store?.name || slug}</h1><p>{store?.description || "Browse this creator’s products."}</p></div></header><div className={styles.productGrid}>{products.map(product => <Link key={product._id || product.slug} href={`/v1-1/s/${slug}/${product.slug || product._id}`}><div>{imageOf(product) ? <img src={imageOf(product)} alt=""/> : <span>◇</span>}</div><h2>{product.name}</h2><p>{money(product.price)}</p></Link>)}</div>{!products.length && <p className={styles.previewEmpty}>No published products yet.</p>}</main></div>;
}

export function PublicProductPreview({ slug, product }) {
  const state = usePublicData(() => v11Api.publicProduct(slug, product), [slug, product]);
  const data = state.data?.product || state.data;
  const images = useMemo(() => data ? (data.images || []).map(x => x?.url || x).filter(Boolean) : [], [data]);
  if (state.loading) return <LoadingState label="Loading product…"/>;
  if (state.error) return <div className={styles.previewState}><ErrorState message={state.error.message}/></div>;
  return <div className={styles.publicPreview}><PreviewBar label={data?.name || product} liveHref={`/s/${slug}/${product}`}/><main className={styles.productDetail}><div className={styles.productGallery}>{(images.length ? images : [imageOf(data)]).filter(Boolean).map((src, index) => <img key={src + index} src={src} alt=""/>)}{!images.length && !imageOf(data) && <span>◇</span>}</div><section><small>PRODUCT PREVIEW</small><h1>{data?.name}</h1><h2>{money(data?.price)}</h2><p>{data?.description || "No description provided."}</p><a className={styles.livePurchase} href={`/s/${slug}/${product}`} target="_blank" rel="noreferrer">Continue to live store to buy ↗</a><em>Checkout stays on the production storefront so payment behavior is unchanged.</em></section></main></div>;
}

export function RedirectPreview({ linkId }) {
  return <div className={styles.publicPreview}><PreviewBar label="Smart-link safety preview"/><main className={styles.redirectPreview}><span>↗</span><h1>Redirect preview</h1><p>This V1.1 route intentionally does not count a click or redirect automatically.</p><a href={`/r/${linkId}`} target="_blank" rel="noreferrer">Test the live smart link ↗</a></main></div>;
}
