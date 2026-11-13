import type { Metadata } from "next";
import Link from "next/link";
import { SettingsMenu } from "@/components/SettingsMenu";
import { encodeSource } from "@/lib/source";

export const metadata: Metadata = {
  title: "Documentation – Axem",
  description:
    "How to write a bundle for Axem: Markdown pages and links, quiz files with multiple-choice problems, math formulas, images, explanations, and how to host and share a bundle.",
};

const SAMPLE_URL =
  "https://raw.githubusercontent.com/hanifanmoha/axem/main/samples/index.md";
const sampleLink = `/${encodeSource(SAMPLE_URL)}`;

const structureExample = `my-bundle/
├── index.md                  <- root page (the URL you give to Axem)
├── english/
│   ├── index.md              <- sub-page
│   ├── materi-tenses.md      <- theory page
│   ├── tenses.quiz.md        <- quiz file
│   └── assets/
│       └── clock.svg         <- image used by a page or quiz
└── math/
    ├── index.md
    └── geometry.quiz.md`;

const pageExample = `# English

Welcome! Start with the theory, then practice.

## Materials

- [Tenses: the theory](materi-tenses.md)

## Exercises

- [Tenses quiz](tenses.quiz.md)

The area of a circle is $A = \\pi r^2$.`;

const quizExample = `---
format: axem/v1
type: quiz
title: "English: Tenses"
---

# problem:multiple_choice

## question

Which sentence uses the **present perfect** tense correctly?

## option:correct

She has finished her homework.

## option

She have finished her homework.

## option

She has finish her homework.

## explanation

Use **has** with a singular subject and the past participle **finished**.

# problem:multiple_choice

## question

What time does this clock show?

![An analog clock showing eight o'clock](assets/clock.svg)

## option

6:00

## option:correct

8:00

## explanation

The hour hand points to 8 and the minute hand points to 12.`;

const imageAnswerExample = `# problem:multiple_choice

## question

Which shape is a triangle?

## option

![A square](assets/square.png)

## option:correct

![A triangle](assets/triangle.png)

## option

![A circle](assets/circle.png)`;

const mathExample = `## question

What is the area of a circle with radius $r$?

## option:correct

$\\pi r^2$

## explanation

The area is:

$$A = \\pi r^2$$`;

