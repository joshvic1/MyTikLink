import {canUseLandingPages} from './pageAccess.js';
export function dashboardSuggestions(user,starter,paidSuggestions,store,links=[]){
 if(canUseLandingPages(user))return paidSuggestions;
 if(user?.onboarding?.intent==='redirect_link' && links.length)return [{kind:'redirect-upgrade',title:'Your redirect link is ready',description:'Your free plan includes 250 clicks. Upgrade to Pro to keep your links running without interruption.',action:'Upgrade to Pro',href:'/v1-1/links'}];
 if(store && (user?.onboarding?.intent==='storefront' || user?.onboarding?.firstResource?.type==='storefront'))return [{kind:'store-upgrade',title:'Your online store is ready',description:'Upgrade to Pro to publish your store, add a product and start getting orders.',action:'Upgrade to Pro',href:'/v1-1/store'}];
 return [{kind:'starter-upgrade',title:starter?'Your landing page is ready':'Ready for your next step?',description:starter?'Upgrade to Pro or above to go live and start getting leads.':'Upgrade to Pro or above to publish pages and connect your pixels.',action:'Upgrade to Pro',href:'/v1-1/pages'}];
}
