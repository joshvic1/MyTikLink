import Head from "next/head";
import PublicStore from "../../../V1.1/store/PublicStore";
export default function Storefront({
  slug,
  initialData,
  initialProducts,
  initialCatalogue,
  initialProduct,
  initialRelated,
  categorySlug,
  shopPage,
  categoriesPage,
  productPage,
  error,
}) {
  if (error)
    return (
      <>
        <Head>
          <title>Storefront unavailable</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <main style={{ padding: 40, fontFamily: "system-ui" }}>
          <h1>Storefront unavailable</h1>
          <p>This store is not currently available. Please try again later.</p>
        </main>
      </>
    );
  return (
    <PublicStore
      slug={slug}
      initialData={initialData}
      initialProducts={initialProducts}
      initialCatalogue={initialCatalogue}
      initialProduct={initialProduct}
      initialRelated={initialRelated}
      categoriesPage={categoriesPage}
      shopPage={shopPage}
      categorySlug={categorySlug}
      productPage={productPage}
    />
  );
}
export async function getServerSideProps({ params, query, res, productPage=false, categoryPage=false, shopPage=false, categoriesPage=false }) {
  if(!productPage&&typeof query.product==="string")return {redirect:{destination:`/v1-1/s/${encodeURIComponent(params.slug)}/products/${encodeURIComponent(query.product)}`,permanent:true}};
  if(!categoryPage&&!productPage&&typeof query.category==="string"&&query.category)return {redirect:{destination:`/v1-1/s/${encodeURIComponent(params.slug)}/categories/${encodeURIComponent(query.category)}`,permanent:true}};
  const slug = params.slug,
    base = (
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_V11_API_URL
        ? process.env.NEXT_PUBLIC_V11_API_URL
        : process.env.NEXT_PUBLIC_API_URL
    )?.replace(/\/$/, "");
  const root = `${base}/v1-1/store-studio/commerce/public/${encodeURIComponent(slug)}`;
  const get = async (path) => {
    const r = await fetch(root + path, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw Object.assign(Error("Unavailable"), { status: r.status });
    return r.json();
  };
  try {
    const search = new URLSearchParams();
    for (const key of ["category", "collection", "search", "sort", "page"])
      if (typeof query[key] === "string")
        search.set(key, query[key].slice(0, 100));
    search.set("pageSize",shopPage||categoryPage?"24":"10");
    const [data, catalogue, detail] = await Promise.all([
      get("/config"),
      productPage?Promise.resolve({products:[],page:1,hasMore:false}):get("/products?" + search),
      typeof query.product === "string"
        ? get("/products/" + encodeURIComponent(query.product))
        : Promise.resolve(null),
    ]);
    if(categoryPage&&!data.store.productCategories.some(c=>c.visible&&c.slug===query.category))return {notFound:true};
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=30",
    );
    return {
      props: {
        slug,
        initialData: data,
        initialProducts: catalogue.products,
        initialCatalogue: {
          filters: {pageSize:shopPage||categoryPage?24:10,page:catalogue.page,category:String(query.category||""),collection:String(query.collection||""),search:String(query.search||""),sort:String(query.sort||"featured")},
          page: catalogue.page,
          totalPages:catalogue.totalPages||1,
          hasMore: catalogue.hasMore,
          loading: false,
        },
        initialProduct: detail?.product || null,
        initialRelated: detail?.related || [],
        productPage,
        shopPage,
        categoriesPage,
  categoriesPage,
        categorySlug:categoryPage?query.category:"",
      },
    };
  } catch (e) {
    res.statusCode = e.status === 404 ? 404 : 503;
    res.setHeader("Cache-Control", "no-store");
    return { props: { slug, error: true } };
  }
}