export default function DocsPage() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true" />
            Axem
          </Link>
          <nav className="docs-nav" aria-label="Site">
            <Link className="button" href="/">
              Open the app
            </Link>
          </nav>
          <SettingsMenu />
        </div>
      </header>

      <main className="docs">
        <article>
          <h1>Give this docs url to your LLM</h1>
          <p className="lede">
            Axem is a renderer for exam and quiz practice. It does not store content itself.
            Pages and quizzes live in plain Markdown files that you host anywhere (for example, a
            GitHub repository), and Axem fetches and renders them from a URL.
          </p>

          <nav className="toc" aria-label="On this page">
            <strong>On this page</strong>
            <ol>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#hosting">Hosting a bundle</a></li>
              <li><a href="#structure">Bundle structure</a></li>
              <li><a href="#pages">Pages</a></li>
              <li><a href="#markdown">Markdown, math and images</a></li>
              <li><a href="#quiz-files">Quiz files</a></li>
              <li><a href="#example">Complete example</a></li>
              <li><a href="#reference">Format reference</a></li>
              <li><a href="#sharing">Sharing a link</a></li>
              <li><a href="#troubleshooting">Troubleshooting</a></li>
            </ol>
          </nav>

          <section id="how-it-works">
            <h2>How it works</h2>
            <ol>
              <li>You write Markdown files and publish them at a public URL.</li>
              <li>
                You paste the URL of the <strong>root file</strong> into Axem and press Load.
              </li>
              <li>
                Axem downloads the file in your browser. A <strong>page</strong> is rendered as
                Markdown; a <strong>quiz</strong> is rendered as an interactive practice session.
              </li>
              <li>
                Clicking a link inside a page loads the linked file, so a bundle can be nested as
                deeply as you like, for example subject → topic → theory or quiz.
              </li>
            </ol>
            <p>
              There are two kinds of files, and Axem tells them apart by their content, not by
              their file name: a file whose front matter contains <code>type: quiz</code> is a
              quiz; every other Markdown file is a page.
            </p>
            <p>
              Axem is meant for self-study, so it does not try to prevent peeking: the answers are
              part of the files the browser downloads.
            </p>
          </section>

          <section id="hosting">
            <h2>Hosting a bundle</h2>
            <p>
              Any HTTPS URL that returns the raw Markdown text and allows cross-origin requests
              (CORS) works. The easiest option is a public GitHub repository.
            </p>
            <h3>GitHub raw URLs</h3>
            <p>Use the raw file URL, not the normal GitHub page:</p>
            <pre><code>{`https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>/index.md`}</code></pre>
            <p>
              For example, the sample bundle in the Axem repository is at{" "}
              <a href={SAMPLE_URL}>{SAMPLE_URL}</a>.{" "}
              <Link href={sampleLink}>Open the sample bundle in Axem</Link>.
            </p>
            <p>
              URLs of the form <code>https://github.com/&lt;owner&gt;/&lt;repo&gt;/blob/…</code>{" "}
              return an HTML page and will not work. GitHub Pages and any other static host also
              work as long as they send CORS headers.
            </p>
            <p>
              <code>file://</code> URLs are not supported, because browsers block web pages from
              reading local files.
            </p>
          </section>

          <section id="structure">
            <h2>Bundle structure</h2>
            <p>
              A bundle is a folder of Markdown files. You choose the depth. Pages link to the next
              level using ordinary Markdown links, with paths relative to the page.
            </p>
            <pre><code>{structureExample}</code></pre>
            <p>
              File and folder names are free. Using the <code>.quiz.md</code> suffix for quiz files
              is only a convention that makes them easy to spot.
            </p>
          </section>

          <section id="pages">
            <h2>Pages</h2>
            <p>
              A page is any Markdown file that does <em>not</em> declare <code>type: quiz</code>.
              It can hold anything Markdown can: theory, study notes, a table of contents, or just
              a list of links. <code>index.md</code> is not special; it is a page like any other.
            </p>
            <pre><code>{pageExample}</code></pre>
            <ul>
              <li>
                <strong>Title</strong>: the <code>title</code> in the optional front matter, or
                otherwise the first level-1 heading.
              </li>
              <li>
                <strong>Links</strong> are plain Markdown links, <code>[label](path)</code>. A
                relative link to another file opens that file inside Axem. A full{" "}
                <code>https://</code> link opens in a new tab as a normal website. Links starting with <code>#</code> jump to a heading on the same page.
              </li>
            </ul>
          </section>

          <section id="markdown">
            <h2>Markdown, math and images</h2>
            <p>
              Pages and every part of a quiz (question, options, explanation) are rendered as
              Markdown with GitHub-flavoured extensions: headings, lists, tables, task lists,
              blockquotes, code blocks, bold, italic and strikethrough. Raw HTML is not rendered.
            </p>
            <h3>Math formulas</h3>
            <p>
              Write LaTeX between single dollar signs for inline math, such as{" "}
              <code>$x^2 + y^2 = z^2$</code>, and between double dollar signs for a centred block:
            </p>
            <pre><code>{`$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$`}</code></pre>
            <p>Formulas work in pages, questions, options and explanations.</p>
            <h3>Images</h3>
            <p>
              Use standard Markdown image syntax: <code>![alt text](path-or-url)</code>. A{" "}
              <strong>relative path</strong> such as <code>assets/clock.svg</code> is resolved
              against the URL of the file that contains it; a <strong>full URL</strong> is used as
              is. Always write meaningful alt text.
            </p>
          </section>

          <section id="quiz-files">
            <h2>Quiz files</h2>
            <p>
              A quiz file has front matter followed by any number of problems. Each problem is
              written with headings; the headings are structure only and are never shown to the
              learner.
            </p>

            <h3>Front matter</h3>
            <p>
              The file must start with a block delimited by <code>---</code> lines. Each line is{" "}
              <code>key: value</code> on a single line.
            </p>
            <table>
              <thead>
                <tr><th>Key</th><th>Required</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td><code>type</code></td><td>Yes</td><td>Must be <code>quiz</code>. This is what makes the file a quiz.</td></tr>
                <tr><td><code>title</code></td><td>Recommended</td><td>Name shown above the quiz. Defaults to “Untitled quiz”.</td></tr>
                <tr><td><code>format</code></td><td>Recommended</td><td>Format version. Use <code>axem/v1</code>.</td></tr>
              </tbody>
            </table>

            <h3>Problems</h3>
            <p>
              A problem starts with a level-1 heading <code># problem:multiple_choice</code>. The
              type after the colon selects the problem kind; more types may come later. Inside a
              problem, level-2 headings split the content into sections:
            </p>
            <table>
              <thead>
                <tr><th>Heading</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td><code>## question</code></td><td>The question, as Markdown. Required.</td></tr>
                <tr><td><code>## option</code></td><td>An incorrect option, as Markdown.</td></tr>
                <tr><td><code>## option:correct</code></td><td>The correct option, as Markdown. Exactly one per problem.</td></tr>
                <tr><td><code>## explanation</code></td><td>Optional. Shown after the learner submits.</td></tr>
              </tbody>
            </table>
            <p>
              Options are shown as A, B, C, D… in the order you write them. Because each section
              is full Markdown, questions and options can span several lines and contain lists,
              tables, formulas and images.
            </p>
            <ul>
              <li>
                <code># problem:…</code> and the four <code>##</code> headings above are reserved.
                Use <code>###</code> or deeper headings inside a section if you need headings.
              </li>
              <li>Text before the first <code># problem:</code> is ignored.</li>
              <li>
                A malformed problem (missing question, no options, no or several correct options,
                unknown type or unknown heading) is not hidden: Axem shows an error for that
                problem so you can fix it.
              </li>
            </ul>

            <h3>Math and images in problems</h3>
            <pre><code>{mathExample}</code></pre>
            <p>An image-only answer set looks like this:</p>
            <pre><code>{imageAnswerExample}</code></pre>
          </section>

          <section id="example">
            <h2>Complete example</h2>
            <p>
              <code>index.md</code>, the root page you give to Axem:
            </p>
            <pre><code>{pageExample}</code></pre>
            <p>
              <code>english/tenses.quiz.md</code>:
            </p>
            <pre><code>{quizExample}</code></pre>
            <p>
              The real files are in the{" "}
              <a href="https://github.com/hanifanmoha/axem/tree/main/samples">
                samples folder
              </a>{" "}
              of the repository.
            </p>
          </section>

          <section id="reference">
            <h2>Format reference</h2>
            <table>
              <thead>
                <tr><th>You write</th><th>Axem shows</th></tr>
              </thead>
              <tbody>
                <tr><td><code>type: quiz</code> in front matter</td><td>The file is rendered as a quiz.</td></tr>
                <tr><td>No <code>type: quiz</code></td><td>The file is rendered as a Markdown page.</td></tr>
                <tr><td><code>[label](path)</code></td><td>A link; relative links open in Axem.</td></tr>
                <tr><td><code># problem:multiple_choice</code></td><td>The start of a problem (not shown).</td></tr>
                <tr><td><code>## question</code></td><td>The question text.</td></tr>
                <tr><td><code>## option</code></td><td>An incorrect option.</td></tr>
                <tr><td><code>## option:correct</code></td><td>The correct option.</td></tr>
                <tr><td><code>## explanation</code></td><td>The explanation shown after submitting.</td></tr>
                <tr><td><code>$…$</code> and <code>$$…$$</code></td><td>Inline and block math.</td></tr>
                <tr><td><code>![alt](path)</code></td><td>An image, resolved relative to the file.</td></tr>
              </tbody>
            </table>
          </section>

          <section id="sharing">
            <h2>Sharing a link</h2>
            <p>
              Each page or quiz has its own address, <code>/&lt;base64url&gt;</code>, where the
              value is the URL-safe Base64-encoded source URL (no padding). Anyone who opens that
              address loads the same file directly. You can build such a link yourself by
              Base64URL-encoding the URL of your root file.
            </p>
          </section>

          <section id="troubleshooting">
            <h2>Troubleshooting</h2>
            <dl>
              <dt>“Could not reach that URL”</dt>
              <dd>
                The host is unreachable or does not allow cross-origin requests. Use a raw GitHub
                URL or enable CORS on your host.
              </dd>
              <dt>The server responded with 404</dt>
              <dd>Check the branch name and path. Raw URLs are case-sensitive.</dd>
              <dt>My quiz shows as a plain page</dt>
              <dd>
                The front matter is missing <code>type: quiz</code>, or the file does not start with
                the <code>---</code> block.
              </dd>
              <dt>“This problem is malformed”</dt>
              <dd>
                Read the message: each problem needs a <code>## question</code>, at least one{" "}
                <code>## option</code> and exactly one <code>## option:correct</code>, and may only
                use the reserved headings listed above.
              </dd>
              <dt>An image does not appear</dt>
              <dd>
                Check that the path is relative to the file that contains it, and that the image is
                served from a raw/public URL.
              </dd>
              <dt>Changes I pushed are not visible</dt>
              <dd>
                Raw GitHub content is cached for a few minutes. Wait briefly and reload.
              </dd>
            </dl>
          </section>
        </article>
      </main>
    </>
  );
}
