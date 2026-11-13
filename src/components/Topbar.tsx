import Link from "next/link";
import type { ReactNode } from "react";

export function Topbar({ children }: { children?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label="Axem home">
          <span className="brand-mark" aria-hidden="true" />
          Axem
        </Link>
        {children}
      </div>
    </header>
  );
}
