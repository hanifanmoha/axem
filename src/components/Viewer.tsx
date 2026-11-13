"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BundleDocument, parseBundleDocument } from "@/lib/bundle";
import { saveLastSource } from "@/lib/lastSource";
import { decodeSource } from "@/lib/source";
import { Markdown } from "@/components/Markdown";
import { Quiz } from "@/components/Quiz";

type Loaded = { url: string; document?: BundleDocument; error?: string };

function resolveSource(encoded: string): { url?: string; error?: string } {
  try {
    const url = decodeSource(encoded);
    if (!/^https?:\/\//i.test(url)) throw new Error();
    return { url };
  } catch {
    return { error: "The address does not contain a valid Base64URL-encoded bundle URL." };
  }
}

export function Viewer({ encoded }: { encoded: string }) {
  const router = useRouter();
  const resolved = useMemo(() => resolveSource(encoded), [encoded]);
  const url = resolved.url;
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!url) return;
    let active = true;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`The source responded with ${response.status}.`);
        return parseBundleDocument(await response.text());
      })
      .then((document) => {
        if (!active) return;
        saveLastSource(encoded);
        setLoaded({ url, document });
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setLoaded({
          url,
          error:
            reason instanceof TypeError
              ? "Could not reach that URL. Check the address, and that the host allows cross-origin requests."
              : reason instanceof Error
                ? reason.message
                : "Unable to load the bundle.",
        });
      });

    return () => {
      active = false;
    };
  }, [url, encoded]);

  const current = loaded?.url === url ? loaded : undefined;
  const error = resolved.error ?? current?.error;
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
        Back
      </button>

      {error && (
        <div className="notice error" role="alert">
          <strong>Couldn’t load that bundle</strong>
          <p>{error}</p>
        </div>
      )}

      {url && !document && !error && <p className="loading">Loading bundle…</p>}

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
