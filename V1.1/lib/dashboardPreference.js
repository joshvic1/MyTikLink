import {apiRequest} from './api';
import {dashboardDestination} from './authReturn';
export async function authenticationDestination(token,candidate){
 const preference=await apiRequest('/auth/dashboard-preference',{token});
 return dashboardDestination(preference,candidate);
}
export const adoptionEvent=event=>apiRequest('/auth/dashboard-events',{method:'POST',body:JSON.stringify({event})}).catch(()=>{});
