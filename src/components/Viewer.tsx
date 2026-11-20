"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BundleDocument, parseBundleDocument } from "@/lib/bundle";
import { useI18n } from "@/lib/i18n";
import { decodeSource } from "@/lib/source";
import { Markdown } from "@/components/Markdown";
import { Quiz } from "@/components/Quiz";

type Failure = { kind: "status"; status: number } | { kind: "network" } | { kind: "unknown" };

type Loaded = { url: string; document?: BundleDocument; failure?: Failure };

// A bad address is remembered as a flag, not a sentence, so switching language
// re-renders the message instead of leaving a stale one on screen.
function resolveSource(encoded: string): { url?: string; invalid?: boolean } {
  try {
    const url = decodeSource(encoded);
    if (!/^https?:\/\//i.test(url)) throw new Error();
    return { url };
  } catch {
    return { invalid: true };
  }
}

class HttpStatus extends Error {
  constructor(readonly status: number) {
    super(`The source responded with ${status}.`);
  }
}

export function Viewer({ encoded }: { encoded: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const resolved = useMemo(() => resolveSource(encoded), [encoded]);
  const url = resolved.url;
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!url) return;
    let active = true;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new HttpStatus(response.status);
        return parseBundleDocument(await response.text());
      })
      .then((document) => {
        if (active) setLoaded({ url, document });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const failure: Failure =
          reason instanceof HttpStatus
            ? { kind: "status", status: reason.status }
            : reason instanceof TypeError
              ? { kind: "network" }
              : { kind: "unknown" };
        setLoaded({ url, failure });
      });

    return () => {
      active = false;
    };
  }, [url]);

  const current = loaded?.url === url ? loaded : undefined;
  const failure = current?.failure;
  const error = resolved.invalid
    ? t("viewer.invalidAddress")
    : failure?.kind === "status"
      ? t("viewer.status", { status: failure.status })
      : failure?.kind === "network"
        ? t("viewer.network")
        : failure
          ? t("viewer.unknown")
          : undefined;
  const document = current?.document;

  return (
    <>
      <button
        className="back"
        type="button"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("viewer.back")}
      </button>

      {error && (
        <div className="notice error" role="alert">
          <strong>{t("viewer.errorTitle")}</strong>
          <p>{error}</p>
        </div>
      )}

      {url && !document && !error && <p className="loading">{t("viewer.loading")}</p>}

      {document?.kind === "page" && (
        <article className="md page" key={url}>
          <Markdown value={document.content} baseUrl={url!} />
        </article>
      )}

      {document?.kind === "quiz" && (
        <Quiz key={url} examId={encoded} title={document.title} questions={document.problems} baseUrl={url!} />
      )}
    </>
  );
}
