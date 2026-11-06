// Rates are decimal strings: NGN per one unit of display currency.
export const supportedCurrencies = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : ['NGN','USD','EUR','GBP','GHS','KES','ZAR','JPY','CAD','AUD','CHF','CNY','INR','AED'];
export const currencyDigits = code => new Intl.NumberFormat('en',{style:'currency',currency:code}).resolvedOptions().maximumFractionDigits;
export function decimalRate(value){
 const raw=String(value??'').trim();
 if(!/^\d{1,12}(?:\.\d{1,6})?$/.test(raw))throw Error('Enter a positive rate with up to 6 decimal places.');
 const [whole,fraction='']=raw.split('.'),scale=10n**BigInt(fraction.length),units=BigInt(whole)*scale+BigInt(fraction||'0');
 if(units<=0n)throw Error('The conversion rate must be greater than zero.');
 return {units,scale,text:BigInt(whole).toString()+(fraction.replace(/0+$/,'')?'.'+fraction.replace(/0+$/,''):'')};
}
export function validateDisplayCurrencies(rows=[]){
 if(!Array.isArray(rows)||rows.length>30)throw Error('Choose up to 30 display currencies.');
 const seen=new Set(['NGN']);
 return rows.map(row=>{const code=String(row?.code||'').toUpperCase();if(!supportedCurrencies.includes(code))throw Error('Choose a supported ISO currency.');if(seen.has(code))throw Error('Each currency can only be added once. NGN is already the base currency.');seen.add(code);return {code,nairaPerUnit:decimalRate(row.nairaPerUnit).text};});
}
export function convertMinor(baseMinor,code='NGN',rate='1'){
 if(!Number.isSafeInteger(baseMinor))throw Error('Invalid base amount.');
 if(code==='NGN')return baseMinor;
 const {units,scale}=decimalRate(rate),digits=currencyDigits(code),sign=baseMinor<0?-1n:1n;
 const numerator=BigInt(Math.abs(baseMinor))*scale*10n**BigInt(digits),denominator=100n*units;
 const rounded=(numerator+denominator/2n)/denominator*sign;
 if(rounded>BigInt(Number.MAX_SAFE_INTEGER)||rounded<BigInt(Number.MIN_SAFE_INTEGER))throw Error('The converted amount is too large.');
 return Number(rounded);
}
export function displaySnapshot(checkout,requested,totals){
 const base=checkout.currency||'NGN';
 const row=base==='NGN'?(checkout.displayCurrencies||[]).find(c=>c.code===requested):null;
 const currency=row?.code||base,rate=row?.nairaPerUnit||'1';
 return {currency,nairaPerUnit:base==='NGN'?rate:null,baseCurrency:base,baseAmountMinor:totals.totalMinor,payableCurrency:totals.currency,payableAmountMinor:totals.totalMinor,amountMinor:row?convertMinor(totals.totalMinor,currency,rate):totals.totalMinor};
}
