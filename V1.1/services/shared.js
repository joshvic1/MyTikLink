import {apiRequest} from '../lib/api';
export const servicesEnabled=(process.env.NEXT_PUBLIC_SERVICES_ENABLED ?? 'true') === 'true';
export const serviceApi=(path='',options={})=>apiRequest('/v1-1/store-studio/commerce/services'+path,options);
export const money=(minor,currency='NGN')=>new Intl.NumberFormat('en',{style:'currency',currency}).format(Number(minor||0)/100);
export const paymentLabels={bank:'Bank transfer',whatsapp:'Pay on WhatsApp',cod:'Pay after service'};
export const statusLabel=value=>String(value||'').replaceAll('_',' ');
