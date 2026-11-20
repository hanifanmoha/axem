"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { SettingsMenu } from "./SettingsMenu";

export function Topbar({ children }: { children?: ReactNode }) {
  const { t } = useI18n();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/" aria-label={t("topbar.homeAria")}>
          <span className="brand-mark" aria-hidden="true" />
          Axem
        </Link>
        {children}
        <SettingsMenu />
      </div>
    </header>
  );
}
