export function bookingErrors(form,service,validPhone,paymentMethods){
 const errors={};
 if(service.serviceMode==='appointment'){if(!form.date)errors.date='Choose an appointment date.';if(!form.appointmentStart)errors.appointmentStart='Choose an available appointment time.';}
 if(!form.customerName.trim())errors.customerName='Enter your full name.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim()))errors.customerEmail='Enter a valid email address.';
 if(!validPhone)errors.customerPhone='Enter a complete, valid WhatsApp number for the selected country.';
 if(service.serviceType==='physical'&&form.locationMode==='customer'&&!form.serviceAddress.trim())errors.serviceAddress='Enter the address for your service.';
 for(const field of service.customerFields||[])if(field.required&&!String(form.customerAnswers?.[field.id]||'').trim())errors['answer:'+field.id]='Enter '+field.label.toLowerCase()+'.';
 if(service.customerInstructionsRequired&&!form.customerNotes.trim())errors.customerNotes='Please provide the requested details.';
 if(!paymentMethods.includes(form.paymentMethod))errors.paymentMethod='Choose an available payment method.';
 return errors;
}
