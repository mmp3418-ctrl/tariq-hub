import {
  AtSign,
  Camera,
  Clapperboard,
  Globe,
  Link2,
  MessageCircle,
  Send,
  Share2,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  facebook: Share2,
  instagram: Camera,
  youtube: Clapperboard,
  telegram: Send,
  x: AtSign,
  twitter: AtSign,
  linkedin: Link2,
  whatsapp: MessageCircle,
  tiktok: Clapperboard,
  link: Globe,
};

export function SocialIcon({ platform, className = "size-4" }: { platform: string; className?: string }) {
  const Icon = ICONS[platform.toLowerCase()] ?? Globe;
  return <Icon className={className} aria-hidden="true" />;
}
