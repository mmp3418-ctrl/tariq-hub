import {
  Award,
  BookOpen,
  Bookmark,
  Clapperboard,
  FileText,
  Film,
  GraduationCap,
  Library,
  Link2,
  MonitorPlay,
  NotebookPen,
  PlayCircle,
  Radio,
  ScrollText,
  Tv,
  Video,
  type LucideIcon,
} from "lucide-react";

const NAMED_COLORS: Record<string, string> = {
  teal: "#0f766e",
  emerald: "#059669",
  blue: "#2563eb",
  amber: "#d97706",
  rose: "#e11d48",
  violet: "#7c3aed",
  slate: "#475569",
  cyan: "#0891b2",
  pink: "#db2777",
  yellow: "#ca8a04",
};

const ICONS: Record<string, LucideIcon> = {
  "file-text": FileText,
  "book-open": BookOpen,
  "graduation-cap": GraduationCap,
  bookmark: Bookmark,
  award: Award,
  notebook: NotebookPen,
  library: Library,
  "scroll-text": ScrollText,
  "play-circle": PlayCircle,
  youtube: Video,
  video: Video,
  "monitor-play": MonitorPlay,
  tv: Tv,
  clapperboard: Clapperboard,
  film: Film,
  radio: Radio,
  link: Link2,
};

export function resolveCardColor(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "#0f766e";
  if (raw.startsWith("#")) return raw;
  return NAMED_COLORS[raw.toLowerCase()] ?? "#0f766e";
}

export function resolveResourceIcon(name?: string | null): LucideIcon {
  if (!name) return FileText;
  return ICONS[name] ?? FileText;
}
