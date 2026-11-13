"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveLastSource } from "@/lib/lastSource";
import { encodeSource } from "@/lib/source";

export function SourceForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;
    const encoded = encodeSource(value);
    saveLastSource(encoded);
    router.push(`/${encoded}`);
  }

  return (
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
      <button className="button primary" type="submit" disabled={!url.trim()}>
        Load
      </button>
    </form>
  );
}
