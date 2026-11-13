"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BundleDocument, parseBundleDocument } from "@/lib/bundle";
import { Quiz } from "@/components/Quiz";


function encodeSourceUrl(sourceUrl: string) {
  const bytes = new TextEncoder().encode(sourceUrl);
  return btoa(String.fromCharCode(...bytes));
}

function decodeSourceUrl(encodedSourceUrl: string) {
  const bytes = Uint8Array.from(atob(encodedSourceUrl), (character) =>
    character.charCodeAt(0),
  );
  return new TextDecoder().decode(bytes);
}

type Navigation = "push" | "none";

export default function Home() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<string>();
  const [document, setDocument] = useState<BundleDocument>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [canGoBack, setCanGoBack] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (sourceUrl: string, navigation: Navigation) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`The source responded with ${response.status}.`);
      const parsed = parseBundleDocument(await response.text(), response.url || sourceUrl);
      if (id !== requestId.current) return;

      setDocument(parsed);
      setSource(sourceUrl);
      setUrl(sourceUrl);

      if (navigation === "push") {
        const depth = (window.history.state?.depth ?? 0) + 1;
        const params = new URLSearchParams({ _s: encodeSourceUrl(sourceUrl) });
        window.history.pushState({ depth }, "", `?${params}`);
      }
      setCanGoBack((window.history.state?.depth ?? 0) > 0);
      window.scrollTo({ top: 0 });
    } catch (reason) {
      if (id !== requestId.current) return;
      setError(
        reason instanceof TypeError
          ? "Could not reach that URL. Check the address, and that the host allows cross-origin requests."
          : reason instanceof Error
            ? reason.message
            : "Unable to load the bundle.",
      );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  const restore = useCallback(() => {
    const encoded = new URLSearchParams(window.location.search).get("_s");
    setCanGoBack((window.history.state?.depth ?? 0) > 0);

    if (!encoded) {
      requestId.current++;
      setDocument(undefined);
      setSource(undefined);
      setError(undefined);
      setLoading(false);
      setUrl("");
      return;
    }

    try {
      void load(decodeSourceUrl(encoded), "none");
    } catch {
      setError("The _s parameter does not contain a valid Base64 URL.");
    }
  }, [load]);

  useEffect(() => {
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [restore]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = url.trim();
    if (value) void load(value, "push");
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="brand"
            type="button"
            aria-label="Axem home"
            onClick={() => {
              window.history.pushState({ depth: 0 }, "", window.location.pathname);
              restore();
            }}
          >
            <span className="brand-mark" aria-hidden="true" />
            Axem
          </button>
          <form onSubmit={submit} className="source-form">
            <input
              aria-label="Bundle URL"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="Paste a bundle URL (https://…)"
              value={url}
            />
            <button className="button primary" type="submit" disabled={loading || !url.trim()}>
              {loading ? "Loading" : "Load"}
            </button>
          </form>
        </div>
      </header>

      <main>
        {canGoBack && (
          <button className="back" type="button" onClick={() => window.history.back()}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}

        {error && (
          <div className="notice error" role="alert">
            <strong>Couldn’t load that bundle</strong>
            <p>{error}</p>
          </div>
        )}

        {!document && !error && !loading && (
          <section className="welcome">
            <h1>Practice from any bundle.</h1>
            <p>
              Paste the URL of a Markdown quiz bundle, such as one hosted on GitHub. Axem fetches it
              and turns it into a focused practice session.
            </p>
            <Link className="button" href="/docs">
              Read the documentation
            </Link>
          </section>
        )}

        {loading && !document && <p className="loading">Loading bundle…</p>}

        {document?.kind === "index" && (
          <section className="index" key={source}>
            <h1>{document.title}</h1>
            {document.links.length ? (
              <nav className="cards" aria-label={document.title}>
                {document.links.map((link, index) => (
                  <button
                    key={link.url}
                    type="button"
                    className="card"
                    style={{ "--i": index } as React.CSSProperties}
                    onClick={() => void load(link.url, "push")}
                  >
                    <span>{link.label}</span>
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                      <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </nav>
            ) : (
              <p className="notice">No bundle links were found in this document.</p>
            )}
          </section>
        )}

        {document?.kind === "quiz" && (
          <Quiz key={source} title={document.title} questions={document.questions} />
        )}
      </main>
    </>
  );
}
