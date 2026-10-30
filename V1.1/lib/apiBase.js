export function v11ApiBase() {
 return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_V11_API_URL
  ? process.env.NEXT_PUBLIC_V11_API_URL.replace(/\/$/,'')
  : process.env.NEXT_PUBLIC_API_URL;
}
