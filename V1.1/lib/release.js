// Deployment is approved; launching V1.1 is not. Keep production locked.
export const V11_RELEASE_READY = false;
export function isV11Enabled() {
 return process.env.NODE_ENV !== "production" || (V11_RELEASE_READY && process.env.NEXT_PUBLIC_ENABLE_V11 === "true");
}
