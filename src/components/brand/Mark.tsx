import { useEffect, useState } from "react";

/** Bundled platform mark — always available from `public/logo.png`. */
export const PLATFORM_LOGO_SRC = "/logo.png";

type MarkProps = {
  /** Optional remote override from site settings; falls back to `/logo.png`. */
  logoUrl?: string | null;
  className?: string;
  alt?: string;
};

function DefaultMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0`} aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="8"
        fill="#13203a"
        stroke="#10B981"
        strokeOpacity="0.7"
      />
      <path
        d="M7 25.5V9.2C7 9.2 11.2 6.4 16.2 11.2C21.2 16 25.4 13.2 25.4 13.2"
        fill="none"
        stroke="#10B981"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="25.4" cy="13.2" r="1.45" fill="#10B981" />
      <path d="M7 25.5H15" stroke="#F3F0E8" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Mark({
  logoUrl = "",
  className = "h-10 w-auto",
  alt = "شعار المنصة",
}: MarkProps) {
  const preferred = (logoUrl ?? "").trim();
  const [src, setSrc] = useState(preferred || PLATFORM_LOGO_SRC);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(preferred || PLATFORM_LOGO_SRC);
    setFailed(false);
  }, [preferred]);

  if (failed) {
    return (
      <DefaultMark className={className.includes("size-") || className.includes("h-") ? className : "size-10"} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} shrink-0 object-contain`}
      loading="eager"
      decoding="async"
      onError={() => {
        if (src !== PLATFORM_LOGO_SRC) {
          setSrc(PLATFORM_LOGO_SRC);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
