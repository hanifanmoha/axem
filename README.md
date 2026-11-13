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

After a bundle is loaded, Axem updates the browser URL with `_s`, the
URL-safe search parameter containing the source URL as Base64. Sharing that
browser URL automatically loads the same bundle.

## Bundle format

Bundle indexes are regular Markdown documents containing Markdown links. Their
depth is unrestricted. A quiz document uses this front matter:

```md
---
format: axem/v1
type: quiz
title: A topic
---
```

Each `##` heading starts a question. Options use Markdown task-list syntax;
`[x]` marks the correct option. Images can be placed in question, option, or
explanation text using standard Markdown image syntax.