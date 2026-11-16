import type { ReactNode } from "react";

export function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

