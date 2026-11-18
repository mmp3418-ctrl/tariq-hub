import { Clapperboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Mark } from "../brand/Mark.tsx";
import { useSiteSettings } from "../../services/siteSettings.tsx";

type PlaylistCoverProps = {
  src?: string | null;
  title?: string;
  className?: string;
};

/** Cover image with branded video fallback when empty or broken. */
export function PlaylistCover({
  src = "",
  title = "",
  className = "",
}: PlaylistCoverProps) {
  const { logoUrl = "" } = useSiteSettings() ?? {};
  const url = (src ?? "").trim();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  const showImage = Boolean(url) && !failed;

  return (
    <div
      className={`relative aspect-[16/9] w-full overflow-hidden rounded-xl ${className}`}
      aria-hidden={!title}
    >
      {showImage ? (
        <img
          src={url}
          alt={title || ""}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-[#0F172A] to-emerald-950/80">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <Clapperboard className="size-7 text-emerald-400" aria-hidden />
          </span>
          <Mark logoUrl={logoUrl} className="size-10 opacity-90" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
    </div>
  );
}
