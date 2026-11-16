import {
  AtSign,
  Camera,
  Globe,
  MessageCircle,
  Music2,
  Send,
  Share2,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

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
  globe: Globe,
  link: Globe,
};

type SocialIconProps = {
  platform?: string;
  icon?: string;
  customIconUrl?: string | null;
  className?: string;
};

export function SocialIcon({ platform = "globe", icon, customIconUrl, className = "size-4" }: SocialIconProps) {
  if (customIconUrl) {
    return <img src={customIconUrl} alt="" className={`${className} rounded-sm object-contain`} loading="lazy" />;
  }
  const key = (icon || platform || "globe").toLowerCase();
  const Icon = ICONS[key] ?? Globe;
  return <Icon className={className} aria-hidden="true" />;
}
