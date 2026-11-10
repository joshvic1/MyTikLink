import {LayoutDashboard,Users,CreditCard,PanelsTopLeft,Link2,Store,Package,ShoppingBag,Contact,Mail,Workflow,Inbox,ShieldCheck,Activity,Layers,Server,FileClock,Image,BarChart3,Settings,BookOpen,Tag} from 'lucide-react';

export const groups=[

 {name:'Overview',items:[['overview','Overview',LayoutDashboard,'overview.view'],['analytics','Platform analytics',BarChart3,'overview.view'],['activity','Platform activity',Activity,'overview.view'],['audit','Admin audit log',FileClock,'audit.view']]},

 {name:'Accounts',items:[['users','All users',Users,'users.view'],['adoption','V1.1 adoption',BarChart3,'users.view']]},

 {name:'Billing',items:[['subscriptions','Subscriptions',CreditCard,'billing.view'],['transactions','Transactions',FileClock,'billing.view'],['recovery','Payment recovery',Workflow,'billing.view'],['recovery-emails','Recovery email history',Mail,'billing.view'],['plans','Plans & entitlements',Layers,'billing.view'],['revenue','Revenue',BarChart3,'overview.view']]},

 {name:'Products',items:[['pages','Landing pages',PanelsTopLeft,'pages.view'],['links','Redirect links',Link2,'links.view'],['stores','Storefronts',Store,'stores.view'],['products','Products',Package,'products.view'],['collections','Collections',Layers,'products.view'],['discounts','Discounts',Tag,'stores.view'],['orders','Orders',ShoppingBag,'orders.view'],['leads','Page leads',Contact,'leads.view'],['store-leads','Store subscribers',Contact,'leads.view'],['templates','Template library',Layers,'templates.view']]},

 {name:'Communication',items:[['campaigns','Email campaigns',Mail,'marketing.view'],['automations','Lifecycle automations',Workflow,'marketing.view'],['enrollments','Journey enrollments',Workflow,'marketing.view'],['deliveries','Email deliveries',Mail,'marketing.view'],['email-templates','Email templates',BookOpen,'marketing.view'],['suppressions','Suppressions',ShieldCheck,'marketing.view'],['preferences','Email preferences',Settings,'marketing.view'],['inbox','MyTikLink Inbox',Inbox,'support.view']]},

 {name:'Operations',items:[['tracking','Pixels & integrations',Activity,'system.view'],['assets','R2 asset records',Image,'system.view'],['jobs','Background jobs',Workflow,'system.view'],['health','System health',Server,'system.view']]},

 {name:'Administration',items:[['staff','Admin staff',Users,'super'],['roles','Roles & permissions',ShieldCheck,'super'],['settings','Platform settings',Settings,'super']]},

];

groups.find(g=>g.name==='Products').items.push(['themes','Storefront themes',Layers,'templates.view']);

export const entries=groups.flatMap(g=>g.items);

export const descriptions={overview:'A clear view of the business. A focused place to take action.',users:'Understand each account, its subscription and its journey.',subscriptions:'Review current entitlements, billing cycles and upcoming expirations.',transactions:'Subscription payments recorded by the existing Paystack integration.',pages:'Inspect and moderate landing pages across the platform.',links:'Review destinations, click usage and redirect availability.',stores:'Explore customer storefronts without exposing private banking details.',orders:'Merchant commerce activity. These sales are separate from platform revenue.',staff:'Give the right people exactly the access they need.',audit:'Recorded administrative actions, with actors, reasons and changes.',health:'Observed application state and configured service connections.',revenue:'Subscription revenue, separated from merchant sales.',assets:'Recorded storefront uploads. This is not a complete R2 bucket inventory.',jobs:'Inspect the existing commerce queue without starting another worker.'};

