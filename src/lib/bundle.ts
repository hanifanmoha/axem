import type { Heading, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";

export type Option = {
  text: string;
  correct: boolean;
};

export type Problem = {
  type: "multiple_choice";
  question: string;
  options: Option[];
  explanation?: string;
  error?: string;
};

export type BundleDocument =
  | { kind: "page"; title: string; content: string }
  | { kind: "quiz"; title: string; problems: Problem[] };

const parser = unified().use(remarkParse);

function frontMatter(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { fields: new Map<string, string>(), body: markdown };

  const fields = new Map(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([^:]+):\s*(.+)$/))
      .filter((entry): entry is RegExpMatchArray => entry !== null)
      .map(([, key, value]): [string, string] => [key.trim(), value.trim().replace(/^(["'])(.*)\1$/, "$2")]),
  );

  return { fields, body: markdown.slice(match[0].length) };
}

function textOf(node: { value?: string; children?: unknown[] }): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map((child) => textOf(child as typeof node)).join("");
}

function headingText(heading: Heading) {
  return textOf(heading).trim();
}

function firstHeading(tree: Root) {
  const heading = tree.children.find(
    (node): node is Heading => node.type === "heading" && node.depth === 1,
  );
  return heading ? headingText(heading) || undefined : undefined;
}

type Section = { name: string; start: number; end: number };

function finishProblem(type: string, sections: Section[], body: string, errors: string[]): Problem {
  const problem: Problem = { type: "multiple_choice", question: "", options: [] };
  const slice = (section: Section) => body.slice(section.start, section.end).trim();
  const fail = (message: string) => errors.push(message);

  if (type !== "multiple_choice") fail(`Unsupported problem type "${type}".`);

  for (const section of sections) {
    if (section.name === "question") {
      if (problem.question) fail("More than one question section.");
      else problem.question = slice(section);
    } else if (section.name === "option" || section.name === "option:correct") {
      problem.options.push({ text: slice(section), correct: section.name === "option:correct" });
    } else if (section.name === "explanation") {
      if (problem.explanation) fail("More than one explanation section.");
      else problem.explanation = slice(section) || undefined;
    } else {
      fail(`Unknown section "## ${section.name}". Level 1 and 2 headings are reserved.`);
    }
  }

  if (!problem.question) fail("Missing a non-empty `## question` section.");
  if (problem.options.length === 0) fail("Missing `## option` sections.");
  else if (problem.options.some((option) => !option.text)) fail("An option is empty.");
  const correct = problem.options.filter((option) => option.correct).length;
  if (problem.options.length > 0 && correct === 0) fail("No `## option:correct` section.");
  if (correct > 1) fail("More than one `## option:correct`. Only one correct option is supported.");

  if (errors.length > 0) problem.error = errors.join(" ");
  return problem;
}

function parseProblems(body: string): Problem[] {
  const tree = parser.parse(body) as Root;
  const problems: Problem[] = [];

  let type: string | undefined;
  let sections: Section[] = [];
  let errors: string[] = [];
  let open: Section | undefined;

  const closeProblem = () => {
    if (type !== undefined) problems.push(finishProblem(type, sections, body, errors));
    type = undefined;
    sections = [];
    errors = [];
    open = undefined;
  };

  for (const node of tree.children) {
    const start = node.position!.start.offset!;
    const end = node.position!.end.offset!;

    if (node.type === "heading" && node.depth <= 2) {
      if (open) open.end = start;
      const text = headingText(node);

      if (node.depth === 1) {
        closeProblem();
        const match = text.match(/^problem:\s*(\S+)$/i);
        if (match) type = match[1].toLowerCase();
        else if (text) problems.push({ type: "multiple_choice", question: "", options: [], error: `Unknown heading "# ${text}". Expected "# problem:<type>".` });
        continue;
      }

      if (type === undefined) continue;
      open = { name: text.toLowerCase().replace(/\s+/g, ""), start: end, end };
      sections.push(open);
      continue;
    }

    if (open) open.end = end;
  }

  closeProblem();
  return problems;
}

export function parseBundleDocument(markdown: string): BundleDocument {
  const { fields, body } = frontMatter(markdown);

  if (fields.get("type") === "quiz") {
    return {
      kind: "quiz",
      title: fields.get("title") ?? "Untitled quiz",
      problems: parseProblems(body),
    };
  }

  const title = fields.get("title") ?? firstHeading(parser.parse(body) as Root) ?? "Untitled page";
  return { kind: "page", title, content: body };
}
