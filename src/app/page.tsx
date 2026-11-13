"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
  BundleDocument,
  Choice,
  Question,
  parseBundleDocument,
} from "@/lib/bundle";

function Markdown({ value }: { value: string }): ReactNode {
  const parts = value.split(/(!\[[^\]]*]\([^)]+\))/g);

  return parts.map((part, index) => {
    const image = part.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
    if (image) {
      return <img key={index} src={image[2]} alt={image[1]} />;
    }

    return part.split("\n").map((line, lineIndex) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < part.split("\n").length - 1 && <br />}
      </span>
    ));
  });
}

function Answer({ choice, revealed }: { choice: Choice; revealed: boolean }) {
  const [selected, setSelected] = useState(false);
  const className = revealed
    ? choice.correct
      ? "answer correct"
      : selected
        ? "answer incorrect"
        : "answer"
    : selected
      ? "answer selected"
      : "answer";

  return (
    <button className={className} onClick={() => setSelected(true)} type="button">
      <Markdown value={choice.text} />
    </button>
  );
}

function Quiz({ title, questions }: { title: string; questions: Question[] }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <section>
      <h1>{title}</h1>
      <p className="summary">{questions.length} questions</p>
      {questions.map((question, index) => (
        <article className="question" key={`${question.title}-${index}`}>
          <h2>{index + 1}. {question.title}</h2>
          <div className="prompt"><Markdown value={question.prompt} /></div>
          <div className="answers">
            {question.choices.map((choice, choiceIndex) => (
              <Answer choice={choice} revealed={revealed} key={choiceIndex} />
            ))}
          </div>
          {revealed && question.explanation && (
            <p className="explanation"><strong>Explanation:</strong> <Markdown value={question.explanation} /></p>
          )}
        </article>
      ))}
      <button className="reveal" type="button" onClick={() => setRevealed(true)}>
        Reveal answers
      </button>
    </section>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [document, setDocument] = useState<BundleDocument>();
  const [error, setError] = useState<string>();

  async function load(sourceUrl: string) {
    setError(undefined);
    setDocument(undefined);
    try {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setDocument(parseBundleDocument(await response.text(), response.url));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load bundle.");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(url);
  }

  return (
    <main>
      <header>
        <p className="eyebrow">AXEM</p>
        <h1>Study from any compatible bundle.</h1>
        <form onSubmit={submit}>
          <input
            aria-label="Bundle URL"
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://raw.githubusercontent.com/owner/repo/main/samples/index.md"
            type="url"
            value={url}
          />
          <button type="submit">Load</button>
        </form>
        <p className="hint">Use a raw GitHub URL or another CORS-enabled Markdown source.</p>
      </header>

      {error && <p className="error">{error}</p>}
      {document?.kind === "index" && (
        <section>
          <h2>{document.title}</h2>
          {document.links.length ? (
            <nav className="bundle-links">
              {document.links.map((link) => (
                <button key={link.url} type="button" onClick={() => {
                  setUrl(link.url);
                  void load(link.url);
                }}>
                  {link.label}
                </button>
              ))}
            </nav>
          ) : (
            <p>No bundle links were found in this document.</p>
          )}
        </section>
      )}
      {document?.kind === "quiz" && <Quiz title={document.title} questions={document.questions} />}
    </main>
  );
}
