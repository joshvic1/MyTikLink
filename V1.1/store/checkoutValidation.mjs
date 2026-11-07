export function checkoutErrors({form,physical,requireEmail,validPhone,activePickup,showRegionSelector,deliveryLocationReady,countryProfile}) {
  const fieldErrors = {};
  if(!form.customerName.trim())fieldErrors.customerName='Enter your full name.';
  if(!validPhone)fieldErrors.customerPhone='Enter a valid WhatsApp number with its country code.';
  if((requireEmail||!physical)&&!form.customerEmail.trim())fieldErrors.customerEmail='Enter your email address.';
  else if(form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim()))fieldErrors.customerEmail='Enter a valid email address.';
  if(physical&&form.fulfillmentMethod==='pickup'&&!activePickup)fieldErrors.pickupId='Choose a pickup location.';
  if(physical&&form.fulfillmentMethod==='delivery'){
    if(!form.address.countryCode)fieldErrors.countryCode='Choose your country.';
    if(showRegionSelector&&!deliveryLocationReady)fieldErrors.regionId='Choose your state or region.';
    if(!(form.address.streetAddress||form.address.line||'').trim())fieldErrors.streetAddress='Enter your street address.';
    if(!countryProfile&&!(form.address.city||'').trim())fieldErrors.city='Enter your city or area.';
  }
  return fieldErrors;
}
