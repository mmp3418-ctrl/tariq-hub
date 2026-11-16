type MarkProps = {
  logoUrl?: string;
  className?: string;
};

export function Mark({ logoUrl = "", className = "size-9" }: MarkProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={`${className} shrink-0 rounded-lg object-contain bg-white/90 p-0.5 dark:bg-white/10`}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={`${className} shrink-0`} aria-hidden="true">
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#13203a" stroke="#10B981" strokeOpacity="0.7" />
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
