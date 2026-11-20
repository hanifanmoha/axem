"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { loadResult, type Result } from "@/lib/attempt";
import { markdownSchema } from "@/lib/sanitize";
import { encodeSource } from "@/lib/source";

function resolve(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

// A link written as [label](path "quiz") shows the saved result of that quiz.
function QuizLink({ examId, children }: { examId: string; children: React.ReactNode }) {
  // Read after mount: localStorage is not available while rendering on the server.
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => setResult(loadResult(examId)), [examId]);

  const done = result !== null && result.correct === result.total;
  return (
    <span className="quiz-link">
      <span className={`quiz-status ${result ? (done ? "done" : "retry") : ""}`}>
        {result && (
          <svg viewBox="0 0 16 16" width="16" height="16" role="img" aria-label={done ? "Completed" : "Needs review"}>
            <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {done ? (
              <path d="m5 8.5 2 2 4-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
            )}
          </svg>
        )}
      </span>
      <Link href={`/${examId}`}>{children}</Link>
    </span>
  );
}

export function Markdown({ value, baseUrl }: { value: string; baseUrl: string }) {
  const components: Components = {
    a({ href, title, children }) {
      if (!href) return <>{children}</>;
      if (href.startsWith("#")) return <a href={href}>{children}</a>;
      if (/^(mailto|tel):/i.test(href)) return <a href={href}>{children}</a>;
      const absolute = resolve(href, baseUrl);
      if (/^https?:\/\//i.test(href)) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }
      if (!/^https?:\/\//i.test(absolute)) return <a href={href}>{children}</a>;
      const examId = encodeSource(absolute);
      if (title === "quiz") return <QuizLink examId={examId}>{children}</QuizLink>;
      return <Link href={`/${examId}`}>{children}</Link>;
    },
    img({ src, alt }) {
      const source = typeof src === "string" ? resolve(src, baseUrl) : undefined;
      return <img src={source} alt={alt ?? ""} loading="lazy" />;
    },
    table({ children }) {
      return (
        <div className="table-scroll">
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownSchema], rehypeKatex, rehypeSlug]}
      components={components}
    >
      {value}
    </ReactMarkdown>
  );
}