export const columns={

 recovery:[['ownerLabel.email','Account'],['plan','Intended plan'],['providerStatus','Provider state'],['status','Recovery state'],['sent','Sent steps (0–4)'],['nextAt','Next email'],['convertedAt','Upgraded after enrollment'],['lastError','Last issue']],

 'recovery-emails':[['recipient','Recipient'],['subject','Subject'],['step','Step (0–4)'],['dueAt','Scheduled'],['sentAt','Accepted by provider'],['status','Status'],['attempts','Attempts'],['error','Last error']],

 activity:[['event','Recorded event'],['_id','Record ID'],['createdAt','Recorded at']],

 users:[['name','Account'],['email','Email'],['plan','Plan'],['onboarding.accountType','Type'],['onboarding.category.label','Category'],['suspendedAt','Suspended since'],['createdAt','Joined']],

 subscriptions:[['name','Subscriber'],['email','Email'],['plan','Plan / cycle'],['planExpiry','Expires'],['upgradedAt','Upgraded']],

 transactions:[['ownerLabel.email','Account'],['plan','Plan'],['amount','Amount (NGN)'],['status','Status'],['paystackReference','Reference'],['createdAt','Created']],

 pages:[['title','Page'],['ownerLabel.email','Owner'],['isActive','Owner enabled'],['adminDisabled','Restricted'],['slug','Slug'],['viewsCount','Views'],['leadsCount','Leads']],

 links:[['title','Link'],['ownerLabel.email','Owner'],['linkId','Slug'],['redirectCount','Clicks'],['maxRedirects','Click limit'],['v11Disabled','Disabled']],

 stores:[['name','Store'],['ownerLabel.email','Owner'],['businessType','Type'],['theme','Theme'],['isPublished','Legacy published'],['paymentMethod','Payment method']],

 products:[['name','Product'],['productType','Type'],['price','Price'],['status','Status'],['category','Category']],

 orders:[['orderNumber','Order'],['store','Store ID'],['status','Status'],['paymentStatus','Payment'],['createdAt','Created']],

 leads:[['name','Lead'],['pageId','Page ID'],['createdAt','Collected']],

 templates:[['name','Template'],['category','Category'],['enabled','Available']],

 campaigns:[['subject','Campaign'],['segmentKey','Audience'],['status','Status'],['recipientsCount','Recipients'],['createdAt','Created']],

 deliveries:[['journey','Journey'],['messageId','Message'],['status','Status'],['dueAt','Scheduled'],['sentAt','Sent'],['attempts','Attempts']],

 enrollments:[['journey','Journey'],['status','Status'],['reason','Reason'],['startedAt','Entered']],

 'email-templates':[['name','Template'],['key','Key'],['subject','Subject'],['editable','Editable']],

 suppressions:[['email','Email'],['reason','Reason'],['createdAt','Suppressed']],

 preferences:[['_id','Account ID'],['marketing','Marketing consent'],['suppressed','Suppressed'],['unsubscribedAt','Unsubscribed']],

 collections:[['name','Collection'],['slug','Slug'],['visible','Visible'],['archived','Archived']],

 discounts:[['code','Discount'],['type','Type'],['value','Value'],['enabled','Enabled'],['uses','Uses']],

 'store-leads':[['name','Subscriber'],['store','Store ID'],['consentedAt','Consented'],['unsubscribedAt','Unsubscribed']],

 assets:[['_id','Asset ID'],['type','Type'],['size','Bytes'],['status','Status'],['createdAt','Created']],

 jobs:[['kind','Job'],['status','Status'],['attempts','Attempts'],['availableAt','Available'],['sentAt','Sent']],

 tracking:[['provider','Provider'],['status','Status'],['attempts','Attempts'],['availableAt','Next attempt']],

 audit:[['action','Action'],['actor','Actor ID'],['target','Target'],['reason','Reason'],['createdAt','Recorded']],

};

export const statuses={recovery:['active','awaiting_payment','converted','complete','cancelled','suppressed','review'],'recovery-emails':['sent','retry','sending','review'],users:['suspended'],subscriptions:['active','expired'],transactions:['processing','successful','failed'],pages:['true','false'],links:['true','false'],stores:['true','false'],products:['draft','published','archived'],orders:['pending','paid','shipped','delivered','cancelled'],templates:['true','false'],campaigns:['pending','sent','failed'],deliveries:['pending','sending','sent','failed','skipped'],enrollments:['active','completed','exited'],tracking:['pending','processing','sent','failed','cancelled'],jobs:['pending','processing','sent','failed'],assets:['pending','processing','ready','failed']};

export const href=key=>key==='overview'?'/admin':`/admin/control/${key}`;

export const allowed=(actor,p)=>actor?.superAdmin||actor?.permissions?.includes(p);
