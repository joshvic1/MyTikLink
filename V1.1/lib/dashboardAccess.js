import {canUseLandingPages} from './pageAccess.js';
export function dashboardSuggestions(user,starter,paidSuggestions){
 if(canUseLandingPages(user))return paidSuggestions;
 return [{kind:'starter-upgrade',title:starter?'Your landing page is ready':'Ready for your next step?',description:starter?'Upgrade to Pro or above to go live and start getting leads.':'Upgrade to Pro or above to publish pages and connect your pixels.',action:'Upgrade to Pro',href:'/v1-1/pages'}];
}
