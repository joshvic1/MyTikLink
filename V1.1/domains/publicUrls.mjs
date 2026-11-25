// The host argument comes only from the server's verified domain rewrite header.
export function domainOrigin(host){
 return typeof host==='string'&&host.length<=253&&/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9-]+$/i.test(host)?'https://'+host.toLowerCase():null;
}
export function storefrontUrl(host,slug,path=''){
 const origin=domainOrigin(host);
 return (origin||'https://mytiklink.com/v1-1/s/'+encodeURIComponent(slug))+(path|| (origin?'/':''));
}
export function sitemapUrl(url,host,slug){
 if(!domainOrigin(host))return url;
 const prefix='https://mytiklink.com/v1-1/s/'+encodeURIComponent(slug);
 if(url!==prefix&&!url.startsWith(prefix+'/'))return null;
 return storefrontUrl(host,slug,url.slice(prefix.length));
}
