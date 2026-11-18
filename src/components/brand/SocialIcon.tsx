import {
  AtSign,
  Camera,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Send,
  Share2,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

const ICONS: Record<string, LucideIcon> = {
  facebook: Users,
  instagram: Camera,
  youtube: Video,
  telegram: Send,
  x: AtSign,
  twitter: AtSign,
  linkedin: Share2,
  whatsapp: MessageCircle,
  tiktok: Music2,
  snapchat: Camera,
  phone: Phone,
  tel: Phone,
  email: Mail,
  mail: Mail,
  maps: MapPin,
  location: MapPin,
  globe: Globe,
  link: Globe,
};

type SocialIconProps = {
  platform?: string | null;
  icon?: string | null;
  customIconUrl?: string | null;
  className?: string;
};

export function SocialIcon({
  platform = "globe",
  icon,
  customIconUrl,
  className = "size-4",
}: SocialIconProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const custom = (customIconUrl ?? "").trim();

  if (custom && !imgFailed) {
    return (
      <img
        src={custom}
        alt=""
        className={`${className} rounded-sm object-contain`}
        loading="lazy"
        onError={() => setImgFailed(true)}
      />
    );
  }

  const key = (icon || platform || "globe").toLowerCase();
  const Icon = ICONS[key] ?? Globe;
  return <Icon className={className} aria-hidden="true" />;
}
