import TykAvatar from '../../components/MyTikLinkAI/TykAvatar';
import {MessagesSquare,Mail,Send} from "lucide-react";
import {FaWhatsapp} from "react-icons/fa";
export const helpChannels = [
  {
    title: "Ask MyTikLink AI",
    detail: "Get instant help with MyTikLink.",
    Icon: TykAvatar,
    tone: "ai",
    badge: "Responds immediately",
    action: "ai",
  },
  {
    title: "WhatsApp",
    detail: "Message our support team.",
    Icon: FaWhatsapp,
    tone: "whatsapp",
    badge: "Responds in a few hours",
    href: "https://wa.me/2347062859465",
  },
  {
    title: "Live Chat",
    detail: "Chat directly with our support team.",
    Icon: MessagesSquare,
    tone: "live",
    badge: "Coming soon",
    soon: true,
  },
  {
    title: "Email Support",
    detail: "For detailed questions and enquiries.",
    Icon: Mail,
    tone: "email",
    badge: "Usually within 24 hrs",
    href: "mailto:support@mytiklink.com",
  },
  {
    title: "Telegram",
    detail: "Connect with our community.",
    Icon: Send,
    tone: "telegram",
    badge: "Join our community",
    href: "https://t.me/mytiklink",
  },
];
