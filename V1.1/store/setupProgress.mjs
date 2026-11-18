export const OPTIONAL_SETUP_SNOOZE = 7 * 86400000;
export const deliveryAction = {kind:'delivery-setup',title:'Add delivery fees to your store',ctaLabel:'Add delivery',href:'/v1-1/store/settings?tab=delivery',image:'/v1-1/up-next/add-delivery-banner.webp',dismissalType:'attention',tone:'store'};
export function setupTasks(progress) {
 if(!progress)return [];
 return [
 progress.serviceBusiness?{id:'service',label:'Add your first service',done:progress.service,required:true,href:'/v1-1/store/services'}:{id:'product',label:'Add your first product',done:progress.product,required:true,href:'/v1-1/store/products'},
 ...(progress.physicalBusiness?[{id:'address',label:'Add store or office address',done:progress.address,required:true,href:'/v1-1/store/settings?tab=store%20information'}]:[]),
 ...(progress.serviceBusiness?[{id:'availability',label:'Set booking availability',done:progress.availability,required:false,href:'/v1-1/store/settings?tab=booking%20availability'}]:[]),
 {id:'categories',label:'Add categories',done:progress.categories,required:true,href:'/v1-1/store/settings?tab=categories'},
 ...(progress.physicalProducts?[{id:'delivery',label:'Add delivery fees',done:progress.delivery,required:true,href:deliveryAction.href}]:[]),
 {id:'currencies',label:'Add another currency',done:progress.currencies,required:false,href:'/v1-1/store/settings?tab=payments'}
 ];
}
export function shouldShowSetup(tasks,dismissedAt,now=Date.now()) {return tasks.some(t=>!t.done)&&(tasks.some(t=>t.required&&!t.done)||!dismissedAt||now-dismissedAt>=OPTIONAL_SETUP_SNOOZE);}
