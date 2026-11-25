import test from 'node:test';
import assert from 'node:assert/strict';
import {domainOrigin,storefrontUrl,sitemapUrl} from '../V1.1/domains/publicUrls.mjs';
test('platform URLs are preserved without a verified domain',()=>assert.equal(storefrontUrl(null,'my-store','/products/shoe'),'https://mytiklink.com/v1-1/s/my-store/products/shoe'));
test('custom-host metadata uses the connected hostname',()=>{assert.equal(storefrontUrl('joshspot.store','my-store'),'https://joshspot.store/');assert.equal(storefrontUrl('joshspot.store','my-store','/products/shoe'),'https://joshspot.store/products/shoe')});
test('unsafe hosts cannot become canonical origins',()=>{for(const host of ['evil.com/path','evil.com:443','evil.com@other.com','<script>','localhost'])assert.equal(domainOrigin(host),null)});
test('sitemap conversion never includes another stores URLs',()=>{assert.equal(sitemapUrl('https://mytiklink.com/v1-1/s/mine/products/shoe','joshspot.store','mine'),'https://joshspot.store/products/shoe');assert.equal(sitemapUrl('https://mytiklink.com/v1-1/s/other/products/shoe','joshspot.store','mine'),null)});
