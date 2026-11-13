"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { encodeSource } from "@/lib/source";

function resolve(href: string, baseUrl: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

export function Markdown({ value, baseUrl }: { value: string; baseUrl: string }) {
  const components: Components = {
    a({ href, children }) {
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
      return <Link href={`/${encodeSource(absolute)}`}>{children}</Link>;
    },
    img({ src, alt }) {
      const source = typeof src === "string" ? resolve(src, baseUrl) : undefined;
      return <img src={source} alt={alt ?? ""} loading="lazy" />;
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeSlug]}
      components={components}
    >
      {value}
    </ReactMarkdown>
  );
}
