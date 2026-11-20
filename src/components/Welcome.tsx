"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { loadLastSource } from "@/lib/lastSource";

export function Welcome() {
  const { t } = useI18n();
  // undefined until localStorage has been read, to avoid flashing the wrong content.
  const [last, setLast] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setLast(loadLastSource());
  }, []);

  return (
    <section className="welcome">
      <h1>{t("welcome.heading")}</h1>
      {last === undefined ? (
        <p aria-hidden="true">&nbsp;</p>
      ) : last ? (
        <p>{t("welcome.withLast")}</p>
      ) : (
        <p>{t("welcome.firstTime")}</p>
      )}
      <div className="welcome-actions">
        {last && (
          <Link className="button primary" href={`/${last}`}>
            {t("welcome.loadLast")}
          </Link>
        )}
        <Link className="button" href="/docs">
          {t("welcome.docs")}
        </Link>
      </div>
    </section>
  );
}
