"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadLastSource } from "@/lib/lastSource";

export function Welcome() {
  // undefined until localStorage has been read, to avoid flashing the wrong content.
  const [last, setLast] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setLast(loadLastSource());
  }, []);

  return (
    <section className="welcome">
      <h1>Practice from any bundle.</h1>
      {last === undefined ? (
        <p aria-hidden="true">&nbsp;</p>
      ) : last ? (
        <p>Pick up where you left off, or paste another bundle URL above.</p>
      ) : (
        <p>
          Paste the URL of a Markdown quiz bundle, such as one hosted on GitHub. Axem fetches it
          and turns it into a focused practice session.
        </p>
      )}
      <div className="welcome-actions">
        {last && (
          <Link className="button primary" href={`/${last}`}>
            Load last source
          </Link>
        )}
        <Link className="button" href="/docs">
          Read the documentation
        </Link>
      </div>
    </section>
  );
}
