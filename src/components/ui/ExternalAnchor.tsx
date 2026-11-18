import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  externalLinkProps,
  normalizeExternalHref,
  normalizeMediaHref,
} from "../../lib/contactLinks.ts";

type ExternalAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
  /** Optional platform/icon hint for WhatsApp / Telegram / phone / email normalization. */
  kind?: string;
};

/**
 * Renders only absolute/safe external (or mailto/tel) links so relative
 * strings never get treated as missing React Router pages.
 */
export function ExternalAnchor({ href, children, kind = "", className, ...rest }: ExternalAnchorProps) {
  const safeHref =
    normalizeExternalHref(href, kind) ||
    (kind === "pdf" || kind === "file" ? normalizeMediaHref(href) : "") ||
    normalizeMediaHref(href);
  if (!safeHref) return null;

  return (
    <a href={safeHref} className={className} {...externalLinkProps(safeHref)} {...rest}>
      {children}
    </a>
  );
}
