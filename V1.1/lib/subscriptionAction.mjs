export function subscriptionAction(user,payments=[],now=Date.now()) {
 const plan=String(user?.plan||'free').toLowerCase(),isFree=plan.startsWith('free');
 const previous=[...payments].filter(p=>String(p.status||'').toLowerCase()==='successful'&&/^(pro|standard)(_|$)/i.test(p.plan||'')).sort((a,b)=>new Date(b.paidAt||b.createdAt||0)-new Date(a.paidAt||a.createdAt||0))[0];
 const expired=Boolean(user?.planExpiry&&new Date(user.planExpiry).getTime()<=now);
 const renew=Boolean((expired&&(/^(pro|standard)(_|$)/.test(plan)||previous))||(isFree&&previous));
 return {show:Boolean(user)&&(isFree||renew),renew,previous};
}
