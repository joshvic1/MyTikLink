export function firstName(user){return typeof user?.name==='string'?user.name.trim().split(/\s+/)[0].slice(0,32):'';}
export function conversationDate(chat,now=new Date()){
 const value=chat.updatedAt||chat.createdAt;if(!value)return 'Earlier conversation';
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return 'Earlier conversation';
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 const day=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 const diff=Math.round((today-day)/86400000);
 return diff===0?'Today':diff===1?'Yesterday':date.toLocaleDateString(undefined,{month:'short',day:'numeric',...(date.getFullYear()!==now.getFullYear()?{year:'numeric'}:{})});
}
export function pageLabel(route=''){
 const path=route.split('?')[0].split('#')[0];
 const labels=[['/v1-1/settings/tracking','Pixels & integrations'],['/dashboard/tiktok-pixel','Pixels & integrations'],['/v1-1/settings/billing','Plans & billing'],['/v1-1/settings','Account settings'],['/dashboard/settings','Account settings'],['/v1-1/store','Storefront'],['/store','Storefront'],['/v1-1/pages','Landing pages'],['/dashboard/page','Landing pages'],['/v1-1/links','Redirect links'],['/dashboard/links','Redirect links'],['/v1-1/insights','Analytics & insights'],['/dashboard/analytics','Analytics & insights'],['/v1-1/dashboard','Dashboard'],['/dashboard','Dashboard']];
 return labels.find(([prefix])=>path===prefix||path.startsWith(prefix+'/'))?.[1]||null;
}

export function selectedConversation(chats,savedId){return chats.some(c=>c.id===savedId)?savedId:chats[0]?.id||'';}
