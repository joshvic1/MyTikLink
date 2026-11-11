export function shouldPromptNotifications({supported,permission,saved,subscription,dismissed,settings=false,demo=false}){
 return Boolean(supported&&!demo&&!settings&&!dismissed&&!saved&&!subscription&&permission==='default');
}
