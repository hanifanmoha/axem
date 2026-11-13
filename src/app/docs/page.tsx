import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation – Axem",
  description:
    "How to write a quiz bundle for Axem: Markdown index files, quiz files, multiple-choice questions, images, explanations, and how to host and share a bundle.",
};

const SAMPLE_URL =
  "https://raw.githubusercontent.com/hanifanmoha/axem/main/samples/index.md";
const sampleLink = `/?_s=${encodeURIComponent(Buffer.from(SAMPLE_URL).toString("base64"))}`;

const structureExample = `my-quiz-repo/
├── index.md                  <- root index (the URL you give to Axem)
├── english/
│   ├── index.md              <- sub-index
│   ├── tenses.quiz.md        <- quiz file
│   ├── verbs/
│   │   ├── index.md
│   │   └── irregular.quiz.md
│   └── assets/
│       └── clock.svg         <- image used by a quiz
└── math/
    ├── index.md
    └── geometry.quiz.md`;

const indexExample = `# Exam Preparation

- [English](english/index.md)
- [Math](math/index.md)`;

const quizExample = `---
format: axem/v1
type: quiz
title: English Tenses
---

## Present perfect

Which sentence uses the present perfect tense correctly?

- [x] She has finished her homework.
- [ ] She have finished her homework.
- [ ] She has finish her homework.

> **Explanation:** Use **has** with a singular subject and the past participle **finished**.

## Reading a clock

What time does this clock show?

![An analog clock showing eight o'clock](assets/clock.svg)

- [ ] 6:00
- [x] 8:00
- [ ] 10:00

> **Explanation:** The hour hand points to 8 and the minute hand points to 12.`;

const imageAnswerExample = `## Which shape is a triangle?

- [ ] ![A square](assets/square.png)
- [x] ![A triangle](assets/triangle.png)
- [ ] ![A circle](assets/circle.png)`;

