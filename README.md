# Axem

A Next.js renderer for Markdown-based exam-preparation bundles.

## Run locally

```bash
npm install
npm run dev
```

Supply a raw GitHub URL or another CORS-enabled URL to load a compatible
bundle. The repository's `samples/` directory is a reference bundle intended
to be published separately, such as through GitHub's raw-file URLs.

The home page `/` accepts a bundle URL. Axem then opens `/<base64url>`, where
the path segment is the URL-safe Base64-encoded source URL. Sharing that
address loads the same bundle. Only `/` has the URL form, so load a different
bundle from the home page.

## Bundle format

Every file is Markdown (GFM, with `$…$` / `$$…$$` math and images resolved
relative to the file). A file is a **quiz** if its front matter has
`type: quiz`; every other file, including `index.md`, is a **page**. Pages link
to each other with ordinary Markdown links; relative links open inside Axem.
Bundle depth is unrestricted.

```md
---
format: axem/v1
type: quiz
title: A topic
---

# problem:multiple_choice

## question

What is $1 + 1$?

## option

1

## option:correct

2

## explanation

Basic addition.
```

`# problem:<type>` starts a problem and `## question`, `## option`,
`## option:correct` and `## explanation` split it into sections. These
headings are structure only and are not rendered; each section is full
Markdown. See `/docs` in the app for the complete reference.