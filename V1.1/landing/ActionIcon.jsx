import { ShoppingBag, CalendarDays, Utensils, Globe, Mail, Link, MapPin, Download, Play, BriefcaseBusiness } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaTiktok, FaFacebook, FaXTwitter, FaYoutube, FaTelegram } from "react-icons/fa6";

// Shared by template designs. Prefer explicit icon IDs; infer older saved actions safely.
const icons = {shop:ShoppingBag,booking:CalendarDays,menu:Utensils,website:Globe,email:Mail,link:Link,directions:MapPin,download:Download,content:Play,portfolio:BriefcaseBusiness,instagram:FaInstagram,whatsapp:FaWhatsapp,tiktok:FaTiktok,facebook:FaFacebook,x:FaXTwitter,youtube:FaYoutube,telegram:FaTelegram};
export function actionIconId(action) {
 if (icons[action.icon]) return action.icon;
 if (action.kind === "whatsapp") return "whatsapp";
 if (icons[action.platform]) return action.platform;
 const label=action.label || "";
 for (const [pattern,id] of [[/shop|collection|product|store|arrival/i,"shop"],[/book|appointment|consult|register|event/i,"booking"],[/menu|order|food/i,"menu"],[/portfolio|work/i,"portfolio"],[/watch|video|content/i,"content"],[/direction|location/i,"directions"],[/download|catalogue/i,"download"]]) if(pattern.test(label))return id;
 return "link";
}
export default function ActionIcon({action,size=19}) { const id=actionIconId(action),Icon=icons[id];return <Icon size={size} aria-hidden="true" focusable="false" data-action-icon={id}/>; }