const explanationExample = `> **Explanation:** The first line of the explanation.
> It can continue on the following lines,
> as long as each line starts with ">".`;

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
        </div>
      </header>

      <main className="docs">
        <article>
          <h1>Axem documentation</h1>
          <p className="lede">
            Axem is a renderer for exam and quiz practice. It does not store questions itself.
            Questions live in plain Markdown files that you host anywhere (for example, a GitHub
            repository), and Axem fetches and renders them from a URL.
          </p>

          <nav className="toc" aria-label="On this page">
            <strong>On this page</strong>
            <ol>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#hosting">Hosting a bundle</a></li>
              <li><a href="#structure">Bundle structure</a></li>
              <li><a href="#index-files">Index files</a></li>
              <li><a href="#quiz-files">Quiz files</a></li>
              <li><a href="#images">Images</a></li>
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
                Axem downloads the file in your browser. If it is an <strong>index</strong>, it
                lists the links it contains. If it is a <strong>quiz</strong>, it renders the
                questions.
              </li>
              <li>
                Clicking a link in an index loads that file, so a bundle can be nested as deeply as
                you like, for example subject → topic → quiz.
              </li>
            </ol>
            <p>
              There are two kinds of files, and Axem tells them apart by their content, not by
              their file name: a file whose front matter contains <code>type: quiz</code> is a
              quiz; every other Markdown file is an index.
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
              A bundle is a folder of Markdown files. You choose the depth. Each index file links to
              the next level, using paths relative to itself.
            </p>
            <pre><code>{structureExample}</code></pre>
            <p>
              File and folder names are free. Using the <code>.quiz.md</code> suffix for quiz files
              is only a convention that makes them easy to spot.
            </p>
          </section>

          <section id="index-files">
            <h2>Index files</h2>
            <p>
              An index file is a Markdown file that does <em>not</em> declare{" "}
              <code>type: quiz</code>. Axem reads two things from it:
            </p>
            <ul>
              <li>
                <strong>Title</strong>: the first level-1 heading (<code># Title</code>), or a{" "}
                <code>title</code> in the front matter.
              </li>
              <li>
                <strong>Links</strong>: every list item that consists of a Markdown link, written
                as <code>- [Label](path)</code> (or starting with <code>*</code>).
              </li>
            </ul>
            <pre><code>{indexExample}</code></pre>
            <p>
              A link can point to another index file, to a quiz file, or to a full URL on another
              host or repository. Other text in an index file is ignored by Axem, so it can double
              as a readable README on GitHub.
            </p>
          </section>

          <section id="quiz-files">
            <h2>Quiz files</h2>
            <p>A quiz file has two parts: front matter, then one section per question.</p>

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
                <tr><td><code>title</code></td><td>No</td><td>Name shown above the quiz. Falls back to the first <code># Heading</code>.</td></tr>
                <tr><td><code>format</code></td><td>Recommended</td><td>Format version. Use <code>axem/v1</code>.</td></tr>
              </tbody>
            </table>

            <h3>Questions</h3>
            <p>
              Each question starts with a level-2 heading (<code>## …</code>). The heading text is
              a label for you as the author; learners see numbered questions. Below the heading,
              in this order:
            </p>
            <ol>
              <li>
                The <strong>question text</strong>. Plain paragraphs, separated by blank lines.
                It may contain images.
              </li>
              <li>
                The <strong>options</strong>, written as a task list, one per line. Mark the
                correct option with <code>[x]</code> and the others with <code>[ ]</code>.
                Options are shown as A, B, C, D… in the order you write them.
              </li>
              <li>
                An optional <strong>explanation</strong>, written as a blockquote that starts with{" "}
                <code>Explanation:</code>. It is shown after the learner submits.
              </li>
            </ol>
            <pre><code>{`## Present perfect

Which sentence uses the present perfect tense correctly?

- [x] She has finished her homework.
- [ ] She have finished her homework.
- [ ] She has finish her homework.

> **Explanation:** Use **has** with a singular subject.`}</code></pre>
            <p>Rules to keep in mind:</p>
            <ul>
              <li>Mark exactly one option as correct. Currently only multiple choice is supported.</li>
              <li>Every option must fit on a single line.</li>
              <li>Put the explanation after the options. Text before the first option is treated as the question.</li>
              <li>
                Multi-line explanations are allowed; start every line with <code>&gt;</code>:
              </li>
            </ul>
            <pre><code>{explanationExample}</code></pre>

            <h3>Text formatting</h3>
            <p>
              Question text, options and explanations support <code>**bold**</code>,{" "}
              <code>*italic*</code>, <code>`inline code`</code>, line breaks, and images.
              Other Markdown (headings, tables, nested lists, links) is not rendered inside
              questions.
            </p>
          </section>

          <section id="images">
            <h2>Images</h2>
            <p>
              Use standard Markdown image syntax: <code>![alt text](path-or-url)</code>. Images
              work in the question text, in options, and in explanations.
            </p>
            <ul>
              <li>
                A <strong>relative path</strong> such as <code>assets/clock.svg</code> is resolved
                against the URL of the quiz file that contains it.
              </li>
              <li>
                A <strong>full URL</strong> is used as is.
              </li>
              <li>Always write meaningful alt text; it is read by screen readers.</li>
            </ul>
            <p>An image-only answer set looks like this:</p>
            <pre><code>{imageAnswerExample}</code></pre>
          </section>

          <section id="example">
            <h2>Complete example</h2>
            <p>
              <code>index.md</code>, the root file you give to Axem:
            </p>
            <pre><code>{indexExample}</code></pre>
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
                <tr><td>No <code>type: quiz</code></td><td>The file is rendered as an index of links.</td></tr>
                <tr><td><code># Title</code></td><td>Index title (and quiz title if there is no <code>title</code> key).</td></tr>
                <tr><td><code>- [Label](path)</code></td><td>A link card in an index.</td></tr>
                <tr><td><code>## Heading</code> in a quiz</td><td>The start of a new question.</td></tr>
                <tr><td><code>- [ ] text</code></td><td>An incorrect option.</td></tr>
                <tr><td><code>- [x] text</code></td><td>The correct option.</td></tr>
                <tr><td><code>&gt; **Explanation:** text</code></td><td>The explanation shown after submitting.</td></tr>
                <tr><td><code>![alt](path)</code></td><td>An image, resolved relative to the file.</td></tr>
              </tbody>
            </table>
          </section>

          <section id="sharing">
            <h2>Sharing a link</h2>
            <p>
              After a bundle loads, the address bar changes to{" "}
              <code>/?_s=&lt;base64&gt;</code>, where the value is the Base64-encoded source URL.
              Anyone who opens that address loads the same bundle automatically. You can build such
              a link yourself by Base64-encoding the URL of your root file.
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
              <dt>My quiz shows as a list of links, or as an empty index</dt>
              <dd>
                The front matter is missing <code>type: quiz</code>, or the file does not start with
                the <code>---</code> block.
              </dd>
              <dt>A question has no options</dt>
              <dd>
                Options must start with <code>- [ ]</code> or <code>- [x]</code> (a dash, a space,
                and brackets), each on its own line.
              </dd>
              <dt>An image does not appear</dt>
              <dd>
                Check that the path is relative to the quiz file, and that the image is served from
                a raw/public URL.
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
